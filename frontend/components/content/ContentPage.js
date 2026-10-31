import styles from "./Content.module.css";

export default function ContentPage({ eyebrow, title, intro, updated, toc, children }) {
    return (
        <article className={styles.page}>
            <header className={styles.header}>
                <div className="container container--narrow">
                    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                    <h1 className={styles.title}>{title}</h1>
                    {intro && <p className="lead">{intro}</p>}
                    {updated && <p className={styles.updated}>Last updated {updated}</p>}
                </div>
            </header>

            <div className={`container container--narrow ${styles.body}`}>
                {toc && toc.length > 0 && (
                    <nav className={styles.toc} aria-labelledby="toc-heading">
                        <h2 id="toc-heading" className={styles.tocTitle}>On this page</h2>
                        <ol>
                            {toc.map((item) => (
                                <li key={item.id}>
                                    <a href={`#${item.id}`}>{item.label}</a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}
                <div className={styles.prose}>{children}</div>
            </div>
        </article>
    );
}

export function Section({ id, title, children }) {
    return (
        <section id={id} aria-labelledby={`${id}-heading`} className={styles.section}>
            <h2 id={`${id}-heading`}>{title}</h2>
            {children}
        </section>
    );
}
