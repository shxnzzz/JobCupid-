/*import { useState } from "react";

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
*/
/*
import { useState } from "react";
import axios from "axios";


export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [jobMatches, setJobMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [jobs, setJobs] = useState([]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setResumeData(null);
        setJobMatches([]);
        setError(null);
        setSelectedFile(event.target.files[0]);

    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a resume file to upload.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("resume", file);

        //try {
          //  const response = await fetch("http://localhost:5000/upload", {
            //    method: "POST",
              //  body: formData,
           // });

            //if (!response.ok) {
             //   throw new Error("Failed to process resume.");
            //}

            //const data = await response.json();
            //setResumeData(data);
        try {
              const response = await axios.post("http://localhost:5000/upload", formData);

              console.log("Upload response:", response.data);  // Debug log after response

              setResumeData(response.data);
  
              if (response.data.skills.length > 0) {
                  fetchJobs(response.data.skills);
              } else {
                console.warn("No skills detected in resume.");
            }
          }
         catch (err) {
            console.error("Upload failed:", err);

            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (skills) => {
      try {
          console.log("Fetching jobs for:", skills);
          const response = await axios.post("http://localhost:5000/fetch-jobs", { skills });
          console.log("Job API response:", response.data);  // Debug log for API response

  
          if (response.data.jobs.length === 0) {
              console.warn("No jobs found for the given skills.");
              setJobMatches([]);
          } else {
              console.log("Jobs received:", response.data.jobs);  

              setJobMatches(response.data.jobs);

          }
      } catch (error) {
          console.error("Error fetching jobs:", error);
          setJobMatches([]); // 🔹 Ensures UI does not crash
      }
    }   ;

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Upload Your Resume</h2>
            <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange} 
            />
            <br />
            <button 
                onClick={handleUpload} 
                disabled={loading}
                style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
            >
                {loading ? "Uploading..." : "Upload Resume"}
            </button>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {resumeData && (
                <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block" }}>
                    <h3>Extracted Information:</h3>
                    <p><strong>Name:</strong> {resumeData.name || "Not found"}</p>
                    <p><strong>Email:</strong> {resumeData.email || "Not found"}</p>
                    <p><strong>Phone:</strong> {resumeData.phone || "Not found"}</p>
                    <p><strong>Skills:</strong> 
                        {Array.isArray(resumeData.skills) && resumeData.skills.length > 0
                          ? resumeData.skills.join(", ")
                          : "No skills detected"}
                    </p>
                    {jobMatches.length > 0 && (
                        <div>
                            <h3>Recommended Jobs</h3>
                            <ul>
                                {jobMatches.map((job, index) => (
                                    <li key={index}>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                                            <strong>{job.title}</strong> at {job.company} - {job.location}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>

        
    );
}



*/
/*
import { useState } from "react";
import axios from "axios";

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [jobMatches, setJobMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setResumeData(null);
        setJobMatches([]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a resume file to upload.");
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData);
            console.log("Upload response:", response.data);
            setResumeData(response.data);
            if (response.data.skills.length > 0) {
                fetchJobs(response.data.skills);
            } else {
                console.warn("No skills detected in resume.");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (skills) => {
        try {
            console.log("Fetching jobs for:", skills);
            const response = await axios.post("http://localhost:5000/fetch-jobs", { skills });
            console.log("Job API response:", response.data);
            if (response.data.jobs.length === 0) {
                console.warn("No jobs found for the given skills.");
                setJobMatches([]);
            } else {
                console.log("Jobs received:", response.data.jobs);
                setJobMatches(response.data.jobs);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobMatches([]);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px", color: "white" }}>
            <h2>Upload Your Resume</h2>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <br />
            <button 
                onClick={handleUpload} 
                disabled={loading} 
                style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
            >
                {loading ? "Uploading..." : "Upload Resume"}
            </button>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {resumeData && (
                <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block", maxWidth: "600px" }}>
                    <h3><strong>Extracted Information:</strong></h3>
                    <p><strong>Name:</strong> {resumeData.name || "Not found"}</p>
                    <p><strong>Email:</strong> {resumeData.email || "Not found"}</p>
                    <p><strong>Phone:</strong> {resumeData.phone || "Not found"}</p>
                    <p><strong>Skills:</strong> {resumeData.skills.length > 0 ? resumeData.skills.join(", ") : "No skills detected"}</p>
                    
                    {jobMatches.length > 0 && (
                        <div>
                            <h3><strong>Recommended Jobs</strong></h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {jobMatches.map((job, index) => (
                                    <div key={index} style={{
                                        border: "1px solid #ccc", 
                                        padding: "10px", 
                                        borderRadius: "5px", 
                                        background: "#333",
                                        color: "white",
                                        width: "100%"
                                    }}>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1E90FF" }}>
                                            <h4 style={{ margin: 0 }}>{job.title}</h4>
                                        </a>
                                        <p style={{ margin: "5px 0" }}>
                                            <strong>Company:</strong> {job.company || "Unknown"} <br />
                                            <strong>Location:</strong> {job.location || "Not specified"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
*/
/*
import { useState } from "react";
import axios from "axios";

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [jobMatches, setJobMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setResumeData(null);
        setJobMatches([]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a resume file to upload.");
            return;
        }



        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await axios.post("http://localhost:5000/upload/", formData);
            console.log("Upload response:", response.data);
            setResumeData(response.data);
            if (!response.data.skills || response.data.skills.length === 0) {
                console.warn("No skills detected in resume.");
                return;
            }
            
            if (response.data.skills.length > 0) {
                fetchJobs(response.data.skills);
            } else {
                console.warn("No skills detected in resume.");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (skills) => {
        try {
            console.log("Fetching jobs for:", skills);
            const response = await axios.post("http://localhost:5000/fetch-jobs", { skills });
            console.log("Job API response:", response.data);
            if (response.data.jobs.length === 0) {
                console.warn("No jobs found for the given skills.");
                setJobMatches([]);
            } else {
                console.log("Sorted Jobs received:", response.data.jobs);
                setJobMatches(response.data.jobs);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobMatches([]);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px", color: "white" }}>
            <h2>Upload Your Resume</h2>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <br />
            <button 
                onClick={handleUpload} 
                disabled={loading} 
                style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
            >
                {loading ? "Uploading..." : "Upload Resume"}
            </button>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {resumeData && (
                <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block", maxWidth: "600px" }}>
                    <h3><strong>Extracted Information:</strong></h3>
                    <p><strong>Name:</strong> {resumeData.name || "Not found"}</p>
                    <p><strong>Email:</strong> {resumeData.email || "Not found"}</p>
                    <p><strong>Phone:</strong> {resumeData.phone || "Not found"}</p>
                    <p><strong>Skills:</strong> {resumeData.skills.length > 0 ? resumeData.skills.join(", ") : "No skills detected"}</p>
                    
                    {jobMatches.length > 0 && (
                        <div>
                            <h3><strong>Recommended Jobs (Sorted by Relevance)</strong></h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {jobMatches.map((job, index) => (
                                    <div key={index} style={{
                                        border: "1px solid #ccc", 
                                        padding: "10px", 
                                        borderRadius: "5px", 
                                        background: "#333",
                                        color: "white",
                                        width: "100%"
                                    }}>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1E90FF" }}>
                                            <h4 style={{ margin: 0 }}>{job.title}</h4>
                                        </a>
                                        <p style={{ margin: "5px 0" }}>
                                            <strong>Company:</strong> {job.company || "Unknown"} <br />
                                            <strong>Location:</strong> {job.location || "Not specified"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
*/

import { useState } from "react";
import axios from "axios";

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [jobMatches, setJobMatches] = useState([]);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setResumeData(null);
        setJobMatches([]);
        setCoverLetter("");
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a resume file to upload.");
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData);
            console.log("Upload response:", response.data);
            setResumeData(response.data);
            if (!response.data.skills || response.data.skills.length === 0) {
                console.warn("No skills detected in resume.");
                return;
            }
            fetchJobs(response.data.skills);
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (skills) => {
        try {
            console.log("Fetching jobs for:", skills);
            const response = await axios.post("http://localhost:5000/fetch-jobs", { skills });
            console.log("Job API response:", response.data);
            setJobMatches(response.data.jobs || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobMatches([]);
        }
    };

    const generateCoverLetter = async (job) => {
        if (!resumeData) return;
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/generate-cover-letter", {
                jobTitle: job.title,
                company: job.company,
                skills: resumeData.skills
            });
            setCoverLetter(response.data.coverLetter);
        } catch (error) {
            console.error("Cover letter generation failed:", error);
        }
        setLoading(false);
    };

    return (
        <div style={{ textAlign: "center", padding: "20px", color: "white" }}>
            <h2>Upload Your Resume</h2>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <br />
            <button onClick={handleUpload} disabled={loading} style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}>
                {loading ? "Uploading..." : "Upload Resume"}
            </button>
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {resumeData && (
                <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block", maxWidth: "600px" }}>
                    <h3><strong>Extracted Information:</strong></h3>
                    <p><strong>Name:</strong> {resumeData.name || "Not found"}</p>
                    <p><strong>Email:</strong> {resumeData.email || "Not found"}</p>
                    <p><strong>Phone:</strong> {resumeData.phone || "Not found"}</p>
                    <p><strong>Skills:</strong> {resumeData.skills.length > 0 ? resumeData.skills.join(", ") : "No skills detected"}</p>
                    
                    {jobMatches.length > 0 && (
                        <div>
                            <h3><strong>Recommended Jobs (Sorted by Relevance)</strong></h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {jobMatches.map((job, index) => (
                                    <div key={index} style={{
                                        border: "1px solid #ccc", 
                                        padding: "10px", 
                                        borderRadius: "5px", 
                                        background: "#333",
                                        color: "white",
                                        width: "100%"
                                    }}>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1E90FF" }}>
                                            <h4 style={{ margin: 0 }}>{job.title}</h4>
                                        </a>
                                        <p style={{ margin: "5px 0" }}>
                                            <strong>Company:</strong> {job.company || "Unknown"} <br />
                                            <strong>Location:</strong> {job.location || "Not specified"}
                                        </p>
                                        <button onClick={() => generateCoverLetter(job)} style={{ padding: "5px 10px", cursor: "pointer" }}>Generate Cover Letter</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {coverLetter && (
                <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #444", backgroundColor: "#eee", borderRadius: "5px" }}>
                    <h3>Generated Cover Letter</h3>
                    <pre>{coverLetter}</pre>
                    <button onClick={() => setCoverLetter("")}>Close</button>
                </div>
            )}
        </div>
    );
}
