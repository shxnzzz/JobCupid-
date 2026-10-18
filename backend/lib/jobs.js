const axios = require("axios");
const { embed } = require("./openai");

const ADZUNA_API_ID = process.env.ADZUNA_API_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || "sg";
const RESULTS_PER_QUERY = 20;
const MAX_QUERIES = 5;
const SNIPPET_LENGTH = 280;

// Cosine similarities from text-embedding-3-small for resume-vs-job text sit roughly in this band
const SIMILARITY_FLOOR = 0.2;
const SIMILARITY_CEILING = 0.65;
const SEMANTIC_WEIGHT = 0.7;
const SKILL_WEIGHT = 0.3;
const SKILLS_FOR_FULL_CREDIT = 5;

function isAdzunaConfigured() {
    return Boolean(ADZUNA_API_ID && ADZUNA_API_KEY);
}

function decodeEntities(text) {
    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&#x27;/g, "'");
}

function cleanText(text) {
    return decodeEntities(String(text || "").replace(/<[^>]*>/g, " "))
        .replace(/\s+/g, " ")
        .trim();
}

// Adzuna's API returns annual salaries, but listings written as "90k" come through as 90 × 12 = 1080.
// Real annual salaries are never this low, so recover the intended figure; drop anything else implausible.
const MIN_PLAUSIBLE_ANNUAL_SALARY = 12000;

function normaliseSalary(value) {
    if (typeof value !== "number" || value <= 0) return null;
    if (value >= MIN_PLAUSIBLE_ANNUAL_SALARY) return Math.round(value);
    if (value % 12 === 0) {
        const recovered = (value / 12) * 1000;
        if (recovered >= MIN_PLAUSIBLE_ANNUAL_SALARY) return recovered;
    }
    return null;
}

async function searchAdzuna(query) {
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1`, {
        params: {
            app_id: ADZUNA_API_ID,
            app_key: ADZUNA_API_KEY,
            what: query,
            results_per_page: RESULTS_PER_QUERY,
            "content-type": "application/json",
        },
        timeout: 15000,
    });

    return (response.data.results || []).map((job) => ({
        adzunaId: job.id,
        title: cleanText(job.title),
        company: job.company ? cleanText(job.company.display_name) : null,
        location: job.location ? cleanText(job.location.display_name) : null,
        description: cleanText(job.description),
        url: job.redirect_url,
        created: job.created || null,
        salaryMin: normaliseSalary(job.salary_min),
        salaryMax: normaliseSalary(job.salary_max),
        salaryIsPredicted: job.salary_is_predicted === "1" || job.salary_is_predicted === 1,
        foundBy: query,
    }));
}

function normaliseForDedupe(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\b(pte|ltd|limited|inc|llc|co|corp|corporation|private)\b/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function dedupe(jobs) {
    const seen = new Set();
    const unique = [];
    for (const job of jobs) {
        const idKey = job.adzunaId ? `id:${job.adzunaId}` : null;
        const textKey = `tc:${normaliseForDedupe(job.title)}|${normaliseForDedupe(job.company)}`;
        if ((idKey && seen.has(idKey)) || seen.has(textKey)) continue;
        if (idKey) seen.add(idKey);
        seen.add(textKey);
        unique.push(job);
    }
    return unique;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word match that also works for skills containing symbols, e.g. "C++", "C#", ".NET", "Node.js"
function skillMatcher(skill) {
    return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(skill)}(?![A-Za-z0-9])`, "i");
}

function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function clamp01(value) {
    return Math.min(1, Math.max(0, value));
}

function buildProfileText({ roles, skills, summary }) {
    return [
        roles.length ? `Target roles: ${roles.join(", ")}` : "",
        skills.length ? `Skills: ${skills.join(", ")}` : "",
        summary ? `Profile: ${summary}` : "",
    ]
        .filter(Boolean)
        .join("\n");
}

function snippet(text) {
    if (text.length <= SNIPPET_LENGTH) return text;
    return `${text.slice(0, SNIPPET_LENGTH).replace(/\s+\S*$/, "")}…`;
}

async function findMatchingJobs({ roles, skills, summary }) {
    const queries = (roles.length ? roles : skills).slice(0, MAX_QUERIES);

    const settled = await Promise.allSettled(queries.map((query) => searchAdzuna(query)));
    const failures = settled.filter((r) => r.status === "rejected");
    failures.forEach((f) => console.error("Adzuna search failed:", f.reason && f.reason.message));
    if (failures.length === settled.length) {
        throw new Error("All job searches failed");
    }

    const jobs = dedupe(settled.flatMap((r) => (r.status === "fulfilled" ? r.value : [])));
    if (jobs.length === 0) return [];

    const profileText = buildProfileText({ roles, skills, summary });
    const jobTexts = jobs.map((job) => `${job.title}\n${job.company || ""}\n${job.description}`.slice(0, 2000));
    const [profileVector, ...jobVectors] = await embed([profileText, ...jobTexts]);

    const matchers = skills.map((skill) => ({ skill, regex: skillMatcher(skill) }));

    const ranked = jobs.map((job, i) => {
        const haystack = `${job.title} ${job.description}`;
        const matchedSkills = matchers.filter((m) => m.regex.test(haystack)).map((m) => m.skill);

        const similarity = cosineSimilarity(profileVector, jobVectors[i]);
        const semantic = clamp01((similarity - SIMILARITY_FLOOR) / (SIMILARITY_CEILING - SIMILARITY_FLOOR));
        const skillScore = clamp01(matchedSkills.length / SKILLS_FOR_FULL_CREDIT);
        const matchScore = Math.round(100 * (SEMANTIC_WEIGHT * semantic + SKILL_WEIGHT * skillScore));

        const { adzunaId, description, ...rest } = job;
        return {
            ...rest,
            snippet: snippet(description),
            description: description.slice(0, 1500),
            matchedSkills,
            matchScore,
            similarity: Math.round(similarity * 1000) / 1000,
        };
    });

    ranked.sort((a, b) => b.matchScore - a.matchScore || b.similarity - a.similarity);
    return ranked;
}

module.exports = { findMatchingJobs, isAdzunaConfigured };
