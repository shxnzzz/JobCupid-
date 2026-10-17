# JobCupid - things to know before you get started 
To run this file you are required to install the dependencies in  requirements.txt 
1. Cd backend 
2. pip install -r requirements.txt 

install pdf plumber spacy 
1. pip install pdfplumber spacy
2. python -m spacy download en_core_web_sm

To run , enter in cmd / vsc terminal 
- cd backend 
- node server.js 

- cd frontend 
- npm run dev ( this will generate the locahost URL)
- enter the local host url in the browser 

Create a `.env` file under the `backend` folder with these variables:

OPENAI_API_KEY= your_openai_key_here
ADZUNA_API_ID= your_adzuna_app_id
ADZUNA_API_KEY= your_adzuna_app_key

And a `.env.local` under `Frontend` (Next.js) if you want to override API base URL:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000