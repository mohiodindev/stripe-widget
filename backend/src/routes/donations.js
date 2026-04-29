const express = require('express');
const { authenticate } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// List donations for authenticated user
router.get('/', authenticate, (req, res) => {
  const { widgetId, status, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT d.*, w.name as widget_name FROM donations d JOIN widgets w ON d.widget_id = w.id WHERE d.user_id = ?';
  const params = [req.user.id];

  if (widgetId) {
    query += ' AND d.widget_id = ?';
    params.push(widgetId);
  }

  if (status) {
    query += ' AND d.status = ?';
    params.push(status);
  }

  query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const donations = db.prepare(query).all(...params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM donations WHERE user_id = ?';
  const countParams = [req.user.id];
  if (widgetId) {
    countQuery += ' AND widget_id = ?';
    countParams.push(widgetId);
  }
  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }
  const { total } = db.prepare(countQuery).get(...countParams);

  res.json({ donations, total, limit: Number(limit), offset: Number(offset) });
});

// Get donation stats
router.get('/stats', authenticate, (req, res) => {
  const totalDonations = db.prepare(
    "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations WHERE user_id = ? AND status = 'completed'"
  ).get(req.user.id);

  const todayDonations = db.prepare(
    "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations WHERE user_id = ? AND status = 'completed' AND date(created_at) = date('now')"
  ).get(req.user.id);

  const monthDonations = db.prepare(
    "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations WHERE user_id = ? AND status = 'completed' AND created_at >= date('now', 'start of month')"
  ).get(req.user.id);

  const recentDonations = db.prepare(
    "SELECT d.*, w.name as widget_name FROM donations d JOIN widgets w ON d.widget_id = w.id WHERE d.user_id = ? AND d.status = 'completed' ORDER BY d.created_at DESC LIMIT 10"
  ).all(req.user.id);

  // Daily donations for the last 30 days
  const dailyDonations = db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as count, SUM(amount) as total
     FROM donations WHERE user_id = ? AND status = 'completed' AND created_at >= date('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date`
  ).all(req.user.id);

  res.json({
    total: { count: totalDonations.count, amount: totalDonations.total },
    today: { count: todayDonations.count, amount: todayDonations.total },
    month: { count: monthDonations.count, amount: monthDonations.total },
    recent: recentDonations,
    daily: dailyDonations
  });
});

module.exports = router;
