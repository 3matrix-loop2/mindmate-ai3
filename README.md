# 🧠 MindMate AI — Intelligent Mental Health Companion

A premium AI-powered emotional support web application. Not a chatbot — a companion.

---

## 📁 Folder Structure

```
mindmate-ai/
├── frontend/
│   ├── index.html          # Single-page app (all pages/sections)
│   ├── css/
│   │   └── style.css       # Full premium UI (light colorful theme)
│   └── js/
│       ├── main.js         # App init, navigation, shared state
│       ├── chat.js         # AI chat UI, typing animation, emotion badge
│       ├── mood.js         # Mood tracker, Chart.js visualization
│       ├── journal.js      # Journal save/analyze/list
│       └── tools.js        # Breathing exercise animation
│
└── backend/
    ├── server.js           # Express server entry point
    ├── .env.example        # Environment variable template
    ├── package.json
    ├── config/
    │   └── db.js           # MongoDB connection
    ├── models/
    │   ├── User.js
    │   ├── Mood.js
    │   ├── Journal.js
    │   └── ChatHistory.js
    ├── routes/
    │   ├── chatRoutes.js   # POST /api/chat, GET /api/chat/:userId
    │   ├── moodRoutes.js   # POST/GET /api/mood
    │   ├── journalRoutes.js# POST/GET /api/journal
    │   └── quoteRoutes.js  # GET /api/quote
    └── utils/
        ├── aiEngine.js         # Gemini/OpenAI calls + fallback
        ├── emotionDetector.js  # Keyword-based emotion detection
        └── emergencyDetector.js# Crisis keyword detection
```

---

## ⚙️ How to Run

### 1. Start MongoDB
```bash
mongod
# or if using Homebrew:
brew services start mongodb-community
```

### 2. Set Up Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env → add your GEMINI_API_KEY or OPENAI_API_KEY
npm run dev
```

### 3. Open Frontend
Open `frontend/index.html` in your browser.
> For full API integration, serve the frontend with a local server:
```bash
cd frontend
npx live-server .
# or
python3 -m http.server 3000
```

---

## 🔑 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindmate
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
AI_PROVIDER=gemini          # or "openai"
NODE_ENV=development
```

> **Note:** The app works WITHOUT an API key using built-in fallback responses. Add a key for live AI.

---

## 🧠 AI Logic Explanation

### System Prompt Engineering
The system prompt in `aiEngine.js` is engineered to:
- Define persona: warm friend, not therapist
- Enforce short (2–5 line) responses
- Map emotions to response types
- Prevent repetitive phrases
- Include context: user name + mood history
- Trigger emergency redirect for crisis keywords

### Non-Repetitive Responses
Three mechanisms prevent repetition:
1. **Last 5 messages** sent as context to the AI (the AI sees what it said before)
2. **Fallback rotation** — `fallbackIndexTracker` cycles through different fallback responses per user+mood
3. **System prompt rule** — explicitly instructs AI to vary sentence structure

### Emotion Detection (Hybrid)
- **Keyword scoring** in `emotionDetector.js`: Each message is checked against 15–20 keywords per emotion
- Higher matches = higher score
- Top-scored emotion wins
- If AI API is available, it also interprets emotion contextually through prompt framing

### Personalization
- User name stored in `localStorage` and MongoDB `User` collection
- Name passed to system prompt so AI uses it naturally (not every message)
- Mood history (last 10 entries) sent as context to AI
- AI adjusts tone based on dominant mood pattern

### Mood Detection Flow
```
User message → Emergency check → Keyword emotion detection →
AI API call (with context) → Save to ChatHistory + auto-log mood →
Return: response + detected mood + suggestion chip
```

### Journal Analysis
```
User writes journal → POST /api/journal →
AI analyzes emotional state (JSON response: summary + feedback + mood) →
Save to MongoDB → Display on frontend
```

---

## 🎨 UI/UX Design Choices

| Element | Choice | Reason |
|---|---|---|
| Font | DM Sans + Fraunces | Human, warm, modern |
| Theme | Light pastel | Calm, positive, inviting |
| Colors | Purple, peach, mint, blue | Emotionally uplifting spectrum |
| Cards | Glassmorphism-lite, soft shadow | Premium SaaS feel |
| Chat bubbles | Soft purple (AI) / blue (user) | Clear, non-jarring distinction |
| Animations | CSS transitions, breathing circle | Engaging but not distracting |

---

## 🚨 Safety & Disclaimers

- Emergency detection triggers on: `suicide`, `self-harm`, `kill myself`, `end my life`, `hopeless`, etc.
- Emergency response **replaces** normal AI response
- Crisis helplines shown immediately
- Full emergency page accessible from sidebar
- Disclaimer shown at onboarding and on emergency page
- App provides **emotional support only** — not therapy, not diagnosis

---

## 📡 API Reference

| Method | Route | Description |
|---|---|---|
| POST | /api/chat | Send message, get AI response |
| GET | /api/chat/:userId | Get chat history |
| POST | /api/mood | Log mood entry |
| GET | /api/mood/:userId | Get mood history + stats |
| POST | /api/journal | Save & analyze journal entry |
| GET | /api/journal/:userId | Get journal list |
| GET | /api/quote | Get daily motivational quote |
| GET | /health | Server health check |

---

## ✅ Tech Stack

- **Frontend:** HTML5, CSS3 (custom, no framework), Vanilla JS, Chart.js (CDN)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **AI:** Gemini API / OpenAI API (with intelligent fallback)
- **Fonts:** Google Fonts (DM Sans, Fraunces)
