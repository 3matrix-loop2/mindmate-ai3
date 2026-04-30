const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const authMiddleware = require('../middleware/auth');

// POST /api/mood — Save a mood entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { mood, intensity, note } = req.body;
    const userId = req.user.id;
    if (!mood) return res.status(400).json({ error: 'mood required' });

    const entry = await new Mood({ userId, mood, intensity: intensity || 5, note: note || '' }).save();
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

// GET /api/mood — Get mood history for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const moods = await Mood.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(limit);

    const moodCounts = {};
    moods.forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });

    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    res.json({ moods, moodCounts, dominantMood, total: moods.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

module.exports = router;
