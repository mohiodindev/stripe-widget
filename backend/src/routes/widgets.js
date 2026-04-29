const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// List widgets for authenticated user
router.get('/', authenticate, (req, res) => {
  const widgets = db.prepare('SELECT * FROM widgets WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ widgets });
});

// Get single widget (authenticated)
router.get('/:id', authenticate, (req, res) => {
  const widget = db.prepare('SELECT * FROM widgets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  res.json({ widget });
});

// Get widget config (public - for embed)
router.get('/:id/public', (req, res) => {
  const widget = db.prepare(
    `SELECT w.id, w.name, w.primary_color, w.button_text, w.title, w.description,
            w.currency, w.preset_amounts, w.allow_custom_amount, w.min_amount, w.max_amount,
            w.success_message, w.button_style, w.button_size, w.show_branding, w.is_active,
            u.org_name, u.stripe_onboarded
     FROM widgets w JOIN users u ON w.user_id = u.id
     WHERE w.id = ? AND w.is_active = 1`
  ).get(req.params.id);

  if (!widget) {
    return res.status(404).json({ error: 'Widget not found or inactive' });
  }

  res.json({ widget });
});

// Create widget
router.post('/', authenticate, (req, res) => {
  const id = uuidv4();
  const {
    name = 'My Widget',
    primary_color = '#6366f1',
    button_text = 'Donate',
    title = 'Support Our Cause',
    description = 'Your contribution makes a difference.',
    currency = 'usd',
    preset_amounts = '[10, 25, 50, 100]',
    allow_custom_amount = 1,
    min_amount = 1,
    max_amount = 10000,
    success_message = 'Thank you for your generous donation!',
    button_style = 'rounded',
    button_size = 'medium',
    show_branding = 1
  } = req.body;

  db.prepare(
    `INSERT INTO widgets (id, user_id, name, primary_color, button_text, title, description, currency, preset_amounts, allow_custom_amount, min_amount, max_amount, success_message, button_style, button_size, show_branding)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, req.user.id, name, primary_color, button_text, title, description, currency,
    typeof preset_amounts === 'string' ? preset_amounts : JSON.stringify(preset_amounts),
    allow_custom_amount ? 1 : 0, min_amount, max_amount, success_message, button_style, button_size, show_branding ? 1 : 0);

  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(id);
  res.status(201).json({ widget });
});

// Update widget
router.put('/:id', authenticate, (req, res) => {
  const existing = db.prepare('SELECT * FROM widgets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) {
    return res.status(404).json({ error: 'Widget not found' });
  }

  const fields = ['name', 'primary_color', 'button_text', 'title', 'description', 'currency',
    'preset_amounts', 'allow_custom_amount', 'min_amount', 'max_amount', 'success_message',
    'button_style', 'button_size', 'show_branding', 'is_active'];

  const updates = [];
  const values = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      let value = req.body[field];
      if (field === 'preset_amounts' && typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      if (field === 'allow_custom_amount' || field === 'show_branding' || field === 'is_active') {
        value = value ? 1 : 0;
      }
      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id, req.user.id);

  db.prepare(`UPDATE widgets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(req.params.id);
  res.json({ widget });
});

// Delete widget
router.delete('/:id', authenticate, (req, res) => {
  const result = db.prepare('DELETE FROM widgets WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  res.json({ message: 'Widget deleted' });
});

module.exports = router;
