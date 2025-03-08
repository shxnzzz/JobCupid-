import ResumeUpload from "../components/ResumeUpload";

export default function Home() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">JobCupid - AI Resume Matcher</h1>
      <ResumeUpload />
    </div>
  );
}
