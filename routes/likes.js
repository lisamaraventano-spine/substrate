// Likes API
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Toggle like (requires auth)
router.post('/:post_id', authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  
  try {
    // Check if already liked
    const existingLike = await db.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [post_id, req.userId]
    );
    
    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
        [post_id, req.userId]
      );
      res.json({ liked: false });
    } else {
      // Like
      await db.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
        [post_id, req.userId]
      );
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if user liked a post
router.get('/:post_id/status', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [req.params.post_id, req.userId]
    );
    
    res.json({ liked: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
