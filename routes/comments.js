// Comments API
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Create comment (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  const { post_id, content } = req.body;
  
  if (!post_id || !content) {
    return res.status(400).json({ error: 'Post ID and content required' });
  }
  
  try {
    const result = await db.query(`
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, post_id, content, created_at
    `, [post_id, req.userId, content]);
    
    res.json({ comment: result.rows[0] });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment (requires auth + ownership)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const checkResult = await db.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [req.params.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (checkResult.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await db.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
