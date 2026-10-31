import Link from "next/link";
import Seo from "@/components/Seo";
import ContentPage, { Section } from "@/components/content/ContentPage";
import ContactLine from "@/components/content/ContactLine";
import { POLICIES_LAST_UPDATED } from "@/lib/site";
import styles from "@/components/content/Content.module.css";

const TOC = [
  { id: "about-service", label: "About the service" },
  { id: "using", label: "Using JobCupid" },
  { id: "ai", label: "AI-generated content" },
  { id: "listings", label: "Job listings" },
  { id: "availability", label: "Availability and limits" },
  { id: "liability", label: "No warranty and liability" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact" },
];

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Use"
        description="The terms for using JobCupid, including how AI-generated content and third-party job listings should be used."
        path="/terms"
      />
      <ContentPage
        eyebrow="Terms"
        title="Terms of Use"
        intro="By using JobCupid you agree to these terms. They're written to be short and readable."
        updated={POLICIES_LAST_UPDATED}
        toc={TOC}
      >
        <div className={styles.callout}>
          <p>
            <strong>In short:</strong> JobCupid is a free tool that helps you find and prioritise jobs. Check
            everything it suggests, apply through the original listing, and use it fairly.
          </p>
        </div>

        <Section id="about-service" title="About the service">
          <p>
            JobCupid is a free, independent personal project. It reads your resume, suggests job titles and
            skills, finds live job listings and ranks them, and can draft cover letters. It isn&apos;t an employer,
            recruitment agency or job board, and it doesn&apos;t submit applications for you.
          </p>
        </Section>

        <Section id="using" title="Using JobCupid">
          <p>You agree to:</p>
          <ul>
            <li>Only upload your own resume, or one you have permission to use.</li>
            <li>Not upload files that contain malware or content that is illegal or harmful.</li>
            <li>
              Not misuse the service: for example by sending automated requests, trying to get around rate limits,
              or attempting to disrupt or gain unauthorised access to the service.
            </li>
          </ul>
          <p>
            How we handle the information you upload is explained in our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </Section>

        <Section id="ai" title="AI-generated content">
          <p>
            Your profile, match scores and cover letters are produced with the help of AI and may be incomplete or
            wrong. In particular:
          </p>
          <ul>
            <li>Review and correct your profile before relying on the results.</li>
            <li>
              Match scores are estimates to help you prioritise. They don&apos;t predict whether you&apos;ll be
              offered an interview or a job.
            </li>
            <li>
              Cover letters are drafts. Read and edit them before sending, and make sure everything in them is true.
              You&apos;re responsible for what you send to employers.
            </li>
          </ul>
        </Section>

        <Section id="listings" title="Job listings">
          <p>
            Job listings are provided by Adzuna and the employers and recruiters who post them. We don&apos;t check
            or endorse them, and we can&apos;t guarantee that a job is still open or that its details, including
            salary, are accurate. Applications happen on third-party websites, under their terms.
          </p>
          <p>
            Be careful with any listing that asks you for payment or for sensitive personal or financial details.
          </p>
        </Section>

        <Section id="availability" title="Availability and limits">
          <p>
            JobCupid is provided free of charge and may change, be unavailable at times, or be discontinued. To keep
            it running for everyone, the number of uploads, searches and cover letters per hour is limited.
          </p>
        </Section>

        <Section id="liability" title="No warranty and liability">
          <p>
            JobCupid is provided &quot;as is&quot;, without warranties of any kind. To the extent permitted by law,
            we aren&apos;t liable for any loss or damage arising from your use of the service, including decisions
            you make based on its suggestions, or from the content of third-party job listings and websites.
          </p>
        </Section>

        <Section id="changes" title="Changes to these terms">
          <p>
            We may update these terms from time to time. When we do, we&apos;ll change the date at the top of this
            page. Continuing to use JobCupid after a change means you accept the updated terms.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <ContactLine />
        </Section>
      </ContentPage>
    </>
  );
}
