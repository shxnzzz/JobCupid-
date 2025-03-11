

const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Adzuna API Credentials
const ADZUNA_API_ID = "c385b22d";
const ADZUNA_API_KEY = "6908744e9eedb358c34034d7fdf4ad20";

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;  // Instead of hardcoding

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const upload = multer({ dest: uploadDir });

// Upload and parse resume
app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(uploadDir, req.file.filename);
    console.log("Processing uploaded file:", filePath);

    if (!fs.existsSync(filePath)) {
        console.error("Uploaded file not found:", filePath);
        return res.status(500).json({ error: "Uploaded file not found on server." });
    }

    const pythonScript = path.join(__dirname, "resume_parser", "parser.py");

    exec(`python "${pythonScript}" "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error("Execution Error:", error.message);
            return res.status(500).json({ error: "Error executing Python script." });
        }
        if (stderr) {
            console.error("Python Script Error:", stderr);
            return res.status(500).json({ error: "Python script returned an error." });
        }

        console.log("Python Output:", stdout);

        if (!stdout.trim()) {
            console.error("Python script returned empty response.");
            return res.status(500).json({ error: "No data extracted from resume." });
        }

        try {
            const parsedData = JSON.parse(stdout);
            return res.json(parsedData);
        } catch (parseError) {
            console.error("JSON Parsing Error:", parseError, stdout);
            return res.status(500).json({ error: "Invalid response from parser." });
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
        }));
    } catch (error) {
        console.error(`API Error for skill "${skill}":`, error.message);
        return [];
    }
}

// Fetch job listings
app.post("/fetch-jobs", async (req, res) => {
    const { skills } = req.body;
    if (!skills || skills.length === 0) {
        return res.status(400).json({ error: "No skills provided" });
    }

    let allJobs = [];
    for (const skill of skills) {
        const skillJobs = await fetchJobsForSkill(skill);
        allJobs = allJobs.concat(skillJobs);
    }

    allJobs = allJobs.map(job => {
        let score = 0;
        skills.forEach(skill => {
            if (job.title.toLowerCase().includes(skill.toLowerCase())) {
                score += 5;
            }
        });
        return { ...job, score };
    });

    allJobs.sort((a, b) => b.score - a.score);
    res.json({ jobs: allJobs });
});

// Generate cover letter using GPT
app.post("/generate-cover-letter", async (req, res) => {
    const { name, address, cityStateZip, email, phone, jobTitle, company, skills } = req.body;
    
    if (!name || !address || !cityStateZip || !email || !phone || !jobTitle || !company || !skills || skills.length === 0) {
        return res.status(400).json({ error: "Missing required user details or job information" });
    }

    const userInfo = `
${name}
${address}
${cityStateZip}
${email}
${phone}
[Date]`;

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

Ensure that all placeholders like [Your Name], [Your Address], etc., are properly replaced with the user's details.
`
                    }
                ],
                temperature: 0.7
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
        );

        res.json({ coverLetter: response.data.choices[0].message.content });
    } catch (error) {
        console.error("Error generating cover letter:", error.message);
        res.status(500).json({ error: "Failed to generate cover letter" });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
