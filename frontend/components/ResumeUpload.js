import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [jobMatches, setJobMatches] = useState([]);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fetchingJobs, setFetchingJobs] = useState(false);

    const jobListRef = useRef(null); // Reference to the job list section

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
        if (selectedFile.size > 2 * 1024 * 1024) {
            setError("File size must be under 2MB.");
            return;
        }
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
        setResumeData(null);
        setJobMatches([]);
        setCoverLetter("");
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile.size > 2 * 1024 * 1024) {
            setError("File size must be under 2MB.");
            return;
        }
        setFile(droppedFile);
        setError(null);
        setSuccess(null);
        setResumeData(null);
        setJobMatches([]);
        setCoverLetter("");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a resume file.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData);
            setResumeData(response.data);
            setSuccess("Resume uploaded successfully!");
            fetchJobs(response.data.skills);
        } catch (err) {
            setError("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (skills) => {
        setFetchingJobs(true);
        try {
            const response = await axios.post("http://localhost:5000/fetch-jobs", { skills });
            setJobMatches(response.data.jobs || []);
        } catch (error) {
            setJobMatches([]);
        } finally {
            setFetchingJobs(false);
        }
    };
    const generateCoverLetter = async (job) => {
        if (!resumeData) return;
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/generate-cover-letter", {
                name: resumeData.name || "Not Provided",
                address: resumeData.address || "Not Provided",
                cityStateZip: resumeData.cityStateZip || "Not Provided",
                email: resumeData.email || "Not Provided",
                phone: resumeData.phone || "Not Provided",
                jobTitle: job.title,
                company: job.company,
                skills: resumeData.skills || []
            });
            setCoverLetter(response.data.coverLetter);
        } catch (error) {
            console.error("Cover letter generation failed:", error);
        }
        setLoading(false);
    };
    
    
    // UseEffect to handle scrolling after job matches are fetched
    useEffect(() => {
        if (jobMatches.length > 0 && jobListRef.current) {
            jobListRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [jobMatches]); // Scroll when jobMatches change

    return (
        <div className="container">
            <div className="upload-box">
                <h2>Upload Your Resume</h2>

                <div
                    className={`drag-drop-area ${isDragging ? "drag-drop-active" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="file-input"
                        id="fileUpload"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                    <label htmlFor="fileUpload" role="button" tabIndex={0}>
                        {file ? (
                            <p className="success-message">✔ {file.name}</p>
                        ) : (
                            <p>Drag & Drop your resume here or <span className="text-blue-400 underline">Click to Browse Files</span></p>
                        )}
                    </label>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="upload-button"
                >
                    {loading ? "Uploading..." : "Upload Resume"}
                </button>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {resumeData && (
                    <div className="resume-details">
                        <h3>Extracted Information:</h3>
                        <p><strong>Name:</strong> {resumeData.name || "Not found"}</p>
                        <p><strong>Email:</strong> {resumeData.email || "Not found"}</p>
                        <p><strong>Phone:</strong> {resumeData.phone || "Not found"}</p>
                        <p><strong>Skills:</strong> {resumeData.skills.length > 0 ? resumeData.skills.join(", ") : "No skills detected"}</p>
                    </div>
                )}

                {fetchingJobs && (
                    <div className="loading-bar-container">
                        <div className="loading-bar"></div>
                        <p>Fetching job matches...</p>
                    </div>
                )}

                {jobMatches.length > 0 && (
                    <div className="job-matches" ref={jobListRef}>
                        <h3>Recommended Jobs</h3>
                        <div className="job-list">
                            {jobMatches.map((job, index) => (
                                <div key={index} className="job-card">
                                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                                        <h4>{job.title}</h4>
                                    </a>
                                    <p><strong>Company:</strong> {job.company || "Unknown"}</p>
                                    <p><strong>Location:</strong> {job.location || "Not specified"}</p>
                                    <button className="generate-cover-button"
                                        onClick={() => generateCoverLetter(job)} 
                                        disabled={loading}> {loading ? "Generating..." : "Generate Cover Letter"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {coverLetter && (
                    <div className="cover-letter-container">
                        <h3>Generated Cover Letter</h3>
                        <pre className="cover-letter-content">{coverLetter}</pre>
                        <button onClick={() => setCoverLetter("")}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}
