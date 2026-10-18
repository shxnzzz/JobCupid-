import styles from "./Match.module.css";

const MAX_CHIPS = 4;

export function getMatchLevel(score) {
    if (score >= 70) return { label: "Strong match", tone: "strong" };
    if (score >= 50) return { label: "Good match", tone: "good" };
    if (score >= 30) return { label: "Fair match", tone: "partial" };
    return { label: "Weak match", tone: "related" };
}

const numberFormatter = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 0 });
const formatAmount = (value) => `S$${numberFormatter.format(value)}`;
const roundToHundred = (value) => Math.round(value / 100) * 100;

function formatRange(min, max) {
    if (min && max && min !== max) return `${formatAmount(min)} – ${formatAmount(max)}`;
    return formatAmount(max || min);
}

function formatSalary(job) {
    const { salaryMin, salaryMax } = job;
    if (!salaryMin && !salaryMax) return null;
    const yearly = formatRange(salaryMin, salaryMax);
    const monthly = formatRange(salaryMin && roundToHundred(salaryMin / 12), salaryMax && roundToHundred(salaryMax / 12));
    return {
        main: `${job.salaryIsPredicted ? "Est. " : ""}${monthly} a month`,
        detail: `${yearly} a year`,
    };
}

function formatPosted(created) {
    if (!created) return null;
    const date = new Date(created);
    if (Number.isNaN(date.getTime())) return null;
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days <= 0) return "Posted today";
    if (days === 1) return "Posted yesterday";
    if (days < 30) return `Posted ${days} days ago`;
    return `Posted ${date.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function JobCard({ job, rank, generating, disabled, onGenerate }) {
    const matched = job.matchedSkills || [];
    const score = typeof job.matchScore === "number" ? job.matchScore : 0;
    const level = getMatchLevel(score);
    const extra = matched.length - MAX_CHIPS;
    const salary = formatSalary(job);
    const posted = formatPosted(job.created);

    return (
        <article className={`card card--interactive ${styles.jobCard}`} aria-labelledby={`job-${rank}-title`}>
            <div className={styles.jobTop}>
                <span className={styles.rank} aria-label={`Rank ${rank}`}>#{rank}</span>
                <span className={`${styles.level} ${styles[`level_${level.tone}`]}`}>
                    {score}% · {level.label}
                </span>
            </div>

            <div>
                <h3 id={`job-${rank}-title`} className={styles.jobTitle}>
                    {job.title}
                </h3>
                <p className={styles.jobMeta}>
                    <span>{job.company || "Company not listed"}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{job.location || "Location not listed"}</span>
                </p>
            </div>

            {job.snippet && <p className={styles.jobSnippet}>{job.snippet}</p>}

            {(salary || posted) && (
                <div className={styles.jobFacts}>
                    {salary && (
                        <p className={styles.salary}>
                            {salary.main}
                            <span className={styles.salaryDetail}> ({salary.detail})</span>
                        </p>
                    )}
                    {posted && <p className={styles.posted}>{posted}</p>}
                </div>
            )}

            <div className={styles.jobMatch}>
                {matched.length > 0 ? (
                    <>
                        <p className={styles.jobMatchLabel}>
                            Mentions {matched.length === 1 ? "1 of your skills" : `${matched.length} of your skills`}
                        </p>
                        <ul className={styles.chips}>
                            {matched.slice(0, MAX_CHIPS).map((skill) => (
                                <li key={skill} className="badge">{skill}</li>
                            ))}
                            {extra > 0 && <li className={`badge ${styles.badgeMore}`}>+{extra} more</li>}
                        </ul>
                    </>
                ) : (
                    <p className={styles.jobMatchLabel}>Doesn&apos;t mention your listed skills by name</p>
                )}
                {job.foundBy && (
                    <p className={styles.jobFoundBy}>From your search for &ldquo;{job.foundBy}&rdquo;</p>
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
