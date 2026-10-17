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
    match = re.search(r"\b[689]\d{3}[-.\s]?\d{4}\b", text)
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
        # Programming Languages
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust", 
        "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Lua",
        "Dart", "Haskell", "Clojure", "Erlang", "Elixir", "F#", "OCaml", "Julia",
        
        # Web Technologies
        "HTML", "CSS", "SASS", "SCSS", "LESS", "Bootstrap", "Tailwind CSS", "jQuery",
        "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Gatsby",
        "Node.js", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot",
        "Laravel", "Symfony", "CodeIgniter", "ASP.NET", "Ruby on Rails", "Sinatra",
        
        # Databases
        "SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle", "SQL Server", "MongoDB",
        "Redis", "Cassandra", "DynamoDB", "CouchDB", "Neo4j", "Elasticsearch",
        "InfluxDB", "TimescaleDB", "MariaDB", "Firebase", "Supabase",
        
        # Cloud & DevOps
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitLab CI",
        "GitHub Actions", "Terraform", "Ansible", "Chef", "Puppet", "Vagrant",
        "Prometheus", "Grafana", "ELK Stack", "Splunk", "Datadog", "New Relic",
        
        # Mobile Development
        "React Native", "Flutter", "Xamarin", "Ionic", "Cordova", "PhoneGap",
        "Android Studio", "Xcode", "SwiftUI", "Jetpack Compose", "Kotlin Multiplatform",
        
        # Data Science & AI/ML
        "Machine Learning", "Deep Learning", "Data Science", "Data Analysis", "Pandas",
        "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "OpenCV", "NLTK",
        "spaCy", "Hugging Face", "Transformers", "Jupyter", "R Studio", "Tableau",
        "Power BI", "Apache Spark", "Hadoop", "Apache Kafka", "Apache Airflow",
        
        # Testing & Quality
        "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Playwright", "Pytest",
        "JUnit", "TestNG", "Cucumber", "SpecFlow", "Postman", "Insomnia",
        
        # Version Control & Tools
        "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial", "Perforce",
        "VS Code", "IntelliJ IDEA", "Eclipse", "Vim", "Emacs", "Sublime Text",
        
        # Design & UI/UX
        "Figma", "Adobe XD", "Sketch", "InVision", "Zeplin", "Adobe Photoshop",
        "Adobe Illustrator", "Adobe InDesign", "Canva", "Framer", "Principle",
        
        # Marketing & Analytics
        "SEO", "SEM", "Google Ads", "Facebook Ads", "LinkedIn Ads", "Twitter Ads",
        "Google Analytics", "Google Tag Manager", "Adobe Analytics", "Mixpanel",
        "Amplitude", "Hotjar", "Crazy Egg", "Optimizely", "VWO", "Unbounce",
        "Content Marketing", "Email Marketing", "Social Media Marketing", "PPC",
        "Conversion Optimization", "A/B Testing", "Growth Hacking", "HubSpot",
        "Salesforce", "Pardot", "Marketo", "Mailchimp", "Constant Contact",
        
        # Business & Productivity
        "Excel", "Google Sheets", "PowerPoint", "Google Slides", "Notion", "Airtable",
        "Trello", "Asana", "Monday.com", "Slack", "Microsoft Teams", "Zoom",
        "Jira", "Confluence", "Linear", "ClickUp", "Monday.com",
        
        # Security
        "Cybersecurity", "Penetration Testing", "OWASP", "Burp Suite", "Nmap",
        "Wireshark", "Metasploit", "Nessus", "Qualys", "Rapid7", "Splunk SIEM",
        
        # Blockchain & Crypto
        "Blockchain", "Ethereum", "Solidity", "Web3", "Smart Contracts", "DeFi",
        "NFT", "IPFS", "Hyperledger", "Bitcoin", "Cryptocurrency",
        
        # Other Technologies
        "REST API", "GraphQL", "gRPC", "WebSocket", "Microservices", "Serverless",
        "Lambda", "Vercel", "Netlify", "Heroku", "DigitalOcean", "Linode",
        "Linux", "Ubuntu", "CentOS", "Windows Server", "macOS", "Unix",
        "Apache", "Nginx", "IIS", "CDN", "CloudFlare", "AWS CloudFront"
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
