import { useEffect, useRef, useState } from "react";
import styles from "./Match.module.css";

export default function CoverLetterModal({ letter, onClose }) {
    const dialogRef = useRef(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (letter && !dialog.open) {
            setStatus("");
            dialog.showModal();
            document.body.style.overflow = "hidden";
        } else if (!letter && dialog.open) {
            dialog.close();
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [letter]);

    const handleClose = () => {
        document.body.style.overflow = "";
        onClose();
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(letter.text);
            setStatus("Copied to clipboard.");
        } catch {
            setStatus("Couldn't copy. Please select the text and copy it manually.");
        }
    };

    const download = () => {
        const blob = new Blob([letter.text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const safeCompany = (letter.company || "company").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        a.href = url;
        a.download = `cover-letter-${safeCompany}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setStatus("Downloaded.");
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby="cover-letter-title"
            onClose={handleClose}
            onClick={(event) => {
                if (event.target === dialogRef.current) dialogRef.current.close();
            }}
        >
            {letter && (
                <div className={styles.dialogInner}>
                    <header className={styles.dialogHeader}>
                        <div>
                            <h2 id="cover-letter-title" className={styles.dialogTitle}>Your cover letter</h2>
                            <p className={styles.dialogSubtitle}>
                                {letter.company ? `${letter.jobTitle} at ${letter.company}` : letter.jobTitle}
                            </p>
                        </div>
                        <button
                            type="button"
                            className={styles.dialogClose}
                            onClick={() => dialogRef.current.close()}
                        >
                            <span className="sr-only">Close</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </header>

                    <div className={styles.dialogBody}>
                        <p className={styles.dialogNote}>
                            Written by AI. Check the details and edit it before you send it.
                        </p>
                        <pre className={styles.letter}>{letter.text}</pre>
                    </div>

                    <footer className={styles.dialogFooter}>
                        <p className={styles.dialogStatus} role="status" aria-live="polite">{status}</p>
                        <div className={styles.dialogActions}>
                            <button type="button" className="btn btn--secondary btn--sm" onClick={copy}>
                                Copy
                            </button>
                            <button type="button" className="btn btn--secondary btn--sm" onClick={download}>
                                Download .txt
                            </button>
                            <button type="button" className="btn btn--primary btn--sm" onClick={() => dialogRef.current.close()}>
                                Done
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </dialog>
    );
}
