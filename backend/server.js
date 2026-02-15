import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import archiver from "archiver";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }

    });

    const fullPrompt = `
You are a professional frontend developer.

Return response EXACTLY in this format:

HTML:
<complete html code>

CSS:
<complete css code>

JS:
<complete js code>

Do NOT wrap code in markdown.
Do NOT add explanations.

User Request:
${prompt}
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ content: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
