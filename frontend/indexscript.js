let generatedCode = {
    html: "",
    css: "",
    js: ""
};

let currentTab = "html";

// --- 1. MOCK DATA ---
const historyData = {
    "chat-v3": {
        code: "// Version 3: Full History\nconst historyData = { ... };",
        msgs: [{ role: "user", text: "Show me the history." }, { role: "bot", text: "Here is the history view (v3)." }]
    },
    "chat-v2": {
        code: "/* Version 2: Theme Toggle */\nbody.light-theme { ... }",
        msgs: [{ role: "user", text: "I need a light mode." }, { role: "bot", text: "I've added the theme toggle button." }]
    },
    "chat-v1": {
        code: "\n<div class='container'>...</div>",
        msgs: [{ role: "user", text: "Build the layout." }, { role: "bot", text: "Here is the basic Flexbox layout." }]
    },
    "chat-react": {
        code: "const App = () => <div>Hello React</div>;",
        msgs: [{ role: "user", text: "React component help?" }, { role: "bot", text: "Here is a functional component." }]
    }
};

// --- 2. ELEMENTS ---
const welcomeScreen = document.getElementById('welcome-screen');
const messageList = document.getElementById('message-list');
const inputField = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const scrollContainer = document.getElementById('scroll-container');
const codeContent = document.getElementById('code-content');
const menuItems = document.querySelectorAll('.menu-group .menu-item:not(#theme-btn)');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

// Grab the new API input
const apiInput = document.getElementById('api-input');

// --- 3. FUNCTIONS ---

function showWelcome() {
    welcomeScreen.style.display = "block";
    messageList.innerHTML = "";
    codeContent.innerText = "// Code artifacts will appear here...";
    menuItems.forEach(i => i.classList.remove('active'));
    document.getElementById('btn-new-chat').classList.add('active');
}

function appendMessage(role, text) {
    welcomeScreen.style.display = "none";
    const row = document.createElement('div');
    row.classList.add('message-row', role);

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerText = text;

    row.appendChild(bubble);
    messageList.appendChild(row);
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

async function handleSend() {
    const text = inputField.value.trim();
    const apiKey = apiInput.value.trim();
    if (text === "") return;
    if(apiKey===""){
        appendMessage('bot',"please enter your api key. ")
        return;
    }

    appendMessage('user', text);
    inputField.value = "";
    inputField.focus();

    // Show loading
    appendMessage('bot', "Generating website...");
    codeContent.innerText = "// Generating...";

    try {
        const response = await fetch("http://localhost:5000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: text,apiKey: apiKey })
        });

        const data = await response.json();

        if (!data.content) {
            throw new Error("No content returned");
        }

        // Show AI response in chat
        appendMessage('bot', "Website generated successfully!");

        // Show raw code in right panel
        generatedCode = extractSections(data.content);
        switchTab("html");

    } catch (error) {
        appendMessage('bot', "Error generating website.");
        codeContent.innerText = "// Error occurred";
        console.error(error);
    }
}

// --- 4. LISTENERS ---

sendBtn.addEventListener('click', handleSend);

// Keydown is better for handling stuck keys or rapid typing
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Theme Toggle
let isLightMode = false;
themeBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    document.body.classList.toggle('light-theme');
    if (isLightMode) {
        themeIcon.innerText = "☾";
        themeText.innerText = "Dark Mode";
    } else {
        themeIcon.innerText = "☀";
        themeText.innerText = "Light Mode";
    }
});

// Sidebar Navigation
menuItems.forEach(item => {
    item.addEventListener('click', function () {
        if (this.id === 'btn-new-chat') {
            showWelcome();
            return;
        }
        const data = historyData[this.id];
        if (data) {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            welcomeScreen.style.display = "none";
            messageList.innerHTML = "";
            data.msgs.forEach(msg => appendMessage(msg.role, msg.text));
            codeContent.innerText = data.code;
        }
    });
});

//CODE EXTRACTION FUNCTION
function extractSections(content) {
    try {
        const html = content.split("CSS:")[0].replace("HTML:", "").trim();
        const css = content.split("CSS:")[1].split("JS:")[0].trim();
        const js = content.split("JS:")[1].trim();

        return { html, css, js };
    } catch (e) {
        return { html: content, css: "", js: "" };
    }
}

//SWITCH FUNCTION
function switchTab(tab) {
    currentTab = tab;

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    document.querySelector(`[onclick="switchTab('${tab}')"]`)
        .classList.add("active");

    codeContent.innerText = generatedCode[tab];
}