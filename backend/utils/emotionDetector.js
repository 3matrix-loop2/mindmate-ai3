// Hybrid emotion detection: keyword-based + pattern scoring

const emotionKeywords = {
  happy: [
    'happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic',
    'love', 'blessed', 'grateful', 'thankful', 'cheerful', 'delighted',
    'awesome', 'good mood', 'elated', 'content', 'proud', 'thrilled'
  ],
  sad: [
    'sad', 'unhappy', 'depressed', 'crying', 'tears', 'miserable', 'heartbroken',
    'lonely', 'alone', 'grief', 'lost', 'empty', 'broken', 'disappointed',
    'devastated', 'gloomy', 'hopeless', 'hurt', 'pain', 'miss', 'missing'
  ],
  anxious: [
    'anxious', 'anxiety', 'worried', 'nervous', 'panic', 'scared', 'fear',
    'overthinking', 'what if', 'can\'t stop thinking', 'restless', 'uneasy',
    'dread', 'afraid', 'phobia', 'heart racing', 'shaking', 'overwhelmed'
  ],
  angry: [
    'angry', 'anger', 'furious', 'rage', 'hate', 'irritated', 'frustrated',
    'mad', 'annoyed', 'livid', 'pissed', 'outraged', 'resentful', 'bitter',
    'infuriated', 'enraged'
  ],
  stressed: [
    'stressed', 'stress', 'pressure', 'overwhelmed', 'too much', 'deadline',
    'exhausted', 'burnout', 'tired', 'overworked', 'can\'t cope', 'hectic',
    'swamped', 'no time', 'loaded', 'so much to do', 'falling behind'
  ],
  calm: [
    'calm', 'peaceful', 'relaxed', 'zen', 'serene', 'at ease', 'comfortable',
    'tranquil', 'okay', 'fine', 'alright', 'balanced', 'settled', 'centered'
  ]
};
const detectEmotion = (text) => {
  const lower = text.toLowerCase();
  const scores = {};

  // Exam / result related stress boost
  if (
    lower.includes("exam") ||
    lower.includes("test") ||
    lower.includes("result") ||
    lower.includes("marks")
  ) {
    scores.stressed = (scores.stressed || 0) + 2;
  }

  // Negative performance feeling boost
  if (
    lower.includes("bad") ||
    lower.includes("fail") ||
    lower.includes("not good") ||
    lower.includes("not well") ||
    lower.includes("worst") ||
    lower.includes("kharab")
  ) {
    scores.sad = (scores.sad || 0) + 1;
  }

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    scores[emotion] = (scores[emotion] || 0) + keywords.reduce((score, keyword) => {
      return score + (lower.includes(keyword) ? 1 : 0);
    }, 0);
  }

  const activeEmotions = Object.entries(scores)
    .filter(([emotion, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (activeEmotions.length === 0) {
    return "neutral";
  }

  if (activeEmotions.length > 1) {
    return "mixed";
  }

  return activeEmotions[0][0];
};
const getMoodSuggestion = (mood) => {
  const suggestions = {
    sad: {
      chip: '🌸 Comfort breathing',
      tip: 'Try placing your hand on your heart, taking a deep breath, and saying "I am allowed to feel this."'
    },
    anxious: {
      chip: '🌬️ 4-7-8 Breathing',
      tip: 'Breathe in for 4 seconds, hold for 7, exhale for 8. It signals safety to your nervous system.'
    },
    stressed: {
      chip: '📋 Brain Dump',
      tip: 'Write down everything on your mind. Getting it out of your head reduces mental load instantly.'
    },
    angry: {
      chip: '🧊 Cool-down walk',
      tip: 'Step outside for even 5 minutes. Physical movement helps discharge anger from your body.'
    },
    happy: {
      chip: '📓 Gratitude note',
      tip: 'Write down 3 specific things that made today good. Anchoring joy helps it last longer.'
    },
    calm: {
      chip: '🧘 Mindful moment',
      tip: 'You\'re in a great mental space. This is a perfect time for journaling or creative thinking.'
    },
    mixed: {
      chip: '🌈 Mixed feelings',
      tip: 'You seem to be feeling multiple things at once. Try writing them separately: what feels heavy, what feels okay, and what needs attention first.'
   },
    neutral: {
      chip: '💭 Check-in',
      tip: 'Take a moment to scan how your body feels. Sometimes emotions live in our body before our mind notices them.'
    }
   };
  const baseMood = mood?.startsWith("mixed:") ? mood.split(":")[1] : mood;
  return suggestions[baseMood] || suggestions.neutral;
};

module.exports = { detectEmotion, getMoodSuggestion };
