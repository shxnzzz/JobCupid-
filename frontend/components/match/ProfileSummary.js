import styles from "./Match.module.css";

function Field({ label, value }) {
    const missing = !value || value === "Not found";
    return (
        <div className={styles.field}>
            <dt>{label}</dt>
            <dd className={missing ? styles.fieldMissing : undefined}>{missing ? "Not found" : value}</dd>
        </div>
    );
}

export default function ProfileSummary({ profile, onReset, disabled }) {
    const skills = profile.skills || [];

    return (
        <section className={`card ${styles.profile}`} aria-labelledby="profile-heading">
            <div className={styles.profileHeader}>
                <div>
                    <h2 id="profile-heading" className={styles.sectionTitle}>What we found in your resume</h2>
                    <p className="text-muted">These details are used to search for jobs and write cover letters.</p>
                </div>
                <button type="button" className="btn btn--secondary btn--sm" onClick={onReset} disabled={disabled}>
                    Upload a different resume
                </button>
            </div>

            <dl className={styles.fields}>
                <Field label="Name" value={profile.name} />
                <Field label="Email" value={profile.email} />
                <Field label="Phone" value={profile.phone} />
            </dl>

            <div>
                <h3 className={styles.skillsTitle}>
                    Skills <span className={styles.count}>({skills.length})</span>
                </h3>
                {skills.length > 0 ? (
                    <ul className={styles.chips}>
                        {skills.map((skill) => (
                            <li key={skill} className="badge">{skill}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted">No skills detected.</p>
                )}
                <p className={styles.helper}>
                    JobCupid recognises skills from a fixed list, so some skills on your resume may not appear here.
                </p>
            </div>
        </section>
    );
}
