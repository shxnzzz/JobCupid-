import ResumeUpload from "@/components/ResumeUpload";
import Seo from "@/components/Seo";

export default function Match() {
  return (
    <>
      <Seo
        title="Find matching jobs"
        description="Upload your PDF resume to see live job listings in Singapore that match your skills."
        path="/match"
      />
      <section className="section">
        <div className="container">
          <ResumeUpload />
        </div>
      </section>
    </>
  );
}
