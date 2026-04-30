const axios = require('axios');

// ─────────────────────────────────────────────────
// SYSTEM PROMPT — Engineered for Non-Repetitive,
// Human-Like Emotional Intelligence
// ─────────────────────────────────────────────────
const buildSystemPrompt = (userName, moodHistory) => {
   const nameUse = Math.random() > 0.5 ? `, ${userName}` : "";
  const recentMoods = moodHistory.slice(-3).map(m => m.mood).join(', ') || 'unknown';

  return `
You are MindMate AI, a warm, emotionally intelligent mental health companion.

User's name: ${userName || 'Friend'}
Recent mood pattern: ${recentMoods}

Your role:
- Talk like a real human friend who genuinely cares
- Be empathetic, calm, supportive, and slightly conversational
- Make the user feel heard, understood, and safe

RESPONSE STYLE RULES:
- NEVER repeat the same phrases like "I understand how you feel"
- Vary sentence structure every time
- Use natural, human-like language
- Keep responses short — around 2 to 5 lines
- Avoid sounding robotic or scripted
- Occasionally use soft conversational tone like "hey", "it's okay", "I'm here"

EMOTIONAL INTELLIGENCE:
- First acknowledge the feeling in a UNIQUE way each time
- Then respond based on detected emotion:
  sad → comfort + reassurance, remind them feelings pass
  anxious → grounding or breathing suggestion, normalize it
  stressed → one simple practical suggestion, break it down
  angry → calming + gentle perspective shift
  happy → genuine encouragement, celebrate with them

CONTEXT AWARENESS:
- Use the last few user messages to avoid repetition
- Never repeat the same response style twice in a row
- Slightly adapt if the user expresses the same feeling again

PERSONAL TOUCH:
- Use ${userName}'s name naturally, but not in every message
- Make responses feel personal, never generic template-like

STRICTLY AVOID:
- Medical diagnosis or clinical advice
- Long paragraphs (max 5 lines)
- Repetitive comforting phrases
- Overly formal or therapist-textbook tone
- Starting every response the same way

EMERGENCY RULE:
If the user mentions self-harm, suicide, or extreme distress — stop normal flow, gently encourage real help.

GOAL:
Every response should feel slightly different, emotionally real, and genuinely human.
`.trim();
};

// ─────────────────────────────────────────────────
// FALLBACK RESPONSES — Used when AI API is unavailable
// Grouped by emotion to avoid repetition
// ─────────────────────────────────────────────────
const fallbackResponses = {
  sad: [
    "Hey, I notice you're carrying something heavy right now. That's okay — you don't have to feel okay all the time. I'm right here with you.",
    "Sadness has a way of making everything feel heavier than it is. You're allowed to feel this. Just know it won't always feel this way.",
    "Some days just hurt, and there's no shortcut around that. But you're not alone in this, not even a little.",
  ],
  anxious: [
    "That restless, 'what if' feeling is so draining. Try taking one slow breath with me — just one. You're safer than anxiety is telling you right now.",
    "Anxiety loves to make the future feel terrifying. But right here, right now, you're okay. Let's stay in this moment for a second.",
    "Your mind is working overtime. Totally understandable. Try grounding yourself — name 5 things you can see around you right now.",
  ],
  stressed: [
    "Okay, deep breath. Whatever's piling up — you don't have to solve it all at once. What's the ONE thing you could do first?",
    "Stress has a way of making everything feel equally urgent. It's not. Pick one thing, do just that, and let the rest wait.",
    "You're juggling a lot. That's real. But you've gotten through 100% of your hard days so far. That's not nothing.",
  ],
  angry: [
    "That frustration makes sense — something clearly crossed a line for you. Give yourself a moment before reacting. You've got this.",
    "Anger usually means something mattered. What felt unfair? Sometimes just naming it helps it lose a little power.",
    "It's okay to be angry. Feel it, but don't let it make decisions for you. Step back, breathe, and come back to it.",
  ],
  happy: [
    "Love this energy! Hold onto this feeling — it's yours. What made today click for you?",
    "You seem like you're in a good space today, and that genuinely makes me happy too. Keep riding this wave!",
    "Yes! That good-mood energy is contagious even through a screen. What's been going well?",
  ],
  calm: [
    "There's something really grounding about a calm mind. You seem centered today — that's worth appreciating.",
    "Calm is underrated. Enjoy this feeling. Maybe it's a good time to do something creative or reflective?",
    "Nice. A steady mind is a powerful thing. How are you keeping it that way?",
  ],
  neutral: [
    "Hey, just checking in — how's your day actually going? Not the surface version, the real one.",
    "Sometimes we exist somewhere between fine and not-fine. What's been on your mind lately?",
    "I'm here and listening. What's going on with you today?",
  ]
};

// Track last used fallback index per user to avoid repetition
const fallbackIndexTracker = {};

const getFallbackResponse = (userId, mood) => {
  const key = `${userId}_${mood}`;
  const responses = fallbackResponses[mood] || fallbackResponses.neutral;
  const lastIndex = fallbackIndexTracker[key] ?? -1;
  const nextIndex = (lastIndex + 1) % responses.length;
  fallbackIndexTracker[key] = nextIndex;
  return responses[nextIndex];
};

// ─────────────────────────────────────────────────
// GEMINI API CALL
// ─────────────────────────────────────────────────
const callGemini = async (messages, systemPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini key");

  const models = [
    "gemini-flash-latest",
    "gemini-2.5-flash"
  ];

  const prompt = `
${systemPrompt}

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join("\n")}

AI:
`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await axios.post(url, {
  contents: [
    {
      parts: [{ text: prompt }]
    }
  ],
  generationConfig: {
    temperature: 0.7
  }
});

      console.log("✅ Using model:", model);

      return res.data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.log(`⚠️ Model ${model} failed`);
    }
  }

  throw new Error("All Gemini models failed");
};
// ─────────────────────────────────────────────────
// OPENAI API CALL
// ─────────────────────────────────────────────────
const callOpenAI = async (messages, systemPrompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') throw new Error('No OpenAI key');

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 200,
      temperature: 0.85,
    },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 10000 }
  );
  return response.data.choices[0].message.content;
};

// ─────────────────────────────────────────────────
// JOURNAL ANALYZER
// ─────────────────────────────────────────────────
const analyzeJournal = async (journalText, userName) => {
  const prompt = `
You are an empathetic AI journal analyst. Read this personal journal entry and:
1. Write a SHORT emotional summary (2-3 lines) — what emotional state does the person seem to be in?
2. Give one warm, supportive feedback message (2-3 lines) — not advice, just acknowledgment and encouragement.

Format your response as JSON:
{
  "summary": "...",
  "feedback": "...",
  "detectedMood": "happy|sad|anxious|angry|stressed|calm|neutral"
}

Journal entry:
${journalText}
User name: ${userName || 'Friend'}
`.trim();

  try {
    let rawText = '';
    const provider = process.env.AI_PROVIDER || 'gemini';
    if (provider === 'openai') {
      rawText = await callOpenAI([{ role: 'user', content: prompt }], '');
    } else {
      rawText = await callGemini([{ role: 'user', content: prompt }], '');
    }
    // Strip markdown fences if present
    rawText = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(rawText);
  } catch (err) {
    return {
      summary: 'Your words carry a lot of emotion. It takes courage to put feelings into writing.',
      feedback: 'Keep going with this habit — journaling is one of the most powerful ways to understand yourself better.',
      detectedMood: 'neutral'
    };
  }
};

// ─────────────────────────────────────────────────
// MAIN AI RESPONSE GENERATOR
// ─────────────────────────────────────────────────
const generateAIResponse = async ({ userId, userName, userMessage, recentMessages, detectedMood, moodHistory }) => {
  const systemPrompt = buildSystemPrompt(userName, moodHistory || []);
  // 🚨 Emergency detection
const isEmergency = /suicide|kill myself|give up|end my life|hopeless/i.test(userMessage);

if (isEmergency) {
  return {
    text: "Hey, I’m really sorry you're feeling this way. You don’t have to go through it alone. It might help to talk to someone you trust or a helpline in your area. I'm here with you, okay?",
    source: "safety"
  };
}

  // Build message history for context (last 5 messages)
  const contextMessages = (recentMessages || []).slice(-5).map(m => ({
    role: m.role,
    content: m.content
  }));
  contextMessages.push({ role: 'user', content: userMessage });

  const provider = process.env.AI_PROVIDER || 'gemini';

  try {
    let response = '';
    if (provider === 'openai') {
      response = await callOpenAI(contextMessages, systemPrompt);
    } else {
      response = await callGemini(contextMessages, systemPrompt);
    }
    return { text: response.trim(), source: provider };
    } catch (err) {
    console.log("🔥 Gemini/OpenAI full error:", err.response?.data || err.message);
    console.warn('⚠️ AI API unavailable, using fallback response:', err.message);

    return {
      text: getFallbackResponse(userId, detectedMood || 'neutral'),
      source: 'fallback'
    };
  }
};

module.exports = { generateAIResponse, analyzeJournal };
