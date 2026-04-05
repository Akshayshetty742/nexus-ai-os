import express from "express";
import path from "path";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ✅ GEMINI API
app.post("/api/mentor", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    console.log("GEMINI:", data);

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    return res.json({ reply }); // ✅ ONLY ONE RESPONSE
  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: "Error" });
  }
});

// ✅ SERVE FRONTEND
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// ✅ FINAL FALLBACK (MUST BE LAST)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});