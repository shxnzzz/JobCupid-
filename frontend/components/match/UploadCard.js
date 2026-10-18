import { useRef, useState } from "react";
import Link from "next/link";
import styles from "./Match.module.css";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function validateFile(file) {
    if (!file) return "Please choose a resume file.";
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return "Only PDF files are supported.";
    if (file.size === 0) return "This file is empty.";
    if (file.size > MAX_FILE_SIZE) return "File size must be under 2MB.";
    return null;
}

function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadCard({ uploading, error, onUpload, onClearError }) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const selectFile = (selected) => {
        if (!selected) return;
        onClearError();
        const validationError = validateFile(selected);
        if (validationError) {
            setFile(null);
            setFileError(validationError);
            return;
        }
        setFileError(null);
        setFile(selected);
    };

    const clearFile = () => {
        setFile(null);
        setFileError(null);
        onClearError();
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const validationError = validateFile(file);
        if (validationError) {
            setFileError(validationError);
            return;
        }
        onUpload(file);
    };

    const shownError = fileError || error;

    return (
        <form className={`card ${styles.uploadCard}`} onSubmit={handleSubmit} noValidate>
            <div
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""} ${file ? styles.dropzoneFilled : ""}`}
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!uploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    if (!uploading) selectFile(event.dataTransfer.files[0]);
                }}
            >
                <input
                    ref={inputRef}
                    id="resume-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(event) => selectFile(event.target.files[0])}
                />

                {file ? (
                    <div className={styles.fileRow}>
                        <svg className={styles.fileIcon} width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                            <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        </svg>
                        <div className={styles.fileMeta}>
                            <p className={styles.fileName}>{file.name}</p>
                            <p className={styles.fileSize}>PDF · {formatSize(file.size)}</p>
                        </div>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={clearFile} disabled={uploading}>
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className={styles.dropzoneEmpty}>
                        <svg className={styles.uploadIcon} width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 16V4m0 0l-4 4m4-4l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <p className={styles.dropzoneTitle}>Drag and drop your resume here</p>
                        <p className={styles.dropzoneHint}>PDF only, up to 2MB</p>
                        <button type="button" className="btn btn--secondary" onClick={() => inputRef.current?.click()}>
                            Choose a PDF
                        </button>
                    </div>
                )}
            </div>

            {shownError && (
                <div className="alert alert--error" role="alert">
                    {shownError}
                </div>
            )}

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={!file || uploading}>
                {uploading ? (
                    <>
                        <span className={styles.spinner} aria-hidden="true" />
                        Analysing your resume…
                    </>
                ) : (
                    "Find matching jobs"
                )}
            </button>

            <p className={styles.consent}>
                By uploading, you agree that your resume text is sent to OpenAI to identify your skills and suitable
                roles. We don&apos;t store your resume: the file is deleted from our server straight after.
                See our <Link href="/privacy">Privacy Policy</Link>.
            </p>
        </form>
    );
}
