import pdfplumber
import spacy
import re
import json
import sys
import os

# Load SpaCy NLP model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(pdf_path):
    """Extracts text from a given PDF file."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
        return text.strip()
    except Exception as e:
        return json.dumps({"error": f"Error reading PDF: {str(e)}"})

# Extract Email
def extract_email(text):
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else "Not found"

# Extract Phone Number
def extract_phone(text):
    match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    return match.group(0) if match else "Not found"

# Extract Name
def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return "Not found"

# Extract Skills
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
    return list(found_skills) if found_skills else []

# Main Resume Parsing Function
def parse_resume(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)  # Extract text from PDF
    if not extracted_text:
        return {"error": "No text extracted from resume"}
    
    return {
        "name": extract_name(extracted_text),
        "email": extract_email(extracted_text),
        "phone": extract_phone(extracted_text),
        "skills": extract_skills(extracted_text)
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]

    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)

    parsed_data = parse_resume(pdf_path)
    print(json.dumps(parsed_data, indent=4))
