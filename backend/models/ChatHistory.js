const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      detectedMood: { type: String, default: 'neutral' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
