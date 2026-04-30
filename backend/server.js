require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting — protect AI endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests. Please slow down.' }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', aiLimiter, require('./routes/chatRoutes'));
app.use('/api/mood', require('./routes/moodRoutes'));
app.use('/api/journal', aiLimiter, require('./routes/journalRoutes'));
app.use('/api/quote', require('./routes/quoteRoutes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MindMate AI Server running on port ${PORT}`);
  console.log(`🧠 AI Provider: ${process.env.AI_PROVIDER || 'gemini (fallback mode)'}`);
});
