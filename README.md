# FrontForge

FrontForge is an **AI-powered frontend generator** that creates complete websites from a simple prompt.  
Users enter a prompt and their API key, and the system generates **HTML, CSS, and JavaScript code instantly**.

The project uses a **Node.js backend with Express** and the **Google Gemini API** to generate frontend code.

---

## Features

- Generate complete **HTML, CSS, and JS websites**
- Simple **chat-style interface**
- **Live code viewer** with tabs for HTML, CSS, JS
- **Theme toggle (light / dark mode)**
- **Chat history simulation**
- Secure API key input
- Fast AI generation using Gemini

---

## Tech Stack

### Frontend
- HTML
- CSS
- Vanilla JavaScript

### Backend
- Node.js
- Express
- Google Gemini API

### Dependencies
- express
- cors
- dotenv
- @google/genai

---

## Project Structure
```
frontforge/
│
├── backend/
│ ├── server.js
│ ├── package.json
│
├── frontend/
│ ├── index.html
│ ├── style.css
│ ├── indexscript.js
│
└── README.md
```

---

## How It Works

1. User enters a prompt describing a website.
2. The frontend sends a request to the backend API.
3. The backend forwards the prompt to Gemini AI.
4. Gemini generates:
   - HTML
   - CSS
   - JavaScript
5. The frontend extracts each section and displays it in tabs.

---

## API Endpoint

### POST `/generate`

Request body:

```json
{
  "prompt": "build a landing page",
  "apiKey": "your_api_key"
}
```
**Response :**
```
HTML:
<generated html>

CSS:
<generated css>

JS:
<generated javascript>
```

---

## Installation
1. **Clone the repository**
```bash
git clone https://github.com/yourusername/frontforge.git
cd frontforge
```
2. **Install backend dependencies**
```bash
cd backend
npm install
```
3. **Start the server**
```bash
npm start
```
Server will run on:
```http://localhost:5000```
4. **Run the frontend**
Open:
```index.html```

---

## Usage

1. Enter your **Gemini API key**

2. Write a prompt like:
   ```Create a modern portfolio website with hero section and contact form```
3. Click send.

The AI will generate:

- HTML
- CSS
- JavaScript

You can switch between code tabs in the right panel.
---
## Example Prompt
```
Build a responsive login page with gradient background and glassmorphism card
```
---
## Future Improvements

- Live website preview
- Download generated code as ZIP
- Deploy generated website
- Support React / Next.js generation
- Save chat history
- Multiple AI model support
---

## 👨‍💻 Author

Sayujya Tiwari

GitHub: https://github.com/Reaven010

Naman Joshi
Github: https://github.com/ELTcoder4

