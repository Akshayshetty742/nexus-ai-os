from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ✅ THIS MODEL WORKS WITH THIS VERSION
model = genai.GenerativeModel("gemini-pro")

app = FastAPI()

class Input(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "AI Engine Running 🚀"}

@app.post("/generate")
def generate_text(input: Input):
    try:
        response = model.generate_content(input.text)
        return {"result": response.text}
    except Exception as e:
        return {"error": str(e)}