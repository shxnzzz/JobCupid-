"""Extracts plain text from a PDF resume and prints it as JSON.

Exit codes:
  0 - success, prints {"text": "..."}
  1 - unexpected/internal error
  2 - a problem the user can fix, prints {"error": "..."} with a safe message
"""

import json
import os
import sys

import pdfplumber


class ResumeParseError(Exception):
    """Raised for problems the user can fix (e.g. unreadable or image-only PDF)."""


def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages = [page.extract_text() for page in pdf.pages]
    except Exception:
        raise ResumeParseError("We couldn't open this PDF. It may be damaged or password-protected.")

    text = "\n".join(page for page in pages if page).strip()
    if not text:
        raise ResumeParseError(
            "We couldn't find any text in this PDF. If it's a scanned image, please upload a text-based PDF."
        )
    return text


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    try:
        resume_text = extract_text_from_pdf(pdf_path)
    except ResumeParseError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(2)

    print(json.dumps({"text": resume_text}))
