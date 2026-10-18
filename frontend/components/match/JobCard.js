import styles from "./Match.module.css";

const MAX_CHIPS = 4;

export function getMatchLevel(matchCount) {
    if (matchCount >= 3) return { label: "Strong match", tone: "strong" };
    if (matchCount === 2) return { label: "Good match", tone: "good" };
    if (matchCount === 1) return { label: "Partial match", tone: "partial" };
    return { label: "Related", tone: "related" };
}

export default function JobCard({ job, rank, generating, disabled, onGenerate }) {
    const matched = job.matchedSkills || [];
    const level = getMatchLevel(matched.length);
    const extra = matched.length - MAX_CHIPS;

    return (
        <article className={`card card--interactive ${styles.jobCard}`} aria-labelledby={`job-${rank}-title`}>
            <div className={styles.jobTop}>
                <span className={styles.rank} aria-label={`Rank ${rank}`}>#{rank}</span>
                <span className={`${styles.level} ${styles[`level_${level.tone}`]}`}>{level.label}</span>
            </div>

            <h3 id={`job-${rank}-title`} className={styles.jobTitle}>
                {job.title}
            </h3>
            <p className={styles.jobMeta}>
                <span>{job.company || "Company not listed"}</span>
                <span aria-hidden="true"> · </span>
                <span>{job.location || "Location not listed"}</span>
            </p>

            <div className={styles.jobMatch}>
                {matched.length > 0 ? (
                    <>
                        <p className={styles.jobMatchLabel}>
                            {matched.length === 1 ? "1 of your skills" : `${matched.length} of your skills`} in the title
                        </p>
                        <ul className={styles.chips}>
                            {matched.slice(0, MAX_CHIPS).map((skill) => (
                                <li key={skill} className="badge">{skill}</li>
                            ))}
                            {extra > 0 && <li className={`badge ${styles.badgeMore}`}>+{extra} more</li>}
                        </ul>
                    </>
                ) : job.foundBy ? (
                    <p className={styles.jobMatchLabel}>
                        Found by searching for <strong>{job.foundBy}</strong>
                    </p>
                ) : (
                    <p className={styles.jobMatchLabel}>Found through a search for one of your skills</p>
                )}
            </div>

            <div className={styles.jobActions}>
                {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
                        View job
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                )}
                <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => onGenerate(job)}
                    disabled={disabled}
                    aria-busy={generating || undefined}
                >
                    {generating ? (
                        <>
                            <span className={styles.spinner} aria-hidden="true" />
                            Writing…
                        </>
                    ) : (
                        "Write cover letter"
                    )}
                </button>
            </div>
        </article>
    );
}
