# DonateWidget - Stripe Donation Widget Platform

A mobile-responsive, embeddable Stripe donation widget with a customization portal. Organizations can sign up, connect their Stripe account, customize their widget, and embed it on any website or mobile app.

## Features

- **Embeddable Widget** — Lightweight JavaScript snippet that works on any website
- **Donation Popup** — Beautiful, mobile-responsive popup with preset and custom amounts
- **Stripe Integration** — Stripe Connect for direct payments to organizations
- **Customization Portal** — Full dashboard to customize widget appearance and settings
- **Donation Analytics** — Track donations, view stats, and manage records
- **Mobile Responsive** — Works perfectly on all screen sizes

## Architecture

```
stripe-donation-widget/
├── backend/          # Node.js/Express API server
│   └── src/
│       ├── server.js       # Express app entry
│       ├── db.js           # SQLite database
│       ├── middleware/      # Auth middleware
│       └── routes/         # API routes (auth, stripe, widgets, donations)
├── portal/           # React (Vite) admin dashboard
│   └── src/
│       ├── pages/          # Dashboard, Widgets, Donations, Settings, Embed
│       ├── components/     # Layout, shared components
│       ├── contexts/       # Auth context
│       └── lib/            # API client
└── widget/           # Embeddable donation widget
    └── src/
        ├── donate-widget.js  # Widget script
        └── demo.html         # Demo page
```

## Quick Start

### Prerequisites
- Node.js 18+
- A Stripe account (for payment processing)

### 1. Clone and Install

```bash
git clone <repo-url>
cd stripe-donation-widget

# Install all dependencies
cd backend && npm install && cd ..
cd portal && npm install && cd ..
cd widget && npm install && cd ..
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your Stripe keys
```

### 3. Run Development Servers

```bash
# Terminal 1: Backend API (port 3001)
cd backend && npm run dev

# Terminal 2: Portal (port 5173)
cd portal && npm run dev

# Terminal 3: Widget server (port 3002)
cd widget && npm run dev
```

### 4. Getting Started

1. Open the portal at `http://localhost:5173`
2. Register a new account
3. Connect your Stripe account in Settings > Stripe
4. Customize your widget in the Widgets section
5. Copy the embed code from the Embed Code page
6. Paste into your website

## Widget Integration

### Method 1: Full Widget (Button + Popup)

```html
<div id="donate-widget"></div>
<script src="YOUR_WIDGET_URL/donate-widget.js"></script>
<script>
  DonateWidget.init({
    widgetId: 'YOUR_WIDGET_ID',
    apiUrl: 'YOUR_API_URL',
    container: '#donate-widget'
  });
</script>
```

### Method 2: Popup Only

```html
<script src="YOUR_WIDGET_URL/donate-widget.js"></script>
<button onclick="DonateWidget.open({ widgetId: 'YOUR_WIDGET_ID', apiUrl: 'YOUR_API_URL' })">
  Donate Now
</button>
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Widgets
- `GET /api/widgets` — List widgets
- `POST /api/widgets` — Create widget
- `PUT /api/widgets/:id` — Update widget
- `DELETE /api/widgets/:id` — Delete widget
- `GET /api/widgets/:id/public` — Get public widget config

### Donations
- `GET /api/donations` — List donations
- `GET /api/donations/stats` — Donation statistics

### Stripe
- `POST /api/stripe/connect` — Start Stripe Connect onboarding
- `GET /api/stripe/status` — Check Stripe connection status
- `POST /api/stripe/checkout` — Create checkout session
- `POST /api/stripe/webhook` — Stripe webhook handler

## Widget Customization Options

| Option | Description | Default |
|--------|-------------|---------|
| `primary_color` | Widget theme color | `#6366f1` |
| `button_text` | Donate button text | `Donate` |
| `title` | Popup header title | `Support Our Cause` |
| `description` | Popup description | `Your contribution makes a difference.` |
| `currency` | Payment currency | `usd` |
| `preset_amounts` | Quick-select amounts | `[10, 25, 50, 100]` |
| `allow_custom_amount` | Allow free-form amounts | `true` |
| `min_amount` / `max_amount` | Amount limits | `1` / `10000` |
| `button_style` | `rounded`, `pill`, or `square` | `rounded` |
| `button_size` | `small`, `medium`, or `large` | `medium` |
| `show_branding` | Show "Powered by" text | `true` |

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3), Stripe SDK
- **Frontend**: React 19, Vite, React Router, Axios, Lucide Icons
- **Widget**: Vanilla JavaScript (no dependencies, ~8KB)
- **Authentication**: JWT tokens
- **Payments**: Stripe Connect + Checkout Sessions

## License

MIT
