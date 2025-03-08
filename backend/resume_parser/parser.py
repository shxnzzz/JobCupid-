import pdfplumber
import spacy
import re
import json
import sys
import os

# Load SpaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Ensure file path is provided
if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided"}))
    sys.exit(1)

pdf_path = sys.argv[1]

# Check if file exists
if not os.path.exists(pdf_path):
    print(json.dumps({"error": f"File not found: {pdf_path}"}))
    sys.exit(1)

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
        return text.strip()
    except Exception as e:
        print(json.dumps({"error": f"Error reading PDF: {str(e)}"}))
        sys.exit(1)

# Extract email using regex
def extract_email(text):
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else "Not found"

# Extract phone number using regex
def extract_phone(text):
    match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    return match.group(0) if match else "Not found"

# Extract name using NLP (SpaCy)
def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return "Not found"

# Extract skills using a predefined keyword list
def extract_skills(text):
    SKILL_LIST = [
    "Python", "JavaScript", "Machine Learning", "React", "Node.js", "SQL",
    "Data Science", "AWS", "C++", "Java", "SEO", "Google Ads", "Facebook Ads",
    "Keyword Research", "Content Marketing", "Blogging", "Email Marketing",
    "Copywriting", "Google Analytics", "A/B Testing", "Conversion Optimization",
    "HubSpot", "Salesforce", "WordPress", "Docker", "Kubernetes", "TensorFlow",
    "PyTorch", "Excel", "Marketing", "Advertising", "PPC", "Campaign Management"
    ]
    doc = nlp(text)
    found_skills = set()

    for token in doc:
        if token.text.lower() in [skill.lower() for skill in SKILL_LIST]:
            found_skills.add(token.text)

    return list(found_skills) if found_skills else []  # ✅ Always return an array

# Parse resume
def parse_resume(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    
    if not text:
        return {"error": "No text extracted from resume"}

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text)
    }

# Process the resume and print JSON output only
parsed_data = parse_resume(pdf_path)
print(json.dumps(parsed_data))  # ✅ No extra logs, only valid JSON
