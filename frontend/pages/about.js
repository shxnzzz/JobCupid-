import Link from "next/link";
import Seo from "@/components/Seo";
import ContentPage, { Section } from "@/components/content/ContentPage";
import { GITHUB_URL } from "@/lib/site";
import styles from "@/components/content/Content.module.css";

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="Why JobCupid exists, how it matches your resume to live job listings, and what it's built with."
        path="/about"
      />
      <ContentPage
        eyebrow="About JobCupid"
        title="Spend less time scrolling, more time applying"
        intro="JobCupid reads your resume, works out which jobs you're a good fit for, and shows you the best matches from live listings in Singapore."
      >
        <Section id="why" title="Why we built it">
          <p>
            Looking for a job usually means hours of scrolling through listings, opening each one, and checking
            whether you actually meet the requirements. Most of that time goes on jobs that were never a good fit.
          </p>
          <p>
            JobCupid flips that around. Instead of you searching for jobs, you upload your resume once and the jobs
            that suit your experience come to you, ranked from best to weakest match.
          </p>
        </Section>

        <Section id="how-it-works" title="How it works">
          <ol className={styles.steps}>
            <li>
              <strong>Upload your resume</strong>
              Upload a PDF. Our AI reads it and builds a short profile: your skills, your level of experience and
              the job titles you&apos;re a realistic fit for.
            </li>
            <li>
              <strong>Check and edit your profile</strong>
              Remove anything that&apos;s wrong, add anything that&apos;s missing, and choose which job titles to
              search for.
            </li>
            <li>
              <strong>See ranked matches</strong>
              We search live job listings for each job title, remove duplicates, and give every job a match score
              so the best fits are at the top.
            </li>
            <li>
              <strong>Write a cover letter</strong>
              For any job you like, generate a draft cover letter based on your profile and the job description,
              then edit it before you send it.
            </li>
          </ol>
        </Section>

        <Section id="matching" title="How jobs are ranked">
          <p>Every job gets a match score out of 100:</p>
          <ul>
            <li>
              <strong>70% meaning.</strong> We use AI text embeddings to compare your profile with the job&apos;s
              title and description. This picks up good fits even when the listing uses different words from your
              resume.
            </li>
            <li>
              <strong>30% skills.</strong> We count how many of your skills the listing mentions by name. Five or
              more gets full marks.
            </li>
          </ul>
          <p>
            The score is an estimate to help you decide where to look first. It isn&apos;t a prediction of whether
            you&apos;ll get the job, so always read the full listing.
          </p>
        </Section>

        <Section id="honest" title="What to know before you use it">
          <ul>
            <li>
              <strong>Singapore only, for now.</strong> Job listings come from Adzuna&apos;s Singapore listings.
            </li>
            <li>
              <strong>Text-based PDFs only.</strong> Scanned or photographed resumes can&apos;t be read yet.
            </li>
            <li>
              <strong>AI can make mistakes.</strong> That&apos;s why you can edit your profile before searching, and
              why cover letters are drafts for you to review.
            </li>
            <li>
              <strong>We don&apos;t store your resume.</strong> The file is deleted as soon as the text is read.
              See the <Link href="/privacy">Privacy Policy</Link> for exactly what happens to your data.
            </li>
            <li>
              <strong>It&apos;s free.</strong> There are no accounts, subscriptions or ads.
            </li>
          </ul>
        </Section>

        <Section id="built-with" title="What it's built with">
          <ul>
            <li>
              <strong>Frontend:</strong> Next.js and React
            </li>
            <li>
              <strong>Backend:</strong> Node.js and Express, with Python for reading PDFs
            </li>
            <li>
              <strong>AI:</strong> OpenAI models for reading resumes, ranking jobs by meaning and drafting cover
              letters
            </li>
            <li>
              <strong>Job listings:</strong>{" "}
              <a href="https://www.adzuna.sg" target="_blank" rel="noopener noreferrer">
                Adzuna<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </Section>

        <Section id="story" title="The story">
          <p>
            JobCupid started as a hackathon project built around one question: what if job seekers didn&apos;t
            have to dig through hundreds of listings to find the few that fit? The first version matched resumes
            against a fixed list of skills. It has since been rebuilt with AI resume reading, meaning-based ranking,
            and a redesigned, accessible interface.
          </p>
          <p>
            JobCupid is an independent personal project. The source code is available on{" "}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </Section>

        <div className={styles.ctaBox}>
          <h2>Ready to see your matches?</h2>
          <p>It takes about 10 seconds from upload to results.</p>
          <div className={styles.ctaActions}>
            <Link href="/match" className="btn btn--primary btn--lg">
              Upload your resume
            </Link>
          </div>
        </div>
      </ContentPage>
    </>
  );
}
