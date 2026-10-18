import Link from "next/link";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" path="/404" noIndex />
      <section className="section">
        <div className="container container--narrow" style={{ textAlign: "center" }}>
          <span className="eyebrow">404</span>
          <h1>We couldn&apos;t find that page</h1>
          <p className="lead">The page may have moved, or the link might be wrong.</p>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn--secondary">
              Go to homepage
            </Link>
            <Link href="/match" className="btn btn--primary">
              Find matching jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
