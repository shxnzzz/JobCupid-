import ChipEditor from "./ChipEditor";
import styles from "./Match.module.css";

export const MAX_ROLES = 5;
export const MAX_SKILLS = 30;

function Field({ label, value }) {
    return (
        <div className={styles.field}>
            <dt>{label}</dt>
            <dd className={value ? undefined : styles.fieldMissing}>{value || "Not found"}</dd>
        </div>
    );
}

function formatExperience(profile) {
    const parts = [];
    if (profile.seniority) parts.push(profile.seniority);
    if (typeof profile.yearsExperience === "number") {
        const years = profile.yearsExperience;
        parts.push(`${years} ${years === 1 ? "year" : "years"} experience`);
    }
    return parts.join(" · ");
}

export default function ProfileSummary({ profile, draft, onDraftChange, dirty, onSearch, onReset, busy }) {
    const experience = formatExperience(profile);
    const canSearch = draft.roles.length > 0 || draft.skills.length > 0;

    return (
        <section className={`card ${styles.profile}`} aria-labelledby="profile-heading">
            <div className={styles.profileHeader}>
                <div>
                    <span className={styles.aiTag}>Read by AI</span>
                    <h2 id="profile-heading" className={styles.sectionTitle}>Your profile</h2>
                    <p className="text-muted">
                        Check what we picked up from your resume. Edit the job titles and skills, then update your results.
                    </p>
                </div>
                <button type="button" className="btn btn--secondary btn--sm" onClick={onReset} disabled={busy}>
                    Upload a different resume
                </button>
            </div>

            {(profile.summary || experience) && (
                <div className={styles.summaryBox}>
                    {experience && <p className={styles.experience}>{experience}</p>}
                    {profile.summary && <p className={styles.summaryText}>{profile.summary}</p>}
                </div>
            )}

            <dl className={styles.fields}>
                <Field label="Name" value={profile.name} />
                <Field label="Email" value={profile.email} />
                <Field label="Phone" value={profile.phone} />
            </dl>

            <div className={styles.editors}>
                <ChipEditor
                    id="roles"
                    label="Job titles to search"
                    hint="We search live listings for each of these."
                    items={draft.roles}
                    max={MAX_ROLES}
                    placeholder="e.g. Data Analyst"
                    disabled={busy}
                    onChange={(roles) => onDraftChange({ ...draft, roles })}
                />
                <ChipEditor
                    id="skills"
                    label="Skills"
                    hint="Used to rank jobs and write cover letters."
                    items={draft.skills}
                    max={MAX_SKILLS}
                    placeholder="e.g. Python"
                    disabled={busy}
                    onChange={(skills) => onDraftChange({ ...draft, skills })}
                />
            </div>

            <div className={styles.profileFooter}>
                <p className={styles.helper} aria-live="polite">
                    {!canSearch
                        ? "Add at least one job title or skill to search."
                        : dirty
                            ? "You have changes that aren't reflected in your results yet."
                            : "Results are up to date."}
                </p>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={onSearch}
                    disabled={busy || !canSearch || !dirty}
                >
                    Update results
                </button>
            </div>
        </section>
    );
}
