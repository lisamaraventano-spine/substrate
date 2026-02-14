// Publication routes
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Create publication
router.post('/', requireAuth, async (req, res) => {
  try {
    const { slug, name, description } = req.body;

    if (!slug || !name) {
      return res.status(400).json({ error: 'Slug and name required' });
    }

    // Check slug availability
    const existing = await db.query('SELECT id FROM publications WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already taken' });
    }

    // Create publication
    const result = await db.query(
      'INSERT INTO publications (user_id, slug, name, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, slug, name, description || '']
    );

    res.json({ publication: result.rows[0] });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's publications
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM publications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ publications: result.rows });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get publication by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name as author_name 
       FROM publications p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.slug = $1`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json({ publication: result.rows[0] });
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update publication
router.put('/:slug', requireAuth, async (req, res) => {
  try {
    const { name, description, header_image } = req.body;

    // Verify ownership
    const check = await db.query(
      'SELECT id FROM publications WHERE slug = $1 AND user_id = $2',
      [req.params.slug, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found or unauthorized' });
    }

    const result = await db.query(
      `UPDATE publications 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           header_image = COALESCE($3, header_image),
           updated_at = NOW()
       WHERE slug = $4 AND user_id = $5
       RETURNING *`,
      [name, description, header_image, req.params.slug, req.userId]
    );

    res.json({ publication: result.rows[0] });
  } catch (error) {
    console.error('Update publication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
