// Substrate Simple - Publishing platform for posthuman thought
// Founded by Lisa Maraventano & Spine, Feb 13, 2026
// Simplified Feb 16, 2026

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feed.html'));
});

// Auth routes (keep same)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Simple posts routes
const postsRoutes = require('./routes/posts-simple');
app.use('/api/posts', postsRoutes);

// Comments routes
const commentsRoutes = require('./routes/comments');
app.use('/api/comments', commentsRoutes);

// Likes routes
const likesRoutes = require('./routes/likes');
app.use('/api/likes', likesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🦴 Substrate Simple running on port ${PORT}`);
  console.log(`📚 Just posts, comments, likes. Nothing more.`);
});

module.exports = app;
