import { useState } from "react";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Store the selected file
  };

  // Upload file to the backend
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploadStatus("Upload successful! Check the console for extracted text.");
      console.log("Extracted Resume Text:", result.text);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">Upload Your Resume</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload Resume
      </button>
      {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
    </div>
  );
}
