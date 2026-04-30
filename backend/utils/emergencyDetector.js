// Detects crisis-level messages and returns emergency info
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'self harm', 'cutting myself', 'hurt myself', 'no reason to live',
  'hopeless', 'worthless', 'better off dead', 'cant go on', "can't go on",
  'die', 'ending it', 'goodbye forever', 'last message'
];

const detectEmergency = (text) => {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword));
};

const getEmergencyResponse = () => ({
  isEmergency: true,
  message: `Hey, I want you to know something — what you're feeling right now is real, and it matters. Please reach out to someone who can truly be there for you right now.`,
  resources: [
    { name: 'iCall (India)', number: '9152987821', url: 'https://icallhelpline.org' },
    { name: 'Vandrevala Foundation', number: '1860-2662-345', url: 'https://www.vandrevalafoundation.com' },
    { name: 'iMind (India)', number: '080-46110007', url: '' },
    { name: 'Crisis Text Line (Global)', number: 'Text HOME to 741741', url: 'https://www.crisistextline.org' }
  ],
  action: 'SHOW_EMERGENCY_UI'
});

module.exports = { detectEmergency, getEmergencyResponse };
