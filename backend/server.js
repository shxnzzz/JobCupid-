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
