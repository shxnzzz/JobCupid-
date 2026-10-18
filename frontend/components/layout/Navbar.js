import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/site";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const close = () => setMenuOpen(false);
        router.events.on("routeChangeStart", close);
        return () => router.events.off("routeChangeStart", close);
    }, [router.events]);

    useEffect(() => {
        if (!menuOpen) return;
        const onKeyDown = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [menuOpen]);

    const isActive = (href) => !href.includes("#") && router.pathname === href;

    return (
        <header className={styles.header}>
            <nav className={`container ${styles.nav}`} aria-label="Main">
                <Logo />

                <button
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        {menuOpen ? (
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        ) : (
                            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        )}
                    </svg>
                </button>

                <div id="primary-navigation" className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}>
                    <ul className={styles.links}>
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={styles.link}
                                    aria-current={isActive(link.href) ? "page" : undefined}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link href="/match" className={`btn btn--primary btn--sm ${styles.cta}`}>
                        Find matching jobs
                    </Link>
                </div>
            </nav>
        </header>
    );
}
