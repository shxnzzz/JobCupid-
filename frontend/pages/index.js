import Link from "next/link";
import Seo from "@/components/Seo";

export default function Home() {
  return (
    <>
      <Seo path="/" />
      <section className="section">
        <div className="container container--narrow" style={{ textAlign: "center" }}>
          <span className="eyebrow">Job search for Singapore</span>
          <h1>Find jobs that match your resume</h1>
          <p className="lead">
            Upload your resume once. JobCupid reads your skills, searches live job listings for them,
            and can draft a cover letter for any job you like.
          </p>
          <Link href="/match" className="btn btn--primary btn--lg">
            Upload your resume
          </Link>
        </div>
      </section>
    </>
  );
}
