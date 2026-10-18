export const SITE_NAME = "JobCupid";

export const SITE_DESCRIPTION =
    "Upload your resume and JobCupid finds live job openings in Singapore that match your skills, then helps you write a tailored cover letter.";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

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
