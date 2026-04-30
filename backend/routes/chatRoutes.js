const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const Mood = require('../models/Mood');
const User = require('../models/User');
const { generateAIResponse } = require('../utils/aiEngine');
const { detectEmotion, getMoodSuggestion } = require('../utils/emotionDetector');
const { detectEmergency, getEmergencyResponse } = require('../utils/emergencyDetector');
const authMiddleware = require('../middleware/auth');

// POST /api/chat — Main chat endpoint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Emergency check — always first
    if (detectEmergency(message)) {
      return res.json(getEmergencyResponse());
    }

    // Detect emotion from user's message
    const detectedMood = detectEmotion(message);
    const suggestion = getMoodSuggestion(detectedMood);

    // Update user lastActive
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ userId });
    if (!chatHistory) {
      chatHistory = new ChatHistory({ userId, messages: [] });
    }

    // Get recent mood history for context
    const moodHistory = await Mood.find({ userId }).sort({ timestamp: -1 }).limit(10);

    // Generate AI response
    const aiResult = await generateAIResponse({
      userId,
      userName: userName || 'Friend',
      userMessage: message,
      recentMessages: chatHistory.messages.slice(-5),
      detectedMood,
      moodHistory
    });

    // Save messages to history
    chatHistory.messages.push({ role: 'user', content: message, detectedMood });
    chatHistory.messages.push({ role: 'assistant', content: aiResult.text, detectedMood });
    chatHistory.lastUpdated = new Date();

    // Keep history manageable — last 50 messages
    if (chatHistory.messages.length > 50) {
      chatHistory.messages = chatHistory.messages.slice(-50);
    }
    await chatHistory.save();

    // Auto-save detected mood
    await new Mood({ userId, mood: detectedMood === 'neutral' ? 'calm' : detectedMood }).save();

    res.json({
      isEmergency: false,
      response: aiResult.text,
      detectedMood,
      suggestion,
      source: aiResult.source
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/chat/history — Get chat history for logged-in user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    res.json(chatHistory ? chatHistory.messages.slice(-20) : []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;
