import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Chat from "./models/Chat.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));
const app = express();
app.use(cors());
app.use(express.json());

// make sure this exists ABOVE routes
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { name,email, password } = req.body;

    // validation
    if (!email || !password ||!name) {
      return res.status(400).json({ error: "all fields are required" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Signup successful",
      userId: user._id
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id,name:user.name },
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  // check token exists
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user to request
    req.user = decoded;

    next(); // go to next function
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/generate", auth, async (req, res) => {
  try {
    const { prompt, apiKey, chatId } = req.body;

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

    let contents;

    if (chatId) {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      // convert DB messages → Gemini format
      contents = chat.messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      // add new user message
      contents.push({
        role: "user",
        parts: [{ text: fullPrompt }]
      });

    } else {
      contents = [
        {
          role: "user",
          parts: [{ text: fullPrompt }]
        }
      ];
    }

    const aiRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    });

    let chat;

    if (chatId) {
      chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      chat.messages.push({ role: "user", text: prompt });
      chat.messages.push({ role: "bot", text: aiRes.text });

      await chat.save();

    } else {
      chat = await Chat.create({
        userId: req.user.id,
        title: prompt.substring(0, 20),
        messages: [
          { role: "user", text: prompt },
          { role: "bot", text: aiRes.text }
        ]
      });
    }

    res.json({
      content: aiRes.text,
      chatId: chat._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.get("/history", auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});