import Link from "next/link";
import Seo from "@/components/Seo";
import ContentPage, { Section } from "@/components/content/ContentPage";
import ContactLine from "@/components/content/ContactLine";
import { POLICIES_LAST_UPDATED } from "@/lib/site";
import styles from "@/components/content/Content.module.css";

const TOC = [
  { id: "summary", label: "The short version" },
  { id: "what-we-collect", label: "What we process" },
  { id: "who-receives", label: "Who receives your data" },
  { id: "storage", label: "What we store" },
  { id: "cookies", label: "Cookies and tracking" },
  { id: "choices", label: "Your choices" },
  { id: "security", label: "Security" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact" },
];

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="How JobCupid handles your resume: what's processed, what's shared with OpenAI and Adzuna, and what's never stored."
        path="/privacy"
      />
      <ContentPage
        eyebrow="Privacy"
        title="Privacy Policy"
        intro="This page explains, in plain language, what happens to your resume and personal details when you use JobCupid."
        updated={POLICIES_LAST_UPDATED}
        toc={TOC}
      >
        <Section id="summary" title="The short version">
          <div className={styles.callout}>
            <p><strong>We don&apos;t store your resume.</strong> The file is deleted from our server as soon as its text has been read.</p>
            <p><strong>We don&apos;t have accounts or a database.</strong> Your profile and results only exist in your browser tab, and disappear when you close or refresh it.</p>
            <p><strong>Two services help us:</strong> OpenAI reads your resume and drafts cover letters, and Adzuna provides the job listings.</p>
            <p><strong>No ads, analytics or tracking cookies.</strong></p>
          </div>
        </Section>

        <Section id="what-we-collect" title="What we process">
          <h3>When you upload a resume</h3>
          <p>
            We receive your PDF file and extract its text. From that text we create a profile containing your name,
            email address, phone number, a short professional summary, your seniority and years of experience, your
            skills and suggested job titles. The profile is sent back to your browser.
          </p>

          <h3>When you search for jobs</h3>
          <p>
            Your browser sends us the job titles and skills in your profile, plus the short summary. We use them to
            search for listings and to rank the results.
          </p>

          <h3>When you write a cover letter</h3>
          <p>
            Your browser sends us your name, email address, phone number, summary and skills, along with the job
            title, company and description of the job you picked.
          </p>

          <h3>Technical information</h3>
          <p>
            Like any website, our server sees your IP address when you connect. We use it only to limit how many
            requests can be made in an hour, to keep the service available and prevent abuse. These counts are held
            in memory and reset at least every hour. Our hosting provider may also keep standard access logs.
          </p>
        </Section>

        <Section id="who-receives" title="Who receives your data">
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">What they receive</th>
                  <th scope="col">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>OpenAI</strong></td>
                  <td>The full text of your resume</td>
                  <td>To identify your skills, experience and suitable job titles</td>
                </tr>
                <tr>
                  <td><strong>OpenAI</strong></td>
                  <td>Your job titles, skills and summary, plus the text of the job listings found</td>
                  <td>To rank jobs by how closely they match your profile</td>
                </tr>
                <tr>
                  <td><strong>OpenAI</strong></td>
                  <td>Your name, contact details, summary and skills, plus the job details (only when you ask for a cover letter)</td>
                  <td>To draft the cover letter</td>
                </tr>
                <tr>
                  <td><strong>Adzuna</strong></td>
                  <td>The job titles (or skills) being searched for. No name, contact details or resume text.</td>
                  <td>To find live job listings</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>OpenAI.</strong> We use OpenAI&apos;s API. According to OpenAI&apos;s published policy, data sent
            through the API is not used to train their models by default, and may be retained for up to 30 days to
            monitor for abuse. See{" "}
            <ExternalLink href="https://developers.openai.com/api/docs/guides/your-data">
              OpenAI&apos;s data controls
            </ExternalLink>{" "}
            and{" "}
            <ExternalLink href="https://openai.com/policies/privacy-policy/">privacy policy</ExternalLink>.
          </p>
          <p>
            <strong>Adzuna.</strong> When you select <em>View job</em>, you leave JobCupid and go to Adzuna&apos;s
            website, where{" "}
            <ExternalLink href="https://www.adzuna.sg/privacy-policy.html">Adzuna&apos;s privacy notice</ExternalLink>{" "}
            applies. If you apply for a job, the employer or recruiter handles your application under their own
            policies.
          </p>
          <p>We don&apos;t sell your data or share it with anyone else.</p>
        </Section>

        <Section id="storage" title="What we store">
          <ul>
            <li>
              <strong>Your resume file:</strong> deleted from our server immediately after its text is extracted,
              including when something goes wrong. Any leftover files are also cleared whenever the server restarts.
            </li>
            <li>
              <strong>Your resume text and profile:</strong> held in memory only while your request is being
              processed. They aren&apos;t written to a database or file.
            </li>
            <li>
              <strong>Your results and cover letters:</strong> kept only in your browser tab. Closing or refreshing
              the page clears them. If you download a cover letter, the file is saved on your device.
            </li>
          </ul>
        </Section>

        <Section id="cookies" title="Cookies and tracking">
          <p>
            JobCupid doesn&apos;t set cookies and doesn&apos;t use analytics, advertising or tracking tools. Fonts are
            served from our own site, so loading a page doesn&apos;t contact third-party font services.
          </p>
        </Section>

        <Section id="choices" title="Your choices">
          <ul>
            <li>
              <strong>You decide what to upload.</strong> If you&apos;d rather not share certain details, such as
              your phone number or address, remove them from your resume before uploading. JobCupid still works
              without them.
            </li>
            <li>
              <strong>You can edit your profile</strong> before searching, and nothing is sent for a cover letter
              unless you ask for one.
            </li>
            <li>
              <strong>Deleting your data:</strong> because we don&apos;t keep your resume or profile, there&apos;s
              nothing stored on our side to delete. Close the tab to clear your results.
            </li>
          </ul>
        </Section>

        <Section id="security" title="Security">
          <p>
            Uploads are limited to PDF files of up to 2MB and are checked before processing. API keys are kept on
            the server and never sent to your browser, browsers can only call our server from the JobCupid website,
            and the number of requests per hour is limited. No system is perfectly secure, so please avoid uploading information you consider highly
            sensitive, such as identity card or bank details.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            If the way JobCupid handles data changes, we&apos;ll update this page and the date at the top. Please
            also see our <Link href="/terms">Terms of Use</Link>.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <ContactLine />
        </Section>
      </ContentPage>
    </>
  );
}
