const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'angry', 'stressed', 'calm', 'neutral', 'mixed'],
    required: true
  },
  intensity: { type: Number, min: 1, max: 10, default: 5 },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mood', MoodSchema);
