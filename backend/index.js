import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ API ROUTE
app.post("/api/mentor", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      `You are a helpful student mentor.\n${message}`
    );

    const text = result.response.text();

    res.json({
      reply: text || "No response",
    });

  }catch (error) {
  console.error("🔥 GEMINI FULL ERROR:", error);

  res.status(500).json({
    reply: "Error generating response",
    error: error.message,
  });
}
});

// Root check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

