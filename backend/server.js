require("dotenv").config();

const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { rateLimit } = require("express-rate-limit");
const { extractProfile, writeCoverLetter, AiUnavailableError } = require("./lib/openai");
const { findMatchingJobs, isAdzunaConfigured } = require("./lib/jobs");

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_PATH = process.env.PYTHON_PATH || "python";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const PARSER_TIMEOUT_MS = 60 * 1000;

const missingEnv = ["ADZUNA_API_ID", "ADZUNA_API_KEY", "OPENAI_API_KEY"].filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.warn(`Missing environment variables: ${missingEnv.join(", ")}. See .env.example.`);
}

// Needed behind a hosting proxy (Render, Railway, etc.) so rate limits see the real client IP
if (process.env.TRUST_PROXY) {
    app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
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

// Every AI-backed request costs money, so cap requests per IP
function limiter(limit, windowMinutes, message) {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (req, res) => res.status(429).json({ error: message }),
    });
}
const uploadLimiter = limiter(10, 60, "You've uploaded a lot of resumes in the last hour. Please try again later.");
const jobsLimiter = limiter(40, 60, "Too many searches in the last hour. Please try again later.");
const coverLetterLimiter = limiter(20, 60, "You've written a lot of cover letters in the last hour. Please try again later.");

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
            { timeout: PARSER_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, windowsHide: true },
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

function describeAiError(err) {
    if (err instanceof AiUnavailableError) return err.message;
    if (err.response) return `OpenAI ${err.response.status}: ${JSON.stringify(err.response.data).slice(0, 300)}`;
    return err.message;
}

const AI_UNAVAILABLE_MESSAGE = "Our AI service is unavailable right now, so we can't analyse your resume. Please try again in a few minutes.";

// Upload a resume, extract its text, and have the AI build a profile from it
app.post("/upload", uploadLimiter, (req, res) => {
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
        let resumeText;
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

            if (!result.output || typeof result.output.text !== "string") {
                console.error("Parser returned no usable output.");
                return res.status(500).json({ error: "We couldn't read your resume. Please try again." });
            }
            resumeText = result.output.text;
        } catch (err) {
            console.error("Unexpected upload error:", err.message);
            return res.status(500).json({ error: "Something went wrong. Please try again." });
        } finally {
            deleteFile(filePath);
        }

        try {
            const profile = await extractProfile(resumeText);
            return res.json(profile);
        } catch (err) {
            console.error("Profile extraction failed:", describeAiError(err));
            return res.status(503).json({ error: AI_UNAVAILABLE_MESSAGE });
        }
    });
});

function cleanStringArray(value, maxItems, maxLength = 60) {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item) => typeof item === "string")
        .map((item) => item.replace(/\s+/g, " ").trim().slice(0, maxLength))
        .filter(Boolean)
        .slice(0, maxItems);
}

// Search for jobs using the profile's roles and skills, ranked by AI similarity
app.post("/fetch-jobs", jobsLimiter, async (req, res) => {
    const roles = cleanStringArray(req.body.roles, 5);
    const skills = cleanStringArray(req.body.skills, 30);
    const summary = typeof req.body.summary === "string" ? req.body.summary.slice(0, 400) : "";

    if (roles.length === 0 && skills.length === 0) {
        return res.status(400).json({ error: "Add at least one job title or skill to search for." });
    }
    if (!isAdzunaConfigured()) {
        return res.status(503).json({ error: "Job search is not configured on the server." });
    }

    try {
        const jobs = await findMatchingJobs({ roles, skills, summary });
        return res.json({ jobs });
    } catch (err) {
        console.error("Job search failed:", describeAiError(err));
        return res.status(503).json({ error: "We couldn't search for jobs right now. Please try again in a few minutes." });
    }
});

// Generate a cover letter for one job
app.post("/generate-cover-letter", coverLetterLimiter, async (req, res) => {
    const { name, email, phone, summary, jobTitle, company, jobDescription } = req.body;
    const skills = cleanStringArray(req.body.skills, 30);

    if (!jobTitle || skills.length === 0) {
        return res.status(400).json({ error: "Missing required user details or job information" });
    }

    try {
        const coverLetter = await writeCoverLetter({
            name: typeof name === "string" ? name.slice(0, 100) : null,
            email: typeof email === "string" ? email.slice(0, 120) : null,
            phone: typeof phone === "string" ? phone.slice(0, 40) : null,
            summary: typeof summary === "string" ? summary.slice(0, 400) : "",
            jobTitle: String(jobTitle).slice(0, 200),
            company: typeof company === "string" && company.trim() ? company.slice(0, 200) : null,
            jobDescription: typeof jobDescription === "string" ? jobDescription : "",
            skills,
        });
        res.json({ coverLetter });
    } catch (err) {
        console.error("Error generating cover letter:", describeAiError(err));
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
