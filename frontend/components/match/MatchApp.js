import { useCallback, useEffect, useRef, useState } from "react";
import UploadCard from "./UploadCard";
import ProfileSummary from "./ProfileSummary";
import JobResults from "./JobResults";
import CoverLetterModal from "./CoverLetterModal";
import { fetchJobs, generateCoverLetter, getErrorMessage, uploadResume } from "@/lib/api";
import styles from "./Match.module.css";

function sameList(a, b) {
    return a.length === b.length && a.every((item, i) => item === b[i]);
}

export default function MatchApp() {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [profile, setProfile] = useState(null);

    const [draft, setDraft] = useState({ roles: [], skills: [] });
    const [searched, setSearched] = useState({ roles: [], skills: [] });

    const [jobsStatus, setJobsStatus] = useState("idle");
    const [jobs, setJobs] = useState([]);
    const [jobsError, setJobsError] = useState(null);

    const [generatingId, setGeneratingId] = useState(null);
    const [coverError, setCoverError] = useState(null);
    const [letter, setLetter] = useState(null);

    const [announcement, setAnnouncement] = useState("");
    const profileRef = useRef(null);

    const runSearch = useCallback(async (criteria, summary) => {
        if (criteria.roles.length === 0 && criteria.skills.length === 0) {
            setJobsStatus("idle");
            setJobs([]);
            return;
        }
        setSearched(criteria);
        setJobsStatus("loading");
        setJobsError(null);
        setCoverError(null);
        setAnnouncement("Searching for matching jobs.");
        try {
            const results = await fetchJobs({ ...criteria, summary });
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
        setAnnouncement("Analysing your resume.");
        try {
            const data = await uploadResume(file);
            const criteria = { roles: data.roles || [], skills: data.skills || [] };
            setProfile(data);
            setDraft(criteria);
            setAnnouncement("Resume analysed.");
            runSearch(criteria, data.summary);
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
        setDraft({ roles: [], skills: [] });
        setSearched({ roles: [], skills: [] });
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
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                summary: profile.summary,
                skills: searched.skills.length ? searched.skills : searched.roles,
                job,
            });
            setLetter({ text, jobTitle: job.title, company: job.company });
        } catch (err) {
            setCoverError(`${getErrorMessage(err, "We couldn't write a cover letter.")} (${job.title})`);
        } finally {
            setGeneratingId(null);
        }
    };

    const dirty = !sameList(draft.roles, searched.roles) || !sameList(draft.skills, searched.skills);
    const busy = jobsStatus === "loading" || generatingId !== null;

    return (
        <div className={styles.app}>
            <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

            {!profile && (
                <div className={styles.intro}>
                    <h1 className={styles.pageTitle}>Find jobs that match your resume</h1>
                    <p className="lead">
                        Upload your resume. Our AI works out your skills and the roles that suit you, then we search
                        live job listings in Singapore and rank them for you.
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
                    <ProfileSummary
                        profile={profile}
                        draft={draft}
                        onDraftChange={setDraft}
                        dirty={dirty}
                        onSearch={() => runSearch(draft, profile.summary)}
                        onReset={reset}
                        busy={busy}
                    />

                    {jobsStatus === "idle" ? (
                        <div className={`card ${styles.emptyState}`}>
                            <h2 className={styles.sectionTitle}>Add a job title or skill to start</h2>
                            <p className="text-muted">
                                We couldn&apos;t pick out job titles or skills from your resume. Add a few above, then
                                select <strong>Update results</strong>. Also check that your PDF has selectable text
                                and isn&apos;t a scanned image.
                            </p>
                        </div>
                    ) : (
                        <JobResults
                            status={jobsStatus}
                            jobs={jobs}
                            error={jobsError}
                            searchedRoles={searched.roles}
                            onRetry={() => runSearch(searched, profile.summary)}
                            onGenerate={handleGenerate}
                            generatingId={generatingId}
                            coverError={coverError}
                            onDismissCoverError={() => setCoverError(null)}
                        />
                    )}
                </div>
            )}

            <CoverLetterModal letter={letter} onClose={() => setLetter(null)} />
        </div>
    );
}
