import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const client = axios.create({ baseURL: API_URL });

export function getErrorMessage(err, fallback) {
    if (err && err.response && err.response.data && err.response.data.error) {
        return err.response.data.error;
    }
    if (err && !err.response) {
        return "We can't reach the JobCupid server right now. Please check your connection and try again.";
    }
    return fallback;
}

export async function uploadResume(file) {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await client.post("/upload", formData, { timeout: 90000 });
    return response.data;
}

export async function fetchJobs(skills) {
    const response = await client.post("/fetch-jobs", { skills }, { timeout: 180000 });
    return response.data.jobs || [];
}

export async function generateCoverLetter({ name, email, phone, jobTitle, company, skills }) {
    const response = await client.post(
        "/generate-cover-letter",
        { name, email, phone, jobTitle, company, skills },
        { timeout: 90000 }
    );
    return response.data.coverLetter;
}
