const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const Mood = require('../models/Mood');
const { analyzeJournal } = require('../utils/aiEngine');
const { detectEmotion } = require('../utils/emotionDetector');
const authMiddleware = require('../middleware/auth');

// POST /api/journal — Save and analyze journal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    if (!content) return res.status(400).json({ error: 'content required' });

    const wordCount = content.trim().split(/\s+/).length;
    const keywordMood = detectEmotion(content);

    // AI analysis
    const aiAnalysis = await analyzeJournal(content, userName || 'Friend');
    const finalMood = aiAnalysis.detectedMood !== 'neutral' ? aiAnalysis.detectedMood : keywordMood;

    const entry = await new Journal({
      userId,
      content,
      detectedMood: finalMood,
      aiSummary: aiAnalysis.summary,
      aiFeedback: aiAnalysis.feedback,
      wordCount
    }).save();

    // Log mood from journal
    await new Mood({ userId, mood: finalMood === 'neutral' ? 'calm' : finalMood, note: 'from journal' }).save();

    res.json({ success: true, entry, analysis: aiAnalysis });
  } catch (err) {
    console.error('Journal error:', err);
    res.status(500).json({ error: 'Failed to save journal' });
  }
});

// GET /api/journal — Get journal entries for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const journals = await Journal.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-content');
    res.json(journals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journals' });
  }
});

// GET /api/journal/:id — Get single journal entry
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!journal) return res.status(404).json({ error: 'Not found' });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal' });
  }
});

module.exports = router;
