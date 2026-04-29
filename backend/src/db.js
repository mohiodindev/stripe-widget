const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');

// Ensure data directory exists
const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    org_name TEXT NOT NULL,
    stripe_account_id TEXT,
    stripe_onboarded INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS widgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Widget',
    primary_color TEXT DEFAULT '#6366f1',
    secondary_color TEXT DEFAULT '#8b5cf6',
    button_text TEXT DEFAULT 'Donate',
    title TEXT DEFAULT 'Support Our Cause',
    description TEXT DEFAULT 'Your contribution makes a difference.',
    currency TEXT DEFAULT 'usd',
    preset_amounts TEXT DEFAULT '[10, 25, 50, 100]',
    allow_custom_amount INTEGER DEFAULT 1,
    min_amount INTEGER DEFAULT 1,
    max_amount INTEGER DEFAULT 10000,
    success_message TEXT DEFAULT 'Thank you for your generous donation!',
    button_style TEXT DEFAULT 'rounded',
    button_size TEXT DEFAULT 'medium',
    show_branding INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    header_style TEXT DEFAULT 'gradient',
    font_family TEXT DEFAULT 'system',
    header_image_url TEXT DEFAULT '',
    enable_google_pay INTEGER DEFAULT 1,
    enable_apple_pay INTEGER DEFAULT 1,
    enable_recurring INTEGER DEFAULT 0,
    show_donor_wall INTEGER DEFAULT 0,
    thank_you_style TEXT DEFAULT 'confetti',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    widget_id TEXT NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    donor_email TEXT,
    donor_name TEXT,
    stripe_session_id TEXT,
    stripe_payment_intent TEXT,
    status TEXT DEFAULT 'pending',
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON widgets(user_id);
  CREATE INDEX IF NOT EXISTS idx_donations_widget_id ON donations(widget_id);
  CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
  CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
`);

module.exports = db;
