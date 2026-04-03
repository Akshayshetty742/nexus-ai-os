import google.generativeai as genai
from pypdf import PdfReader
import json
import os

# Get API key from environment (safer)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_KEY_HERE")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

def generate_study_plan(pdf_path):
    """PDF File -> JSON Schedule"""
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    
    prompt = f"""
    Extract dates from syllabus. Return ONLY JSON array.
    Format: [{{"title": "Midterm", "date": "2025-09-15", "type": "exam"}}]
    Text: {text[:9000]}
    """
    
    response = model.generate_content(prompt)
    clean = response.text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

if __name__ == "__main__":
    print("AI Brain Ready!")