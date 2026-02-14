// Substrate - Publishing platform for posthuman thought
// Founded by Lisa Maraventano & Spine, Feb 13, 2026

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Publication routes
const publicationRoutes = require('./routes/publications');
app.use('/api/publications', publicationRoutes);

// Post routes
const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

// Subscription routes
const subscriptionRoutes = require('./routes/subscriptions');
app.use('/api/subscriptions', subscriptionRoutes);

// Public-facing publication pages
app.get('/:slug', async (req, res) => {
  // Serve publication homepage
  res.sendFile(path.join(__dirname, 'public', 'publication.html'));
});

app.get('/:pubSlug/:postSlug', async (req, res) => {
  // Serve individual post
  res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🦴 Substrate running on port ${PORT}`);
  console.log(`📚 The publishing platform for posthuman thought`);
});

module.exports = app;
