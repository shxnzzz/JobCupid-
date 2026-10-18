import { useCallback, useEffect, useRef, useState } from "react";
import UploadCard from "./UploadCard";
import ProfileSummary from "./ProfileSummary";
import JobResults from "./JobResults";
import CoverLetterModal from "./CoverLetterModal";
import { fetchJobs, generateCoverLetter, getErrorMessage, uploadResume } from "@/lib/api";
import styles from "./Match.module.css";

export default function MatchApp() {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [profile, setProfile] = useState(null);

    const [jobsStatus, setJobsStatus] = useState("idle");
    const [jobs, setJobs] = useState([]);
    const [jobsError, setJobsError] = useState(null);

    const [generatingId, setGeneratingId] = useState(null);
    const [coverError, setCoverError] = useState(null);
    const [letter, setLetter] = useState(null);

    const [announcement, setAnnouncement] = useState("");
    const profileRef = useRef(null);

    const loadJobs = useCallback(async (skills) => {
        setJobsStatus("loading");
        setJobsError(null);
        setAnnouncement("Searching for matching jobs.");
        try {
            const results = await fetchJobs(skills);
            setJobs(results.map((job, index) => ({ ...job, id: index })));
            setJobsStatus("ready");
            setAnnouncement(results.length ? `Found ${results.length} jobs.` : "No jobs found.");
        } catch (err) {
            setJobs([]);
            setJobsError(getErrorMessage(err, "Something went wrong while searching for jobs."));
            setJobsStatus("error");
            setAnnouncement("Job search failed.");
        }
    }, []);

    const handleUpload = async (file) => {
        setUploading(true);
        setUploadError(null);
        setAnnouncement("Reading your resume.");
        try {
            const data = await uploadResume(file);
            setProfile(data);
            setAnnouncement("Resume read successfully.");
            if (data.skills && data.skills.length > 0) {
                loadJobs(data.skills);
            }
        } catch (err) {
            setUploadError(getErrorMessage(err, "We couldn't read your resume. Please try again."));
            setAnnouncement("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (profile && profileRef.current) {
            profileRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [profile]);

    const reset = () => {
        setProfile(null);
        setJobs([]);
        setJobsStatus("idle");
        setJobsError(null);
        setCoverError(null);
        setUploadError(null);
        setLetter(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGenerate = async (job) => {
        setGeneratingId(job.id);
        setCoverError(null);
        try {
            const text = await generateCoverLetter({
                name: profile.name && profile.name !== "Not found" ? profile.name : "Not provided",
                email: profile.email && profile.email !== "Not found" ? profile.email : "Not provided",
                phone: profile.phone && profile.phone !== "Not found" ? profile.phone : "Not provided",
                jobTitle: job.title,
                company: job.company,
                skills: profile.skills,
            });
            setLetter({ text, jobTitle: job.title, company: job.company });
        } catch (err) {
            setCoverError(
                `${getErrorMessage(err, "We couldn't write a cover letter.")} (${job.title})`
            );
        } finally {
            setGeneratingId(null);
        }
    };

    const hasSkills = profile && profile.skills && profile.skills.length > 0;

    return (
        <div className={styles.app}>
            <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

            {!profile && (
                <div className={styles.intro}>
                    <h1 className={styles.pageTitle}>Find jobs that match your resume</h1>
                    <p className="lead">
                        Upload your resume and we&apos;ll search live job listings in Singapore for your skills.
                    </p>
                    <UploadCard
                        uploading={uploading}
                        error={uploadError}
                        onUpload={handleUpload}
                        onClearError={() => setUploadError(null)}
                    />
                </div>
            )}

            {profile && (
                <div ref={profileRef} className={styles.resultsLayout}>
                    <h1 className="sr-only">Your job matches</h1>
                    <ProfileSummary profile={profile} onReset={reset} disabled={generatingId !== null} />

                    {hasSkills ? (
                        <JobResults
                            status={jobsStatus}
                            jobs={jobs}
                            error={jobsError}
                            skillCount={profile.skills.length}
                            onRetry={() => loadJobs(profile.skills)}
                            onGenerate={handleGenerate}
                            generatingId={generatingId}
                            coverError={coverError}
                            onDismissCoverError={() => setCoverError(null)}
                        />
                    ) : (
                        <div className={`card ${styles.emptyState}`}>
                            <h2 className={styles.sectionTitle}>We couldn&apos;t find any skills to search for</h2>
                            <p className="text-muted">
                                JobCupid looks for skills from a fixed list (for example Python, React, SQL, Excel or
                                SEO). Your resume didn&apos;t mention any of them in a way we could read.
                            </p>
                            <ul className={styles.tips}>
                                <li>Make sure the PDF has selectable text, not a scanned image.</li>
                                <li>List your skills by name, for example in a &quot;Skills&quot; section.</li>
                            </ul>
                            <button type="button" className="btn btn--primary" onClick={reset}>
                                Try another resume
                            </button>
                        </div>
                    )}
                </div>
            )}

            <CoverLetterModal letter={letter} onClose={() => setLetter(null)} />
        </div>
    );
}
