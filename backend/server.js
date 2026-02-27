import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";


const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API key required" });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    });

    res.json({ content: response.text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});