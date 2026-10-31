import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/site";

export default function ContactLine() {
    if (CONTACT_EMAIL) {
        return (
            <p>
                If you have questions, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
        );
    }
    return (
        <p>
            A contact email will be added here soon. In the meantime, you can reach the developer through the
            project&apos;s{" "}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                GitHub page<span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
        </p>
    );
}
