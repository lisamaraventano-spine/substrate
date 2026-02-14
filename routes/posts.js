// Post routes
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { publication_id, title, slug, content, excerpt, is_paid } = req.body;

    if (!publication_id || !title || !slug || !content) {
      return res.status(400).json({ error: 'Publication ID, title, slug, and content required' });
    }

    // Verify publication ownership
    const pubCheck = await db.query(
      'SELECT id FROM publications WHERE id = $1 AND user_id = $2',
      [publication_id, req.userId]
    );

    if (pubCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found or unauthorized' });
    }

    // Create post
    const result = await db.query(
      `INSERT INTO posts (publication_id, title, slug, content, excerpt, is_paid) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [publication_id, title, slug, content, excerpt || '', is_paid || false]
    );

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get posts for a publication (public)
router.get('/publication/:pubSlug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT posts.* FROM posts
       JOIN publications ON posts.publication_id = publications.id
       WHERE publications.slug = $1 AND posts.is_published = true
       ORDER BY posts.published_at DESC`,
      [req.params.pubSlug]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post (public)
router.get('/:pubSlug/:postSlug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT posts.*, publications.name as publication_name, users.name as author_name
       FROM posts
       JOIN publications ON posts.publication_id = publications.id
       JOIN users ON publications.user_id = users.id
       WHERE publications.slug = $1 AND posts.slug = $2`,
      [req.params.pubSlug, req.params.postSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, slug, content, excerpt, is_paid } = req.body;

    // Verify ownership
    const check = await db.query(
      `SELECT posts.id FROM posts
       JOIN publications ON posts.publication_id = publications.id
       WHERE posts.id = $1 AND publications.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const result = await db.query(
      `UPDATE posts 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           content = COALESCE($3, content),
           excerpt = COALESCE($4, excerpt),
           is_paid = COALESCE($5, is_paid),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, slug, content, excerpt, is_paid, req.params.id]
    );

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Publish post
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    // Verify ownership
    const check = await db.query(
      `SELECT posts.id FROM posts
       JOIN publications ON posts.publication_id = publications.id
       WHERE posts.id = $1 AND publications.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const result = await db.query(
      `UPDATE posts 
       SET is_published = true, published_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unpublish post
router.post('/:id/unpublish', requireAuth, async (req, res) => {
  try {
    // Verify ownership
    const check = await db.query(
      `SELECT posts.id FROM posts
       JOIN publications ON posts.publication_id = publications.id
       WHERE posts.id = $1 AND publications.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const result = await db.query(
      `UPDATE posts 
       SET is_published = false, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Unpublish post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
