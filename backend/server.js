/*
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();
app.use(cors()); // Enable cross-origin requests

// Set up file storage (memory storage for fast processing)
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Extract text from the uploaded PDF
    const dataBuffer = await pdfParse(req.file.buffer);
    res.json({ text: dataBuffer.text }); // Send extracted text to frontend
  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).json({ error: "Error processing resume" });
  }
});

// Start server
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));

*/
/*
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up storage for uploaded resumes
const upload = multer({ dest: "uploads/" });

// API endpoint for uploading and processing resumes
app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Run Python script to extract resume details
    exec(`python3 resume_parser/parser.py ${filePath}`, (error, stdout, stderr) => {
        // Delete the uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        if (error) {
            console.error("Error executing script:", error);
            return res.status(500).json({ error: "Error processing resume" });
        }

        try {
            const parsedData = JSON.parse(stdout);
            return res.json(parsedData);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            return res.status(500).json({ error: "Invalid response from parser" });
        }
    });
});

// Default route
app.get("/", (req, res) => {
    res.send("AI Resume Parsing API is running...");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
*/
/*
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Set up file storage
const upload = multer({ dest: "backend/uploads/" });

app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, req.file.path); // Correct absolute file path

    console.log("Processing uploaded file:", filePath);

    // **Check if file exists before calling parser.py**
    if (!fs.existsSync(filePath)) {
        console.error("Uploaded file not found:", filePath);
        return res.status(500).json({ error: "Uploaded file not found on server." });
    }

    // Run Python script to process resume
    exec(`python3 backend/resume_parser/parser.py "${filePath}"`, (error, stdout, stderr) => {
        // Delete uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        if (error || stderr) {
            console.error("Python Script Error:", error || stderr);
            return res.status(500).json({ error: "Resume processing failed. Check backend logs." });
        }

        if (!stdout.trim()) {
            console.error("Python script returned empty response.");
            return res.status(500).json({ error: "No data extracted from resume." });
        }

        try {
            const parsedData = JSON.parse(stdout); // Parse JSON output from Python script
            return res.json(parsedData);
        } catch (parseError) {
            console.error("JSON Parsing Error:", parseError, stdout);
            return res.status(500).json({ error: "Invalid response from parser." });
        }
    });
});

// Default route to check if server is running
app.get("/", (req, res) => {
    res.send("AI Resume Parsing API is running...");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
*/
/*
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Set up file storage
const upload = multer({ dest: path.join(__dirname, "uploads/") });

app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path; // This should already be the correct absolute path

    console.log("Processing uploaded file:", filePath);

    // **Check if file exists before calling parser.py**
    if (!fs.existsSync(filePath)) {
        console.error("Uploaded file not found:", filePath);
        return res.status(500).json({ error: "Uploaded file not found on server." });
    }

    // **Corrected command - use the absolute path for parser.py**
    const pythonScript = path.join(__dirname, "resume_parser/parser.py");

    exec(`python3 "${pythonScript}" "${filePath}"`, (error, stdout, stderr) => {
        // Delete uploaded file after processing
        //fs.unlink(filePath, (err) => {
        //    if (err) console.error("Error deleting file:", err);
        //});

        if (error || stderr) {
            console.error("Python Script Error:", error || stderr);
            return res.status(500).json({ error: "Resume processing failed. Check backend logs." });
        }

        if (!stdout.trim()) {
            console.error("Python script returned empty response.");
            return res.status(500).json({ error: "No data extracted from resume." });
        }

        try {
            const parsedData = JSON.parse(stdout); // Parse JSON output from Python script
            return res.json(parsedData);
        } catch (parseError) {
            console.error("JSON Parsing Error:", parseError, stdout);
            return res.status(500).json({ error: "Invalid response from parser." });
        }
    });
});

// Default route to check if server is running
app.get("/", (req, res) => {
    res.send("AI Resume Parsing API is running...");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
*/
/*
const axios = require("axios");
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Adzuna API Credentials 
const ADZUNA_API_ID = "c385b22d";  
const ADZUNA_API_KEY = "6908744e9eedb358c34034d7fdf4ad20";  

// Function to fetch jobs from Adzuna API
const fetchJobsForSkill  = async (skill) => {
  try {
      //console.log(`Fetching jobs from API with query: "${query}"`);
      console.log(`Fetching jobs for skill: "${skill}"`);

      const response = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/sg/search/1`,
        {
            params: {
                app_id: ADZUNA_API_ID,
                app_key: ADZUNA_API_KEY,
                what: skill, 
                results_per_page: 5,  // Limit results per skill
            },
            timeout: 10000,
        }


    );
      if (!response.data || !response.data.results) {
        console.warn(` No results found for skill: "${skill}"`);
        return [];
      }
      console.log(` Jobs found for skill "${skill}": ${response.data.results.length}`);

      //console.log(` Jobs received: ${response.data.results.length}`);
      //console.log("Jobs Data:", JSON.stringify(response.data.results, null, 2)); // Print full API response

      return response.data.results.map((job) => ({
          title: job.title,
          company: job.company ? job.company.display_name : "Unknown",
          location: job.location ? job.location.display_name : "Remote",
          url: job.redirect_url,
      }));
  } catch (error) {
    console.error(` API Error for skill "${skill}":`, error.message);
    return [];
  }
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads/");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const upload = multer({ dest: uploadDir });

app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(uploadDir, req.file.filename); // Get actual uploaded file path

    console.log("Processing uploaded file:", filePath);

    // Check if file exists before processing
    if (!fs.existsSync(filePath)) {
        console.error("Uploaded file not found:", filePath);
        return res.status(500).json({ error: "Uploaded file not found on server." });
    }

    // Ensure Python script path is correct
    const pythonScript = path.join(__dirname, "resume_parser", "parser.py");

    exec(`python "${pythonScript}" "${filePath}"`, (error, stdout, stderr) => {
        // Don't delete the file immediately; keep it for debugging
        // fs.unlink(filePath, (err) => { if (err) console.error("Error deleting file:", err); });

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

// Route: Fetch job matches based on user skills
//app.post("/fetch-jobs", async (req, res) => {
 // const { skills } = req.body;
 // if (!skills || skills.length === 0) {
 //     return res.status(400).json({ error: "No skills provided" });
 // }

  // Convert skills array into a search query (comma-separated)
 // const query = skills.join(" OR ");
 // console.log(`Fetching jobs for skills: ${query}`);

 // const jobs = await fetchJobsFromAPI(query);
 // res.json({ jobs });
//});
// Route: Fetch job matches based on user skills (One by One)
app.post("/fetch-jobs", async (req, res) => {
  const { skills } = req.body;
  if (!skills || skills.length === 0) {
      return res.status(400).json({ error: "No skills provided" });
  }

  console.log(`Searching for jobs related to skills: ${skills.join(", ")}`);

  let allJobs = [];

  // Fetch jobs **one by one** for each skill
  for (const skill of skills) {
      const skillJobs = await fetchJobsForSkill(skill);
      allJobs = allJobs.concat(skillJobs);
  }

  console.log(` Total Jobs Found: ${allJobs.length}`);
  res.json({ jobs: allJobs });
});

// Default route
app.get("/", (req, res) => {
    res.send("AI Resume Parsing API is running...");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
*/

const axios = require("axios");
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Adzuna API Credentials 
const ADZUNA_API_ID = "c385b22d";  
const ADZUNA_API_KEY = "6908744e9eedb358c34034d7fdf4ad20";  

// Function to fetch jobs from Adzuna API
const fetchJobsForSkill = async (skill) => {
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
        console.log(`Jobs found for skill "${skill}": ${response.data.results.length}`);

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
};

// Function to fetch and sort jobs by relevance
const fetchAndSortJobs = async (skills) => {
    let allJobs = [];

    for (const skill of skills) {
        console.log(`Searching for jobs related to: ${skill}`);
        const skillJobs = await fetchJobsForSkill(skill);
        allJobs.push(...skillJobs);
    }

    // Assign a relevance score based on matching skills
    allJobs = allJobs.map(job => {
        let score = 0;
        skills.forEach(skill => {
            if (job.title.toLowerCase().includes(skill.toLowerCase())) {
                score += 5;
            }
        });
        return { ...job, score };
    });

    // Sort jobs based on relevance score (higher scores first)
    allJobs.sort((a, b) => b.score - a.score);

    console.log(`Sorted jobs by relevance:`, allJobs);
    return allJobs;
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads/");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const upload = multer({ dest: uploadDir });

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

// Route: Fetch job matches based on user skills (Sorted by Relevance)
app.post("/fetch-jobs", async (req, res) => {
    const { skills } = req.body;
    if (!skills || skills.length === 0) {
        return res.status(400).json({ error: "No skills provided" });
    }

    console.log(`Searching for jobs related to skills: ${skills.join(", ")}`);

    const sortedJobs = await fetchAndSortJobs(skills);
    console.log(`Total Jobs Found: ${sortedJobs.length}`);
    res.json({ jobs: sortedJobs });
});

// Default route
app.get("/", (req, res) => {
    res.send("AI Resume Parsing API is running...");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
