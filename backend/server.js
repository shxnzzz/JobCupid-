const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_PATH = process.env.PYTHON_PATH || "python";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const PARSER_TIMEOUT_MS = 60 * 1000;

const ADZUNA_API_ID = process.env.ADZUNA_API_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const missingEnv = ["ADZUNA_API_ID", "ADZUNA_API_KEY", "OPENAI_API_KEY"].filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.warn(`Missing environment variables: ${missingEnv.join(", ")}. See .env.example.`);
}

// CORS: only allow the configured frontend origin(s)
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Requests without an Origin header (curl, server-to-server) are allowed
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
}));
app.use(express.json({ limit: "100kb" }));

// Uploaded resumes are temporary; clear anything left over from a previous crash
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
for (const leftover of fs.readdirSync(uploadDir)) {
    fs.rm(path.join(uploadDir, leftover), { force: true, recursive: true }, () => {});
}

const upload = multer({
    dest: uploadDir,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
        const isPdfType = file.mimetype === "application/pdf";
        const isPdfName = path.extname(file.originalname).toLowerCase() === ".pdf";
        if (isPdfType && isPdfName) {
            return cb(null, true);
        }
        const err = new Error("Only PDF files are supported.");
        err.code = "UNSUPPORTED_FILE_TYPE";
        cb(err);
    },
});

function deleteFile(filePath) {
    fs.rm(filePath, { force: true }, (err) => {
        if (err) console.error("Failed to delete uploaded file:", filePath, err.message);
    });
}

// The PDF spec allows the "%PDF-" header anywhere in the first 1024 bytes
function hasPdfSignature(filePath) {
    const buffer = Buffer.alloc(1024);
    const fd = fs.openSync(filePath, "r");
    let bytesRead;
    try {
        bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    } finally {
        fs.closeSync(fd);
    }
    return buffer.subarray(0, bytesRead).includes("%PDF-");
}

function runParser(filePath) {
    const pythonScript = path.join(__dirname, "resume_parser", "parser.py");
    return new Promise((resolve) => {
        execFile(
            PYTHON_PATH,
            [pythonScript, filePath],
            { timeout: PARSER_TIMEOUT_MS, maxBuffer: 1024 * 1024, windowsHide: true },
            (error, stdout, stderr) => {
                // Python libraries often log warnings to stderr, so only the exit code decides success
                if (stderr) console.warn("Parser stderr:", stderr.trim());
                let output = null;
                try {
                    output = stdout && stdout.trim() ? JSON.parse(stdout) : null;
                } catch {
                    output = null;
                }
                resolve({ ok: !error, error, output });
            }
        );
    });
}

// Upload and parse resume
app.post("/upload", (req, res) => {
    upload.single("resume")(req, res, async (uploadError) => {
        if (uploadError) {
            if (req.file) deleteFile(req.file.path);
            if (uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ error: "File is too large. The maximum size is 2MB." });
            }
            if (uploadError.code === "UNSUPPORTED_FILE_TYPE") {
                return res.status(415).json({ error: uploadError.message });
            }
            console.error("Upload error:", uploadError.message);
            return res.status(400).json({ error: "Upload failed. Please try again." });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const filePath = req.file.path;
        try {
            if (req.file.size === 0) {
                return res.status(400).json({ error: "This file is empty." });
            }
            if (!hasPdfSignature(filePath)) {
                return res.status(415).json({ error: "This file doesn't look like a valid PDF." });
            }

            const result = await runParser(filePath);

            if (!result.ok) {
                if (result.error && result.error.killed) {
                    console.error("Parser timed out.");
                    return res.status(504).json({ error: "Reading your resume took too long. Please try again." });
                }
                // Exit code 2 means the parser produced a message that is safe to show the user
                if (result.error && result.error.code === 2 && result.output && result.output.error) {
                    return res.status(422).json({ error: result.output.error });
                }
                console.error("Parser failed:", result.error && result.error.message);
                return res.status(500).json({ error: "We couldn't read your resume. Please try again." });
            }

            if (!result.output) {
                console.error("Parser returned no usable output.");
                return res.status(500).json({ error: "We couldn't read your resume. Please try again." });
            }

            return res.json(result.output);
        } catch (err) {
            console.error("Unexpected upload error:", err.message);
            return res.status(500).json({ error: "Something went wrong. Please try again." });
        } finally {
            deleteFile(filePath);
        }
    });
});

// Fetch jobs from Adzuna API
async function fetchJobsForSkill(skill) {
    try {
        console.log(`Fetching jobs for skill: "${skill}"`);

        const response = await axios.get(
            `https://api.adzuna.com/v1/api/jobs/sg/search/1`,
            {
                params: {
                    app_id: ADZUNA_API_ID,
                    app_key: ADZUNA_API_KEY,
                    what: skill,
                    results_per_page: 5,
                },
                timeout: 10000,
            }
        );

        if (!response.data || !response.data.results) {
            console.warn(`No results found for skill: "${skill}"`);
            return [];
        }

        return response.data.results.map((job) => ({
            title: job.title,
            company: job.company ? job.company.display_name : "Unknown",
            location: job.location ? job.location.display_name : "Remote",
            url: job.redirect_url,
            foundBy: skill,
        }));
    } catch (error) {
        console.error(`API Error for skill "${skill}":`, error.message);
        return [];
    }
}

// Fetch job listings
app.post("/fetch-jobs", async (req, res) => {
    const { skills } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ error: "No skills provided" });
    }
    if (!ADZUNA_API_ID || !ADZUNA_API_KEY) {
        return res.status(503).json({ error: "Job search is not configured on the server." });
    }

    let allJobs = [];
    for (const skill of skills) {
        const skillJobs = await fetchJobsForSkill(skill);
        allJobs = allJobs.concat(skillJobs);
    }

    allJobs = allJobs.map(job => {
        let score = 0;
        const matchedSkills = [];
        skills.forEach(skill => {
            if (job.title.toLowerCase().includes(skill.toLowerCase())) {
                score += 5;
                matchedSkills.push(skill);
            }
        });
        return { ...job, score, matchedSkills };
    });

    allJobs.sort((a, b) => b.score - a.score);
    res.json({ jobs: allJobs });
});

// Generate cover letter using GPT
app.post("/generate-cover-letter", async (req, res) => {
    const { name, email, phone, jobTitle, company, skills } = req.body;

    if (!name || !email || !phone || !jobTitle || !company || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ error: "Missing required user details or job information" });
    }
    if (!OPENAI_API_KEY) {
        return res.status(503).json({ error: "Cover letter generation is not configured on the server." });
    }

    const today = new Date().toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" });
    const userInfo = `
${name}
${email}
${phone}
${today}`;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an AI that generates professional cover letters." },
                    {
                        role: "user",
                        content: `Generate a personalized cover letter for a ${jobTitle} position at ${company}. The candidate has the following skills: ${skills.join(", ")}.

The cover letter should include the following user details:
${userInfo}

Ensure that all placeholders like [Your Name], [Your Email], etc., are properly replaced with the user's details. Do not include placeholders for a postal address. If a detail is "Not provided", leave that line out entirely.
`
                    }
                ],
                temperature: 0.7
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, timeout: 60000 }
        );

        res.json({ coverLetter: response.data.choices[0].message.content });
    } catch (error) {
        console.error("Error generating cover letter:", error.message);
        res.status(502).json({ error: "Failed to generate cover letter" });
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Never send stack traces to the client
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON in request body." });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Request body is too large." });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Allowed frontend origin(s): ${allowedOrigins.join(", ")}`);
});
