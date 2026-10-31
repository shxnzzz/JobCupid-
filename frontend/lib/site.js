export const SITE_NAME = "JobCupid";

export const SITE_DESCRIPTION =
    "Upload your resume and JobCupid finds live job openings in Singapore that match your skills, then helps you write a tailored cover letter.";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const GITHUB_URL = "https://github.com/shxnzzz/JobCupid-";

// Set to an email address to show it on the Privacy and Terms pages
export const CONTACT_EMAIL = null;

export const POLICIES_LAST_UPDATED = "31 October 2026";

export const NAV_LINKS = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy" },
];

export const FOOTER_LINKS = [
    { href: "/match", label: "Find jobs" },
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
];
