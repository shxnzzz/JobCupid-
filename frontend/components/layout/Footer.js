import Link from "next/link";
import Logo from "./Logo";
import { FOOTER_LINKS } from "@/lib/site";
import styles from "./Footer.module.css";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <div className={styles.brand}>
                    <Logo />
                    <p className={styles.tagline}>
                        Upload your resume once and see jobs that match your skills.
                    </p>
                </div>

                <nav aria-label="Footer">
                    <ul className={styles.links}>
                        {FOOTER_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className={styles.link}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className={`container ${styles.bottom}`}>
                <p>© {year} JobCupid</p>
                <p>
                    Job listings provided by{" "}
                    <a href="https://www.adzuna.sg" target="_blank" rel="noopener noreferrer">
                        Adzuna
                    </a>
                    .
                </p>
            </div>
        </footer>
    );
}
