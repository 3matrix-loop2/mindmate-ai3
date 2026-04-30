const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  detectedMood: { type: String, default: 'neutral' },
  aiSummary: { type: String, default: '' },
  aiFeedback: { type: String, default: '' },
  wordCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journal', JournalSchema);
