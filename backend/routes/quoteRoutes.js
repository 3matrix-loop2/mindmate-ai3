const express = require('express');
const axios = require('axios');
const router = express.Router();

// Curated mental wellness quotes — always available as fallback
const LOCAL_QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.", author: "Lori Deschene" },
  { text: "Not all storms come to disrupt your life; some come to clear your path.", author: "Unknown" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Healing is not linear.", author: "Unknown" },
  { text: "What you're feeling right now will pass, even if it doesn't feel that way.", author: "Unknown" },
  { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann" },
  { text: "It's okay to ask for help. It's okay to not be okay.", author: "Unknown" },
  { text: "Your feelings are valid. All of them.", author: "Unknown" },
  { text: "Rest is not idleness. It is essential.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "One small crack does not mean you are broken, it means that you were put to the test and didn't fall apart.", author: "Linda Poindexter" },
  { text: "The most important relationship you'll ever have is with yourself.", author: "Diane Von Furstenberg" },
  { text: "Sometimes the bravest thing you can do is just keep going.", author: "Unknown" },
  { text: "Mental health is not a destination but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
  { text: "You survived 100% of your worst days. That's pretty remarkable.", author: "Unknown" }
];

let quoteIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);

// GET /api/quote — Get daily motivational quote
router.get('/', async (req, res) => {
  try {
    // Try external API first (ZenQuotes is free and reliable)
    const response = await axios.get('https://zenquotes.io/api/random', { timeout: 4000 });
    const [q] = response.data;
    res.json({ text: q.q, author: q.a, source: 'api' });
  } catch {
    // Rotate through local quotes if API fails
    const quote = LOCAL_QUOTES[quoteIndex % LOCAL_QUOTES.length];
    quoteIndex++;
    res.json({ ...quote, source: 'local' });
  }
});

module.exports = router;
