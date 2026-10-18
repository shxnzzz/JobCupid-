import { useEffect, useRef, useState } from "react";
import JobCard from "./JobCard";
import Pagination from "./Pagination";
import styles from "./Match.module.css";

export const JOBS_PER_PAGE = 9;

function SkeletonCard() {
    return (
        <div className={`card ${styles.jobCard} ${styles.skeletonCard}`} aria-hidden="true">
            <div className={styles.skeletonLine} style={{ width: "30%" }} />
            <div className={styles.skeletonLine} style={{ width: "90%", height: 18 }} />
            <div className={styles.skeletonLine} style={{ width: "70%", height: 18 }} />
            <div className={styles.skeletonLine} style={{ width: "50%" }} />
            <div className={styles.skeletonLine} style={{ width: "60%", marginTop: "auto" }} />
        </div>
    );
}

export default function JobResults({
    status,
    jobs,
    error,
    skillCount,
    onRetry,
    onGenerate,
    generatingId,
    coverError,
    onDismissCoverError,
}) {
    const [page, setPage] = useState(1);
    const headingRef = useRef(null);

    useEffect(() => {
        setPage(1);
    }, [jobs]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
    const start = (page - 1) * JOBS_PER_PAGE;
    const pageJobs = jobs.slice(start, start + JOBS_PER_PAGE);

    const changePage = (next) => {
        setPage(next);
        if (headingRef.current) {
            headingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            headingRef.current.focus({ preventScroll: true });
        }
    };

    return (
        <section className={styles.results} aria-labelledby="results-heading" aria-busy={status === "loading"}>
            <div className={styles.resultsHeader}>
                <div>
                    <h2 id="results-heading" ref={headingRef} tabIndex={-1} className={styles.sectionTitle}>
                        Recommended jobs
                    </h2>
                    {status === "ready" && jobs.length > 0 && (
                        <p className="text-muted">
                            Showing {start + 1}–{start + pageJobs.length} of {jobs.length} jobs, best matches first.
                        </p>
                    )}
                    {status === "loading" && (
                        <p className="text-muted">
                            Searching live job listings for {skillCount} {skillCount === 1 ? "skill" : "skills"}. This can take up to a minute.
                        </p>
                    )}
                </div>
            </div>

            {status === "loading" && (
                <div className={styles.jobGrid}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {status === "error" && (
                <div className={`card ${styles.emptyState}`} role="alert">
                    <h3>We couldn&apos;t load job listings</h3>
                    <p className="text-muted">{error}</p>
                    <button type="button" className="btn btn--primary" onClick={onRetry}>
                        Try again
                    </button>
                </div>
            )}

            {status === "ready" && jobs.length === 0 && (
                <div className={`card ${styles.emptyState}`}>
                    <h3>No jobs found right now</h3>
                    <p className="text-muted">
                        The job board didn&apos;t return any openings for your skills. Listings change daily, so try again later.
                    </p>
                    <button type="button" className="btn btn--secondary" onClick={onRetry}>
                        Search again
                    </button>
                </div>
            )}

            {status === "ready" && jobs.length > 0 && (
                <>
                    <details className={styles.rankingInfo}>
                        <summary>How are jobs ranked?</summary>
                        <p>
                            For each skill on your resume, JobCupid searches live listings on Adzuna. Jobs are then
                            ordered by how many of your skills appear in the job title. Jobs marked &quot;Related&quot;
                            were found through a skill search but don&apos;t mention your skills in the title.
                        </p>
                        <p>
                            Writing a cover letter sends your name, email, phone number, skills and the job details to
                            OpenAI to generate the text.
                        </p>
                    </details>

                    {coverError && (
                        <div className={`alert alert--error ${styles.inlineAlert}`} role="alert">
                            <span>{coverError}</span>
                            <button type="button" className="btn btn--ghost btn--sm" onClick={onDismissCoverError}>
                                Dismiss
                            </button>
                        </div>
                    )}

                    <ol className={styles.jobGrid} start={start + 1}>
                        {pageJobs.map((job, i) => (
                            <li key={job.id}>
                                <JobCard
                                    job={job}
                                    rank={start + i + 1}
                                    generating={generatingId === job.id}
                                    disabled={generatingId !== null}
                                    onGenerate={onGenerate}
                                />
                            </li>
                        ))}
                    </ol>

                    <Pagination page={page} totalPages={totalPages} onChange={changePage} />
                </>
            )}
        </section>
    );
}
