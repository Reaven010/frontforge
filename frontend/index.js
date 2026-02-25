// --- 1. MOCK DATABASE (History Data) ---
const historyData = {
    "chat-v3": {
        code: "// Version 3: Full History\nconst historyData = { ... };",
        msgs: [
            { role: "user", text: "Show me the history." },
            { role: "bot", text: "Here is the history view (v3)." }
        ]
    },
    "chat-v2": {
        code: "/* Version 2: Theme Toggle */\nbody.light-theme { ... }",
        msgs: [
            { role: "user", text: "I need a light mode." },
            { role: "bot", text: "I've added the theme toggle button." }
        ]
    },
    "chat-v1": {
        code: "\n<div class='container'>...</div>",
        msgs: [
            { role: "user", text: "Build the layout." },
            { role: "bot", text: "Here is the basic Flexbox layout." }
        ]
    },
    "chat-react": {
        code: "const App = () => <div>Hello React</div>;",
        msgs: [
            { role: "user", text: "React component help?" },
            { role: "bot", text: "Here is a functional component." }
        ]
    }
};

// --- 2. SELECT DOM ELEMENTS ---
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

// --- 3. CORE FUNCTIONS ---

// Function to Show Welcome Screen (New Chat)
function showWelcome() {
    welcomeScreen.style.display = "block";
    messageList.innerHTML = ""; 
    codeContent.innerText = "// Code artifacts will appear here...";
    
    // Reset Sidebar Selection
    menuItems.forEach(i => i.classList.remove('active'));
    document.getElementById('btn-new-chat').classList.add('active');
}

// Function to Add a Message Bubble
function appendMessage(role, text) {
    // Hide welcome screen if it's visible
    welcomeScreen.style.display = "none";

    const row = document.createElement('div');
    row.classList.add('message-row', role);
    
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerText = text;

    row.appendChild(bubble);
    messageList.appendChild(row);

    // Auto-scroll to bottom
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

// --- 4. INPUT HANDLING (Fixed for Keyboard) ---

function handleSend() {
    const text = inputField.value.trim();
    if (text === "") return;

    // 1. Add User Message
    appendMessage('user', text);
    
    // 2. Clear Input & Refocus (Critical for typing flow)
    inputField.value = "";
    inputField.focus(); 

    // 3. Fake Bot Response (Delay 600ms)
    setTimeout(() => {
        appendMessage('bot', "I received: " + text);
        codeContent.innerText = "// Generated code for: " + text + "\nconsole.log('Success');";
    }, 600);
}

// Click Listener
sendBtn.addEventListener('click', handleSend);

// Keydown Listener (Better than keypress for Enter key)
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleSend();
    }
});

// --- 5. THEME TOGGLE LOGIC ---
let isLightMode = false;

themeBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    document.body.classList.toggle('light-theme');
    
    if (isLightMode) {
        themeIcon.innerText = "☾"; // Moon
        themeText.innerText = "Dark Mode";
    } else {
        themeIcon.innerText = "☀"; // Sun
        themeText.innerText = "Light Mode";
    }
});

// --- 6. SIDEBAR NAVIGATION LOGIC ---
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        // If "New Chat" is clicked
        if (this.id === 'btn-new-chat') {
            showWelcome();
            return;
        }

        // If a History Item is clicked
        const data = historyData[this.id];
        if (data) {
            // Update Active State
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Clear Screen & Load Data
            welcomeScreen.style.display = "none";
            messageList.innerHTML = ""; 
            
            // Load messages from history
            data.msgs.forEach(msg => appendMessage(msg.role, msg.text));
            // Load code from history
            codeContent.innerText = data.code;
        }
    });
});