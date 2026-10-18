import Link from "next/link";
import styles from "./Logo.module.css";

export function LogoMark({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <rect width="32" height="32" rx="8" fill="#4f46e5" />
            <path
                d="M16 24.5s-7.5-4.6-7.5-10.1A4.15 4.15 0 0 1 16 12a4.15 4.15 0 0 1 7.5 2.4c0 5.5-7.5 10.1-7.5 10.1z"
                fill="#fff"
            />
            <path d="M21.5 7.5h3v3" fill="none" stroke="#fda4af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24.5 7.5l-5.5 5.5" fill="none" stroke="#fda4af" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

export default function Logo({ className = "" }) {
    return (
        <Link href="/" className={`${styles.logo} ${className}`} aria-label="JobCupid home">
            <LogoMark />
            <span className={styles.wordmark} aria-hidden="true">
                Job<span className={styles.accent}>Cupid</span>
            </span>
        </Link>
    );
}
