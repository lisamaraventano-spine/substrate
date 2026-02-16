// Simple posts API - no publications wrapper
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.created_at,
        users.name as author_name,
        users.id as author_id,
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comment_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT 100
    `);
    
    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post with comments
router.get('/:id', async (req, res) => {
  try {
    const postResult = await db.query(`
      SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.created_at,
        users.name as author_name,
        users.id as author_id,
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as like_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1
    `, [req.params.id]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const commentsResult = await db.query(`
      SELECT 
        comments.id,
        comments.content,
        comments.created_at,
        users.name as author_name
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC
    `, [req.params.id]);
    
    res.json({
      post: postResult.rows[0],
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }
  
  try {
    const result = await db.query(`
      INSERT INTO posts (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id, title, content, created_at
    `, [req.userId, title, content]);
    
    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post (requires auth + ownership)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const checkResult = await db.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [req.params.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (checkResult.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await db.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
