import openai

OPENAI_API_KEY = process.env.OPENAI_API_KEY;  
try:
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Test connection"}]
    )
    print(response)
except Exception as e:
    print("GPT API Error:", str(e))
