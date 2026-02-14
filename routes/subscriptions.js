// Subscription routes
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Subscribe to publication
router.post('/', async (req, res) => {
  try {
    const { publication_id, email } = req.body;

    if (!publication_id || !email) {
      return res.status(400).json({ error: 'Publication ID and email required' });
    }

    // Check if already subscribed
    const existing = await db.query(
      'SELECT id FROM subscriptions WHERE publication_id = $1 AND email = $2',
      [publication_id, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already subscribed' });
    }

    // Create subscription
    const result = await db.query(
      'INSERT INTO subscriptions (publication_id, email) VALUES ($1, $2) RETURNING *',
      [publication_id, email]
    );

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM subscriptions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subscribers for publication (auth required)
router.get('/publication/:pubId', requireAuth, async (req, res) => {
  try {
    // Verify ownership
    const check = await db.query(
      'SELECT id FROM publications WHERE id = $1 AND user_id = $2',
      [req.params.pubId, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found or unauthorized' });
    }

    const result = await db.query(
      'SELECT * FROM subscriptions WHERE publication_id = $1 ORDER BY created_at DESC',
      [req.params.pubId]
    );

    res.json({ subscriptions: result.rows });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
