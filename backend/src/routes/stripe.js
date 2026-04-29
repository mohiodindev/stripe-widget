const express = require('express');
const { authenticate } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

function getStripe() {
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
}

// Create Stripe Connect account link (onboarding)
router.post('/connect', authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    let accountId = user.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user.email,
        metadata: { userId: user.id }
      });
      accountId = account.id;
      db.prepare('UPDATE users SET stripe_account_id = ? WHERE id = ?').run(accountId, user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.PORTAL_URL || 'http://localhost:5173'}/settings/stripe?refresh=true`,
      return_url: `${process.env.PORTAL_URL || 'http://localhost:5173'}/settings/stripe?success=true`,
      type: 'account_onboarding'
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error('Stripe connect error:', err);
    res.status(500).json({ error: 'Failed to create Stripe Connect link' });
  }
});

// Check Stripe account status
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user.stripe_account_id) {
      return res.json({ connected: false, onboarded: false });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    const onboarded = account.charges_enabled && account.payouts_enabled;
    if (onboarded && !user.stripe_onboarded) {
      db.prepare('UPDATE users SET stripe_onboarded = 1 WHERE id = ?').run(user.id);
    }

    res.json({
      connected: true,
      onboarded,
      accountId: user.stripe_account_id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled
    });
  } catch (err) {
    console.error('Stripe status error:', err);
    res.status(500).json({ error: 'Failed to check Stripe status' });
  }
});

// Create checkout session for a donation
router.post('/checkout', async (req, res) => {
  try {
    const { widgetId, amount, currency, donorEmail, donorName } = req.body;

    if (!widgetId || !amount) {
      return res.status(400).json({ error: 'Widget ID and amount are required' });
    }

    const widget = db.prepare('SELECT * FROM widgets WHERE id = ? AND is_active = 1').get(widgetId);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found or inactive' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(widget.user_id);
    if (!user || !user.stripe_account_id || !user.stripe_onboarded) {
      return res.status(400).json({ error: 'Organization has not completed Stripe setup' });
    }

    const amountCents = Math.round(amount * 100);
    if (amountCents < (widget.min_amount * 100) || amountCents > (widget.max_amount * 100)) {
      return res.status(400).json({ error: `Amount must be between ${widget.min_amount} and ${widget.max_amount}` });
    }

    const stripe = getStripe();

    // Build payment method types based on widget config
    const paymentMethods = ['card'];
    if (widget.enable_google_pay || widget.enable_apple_pay) {
      // Stripe Checkout automatically enables Google Pay and Apple Pay
      // when the 'card' payment method is included — no separate types needed.
      // The wallets appear based on browser/device support.
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: currency || widget.currency,
          product_data: {
            name: `Donation to ${user.org_name}`,
            description: widget.description
          },
          unit_amount: amountCents
        },
        quantity: 1
      }],
      customer_email: donorEmail || undefined,
      metadata: {
        widgetId,
        userId: user.id,
        donorName: donorName || '',
        donorEmail: donorEmail || ''
      },
      success_url: `${process.env.API_URL || 'http://localhost:3001'}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.API_URL || 'http://localhost:3001'}/api/stripe/cancel`,
    }, {
      stripeAccount: user.stripe_account_id
    });

    // Record the donation as pending
    const { v4: uuidv4 } = require('uuid');
    const donationId = uuidv4();
    db.prepare(
      `INSERT INTO donations (id, widget_id, user_id, amount, currency, donor_email, donor_name, stripe_session_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(donationId, widgetId, user.id, amountCents, currency || widget.currency, donorEmail || null, donorName || null, session.id);

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create payment intent (for Google Pay / Apple Pay via Payment Request API)
router.post('/payment-intent', async (req, res) => {
  try {
    const { widgetId, amount, currency, donorEmail, donorName } = req.body;

    if (!widgetId || !amount) {
      return res.status(400).json({ error: 'Widget ID and amount are required' });
    }

    const widget = db.prepare('SELECT * FROM widgets WHERE id = ? AND is_active = 1').get(widgetId);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found or inactive' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(widget.user_id);
    if (!user || !user.stripe_account_id || !user.stripe_onboarded) {
      return res.status(400).json({ error: 'Organization has not completed Stripe setup' });
    }

    const amountCents = Math.round(amount * 100);
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency || widget.currency,
      payment_method_types: ['card'],
      metadata: {
        widgetId,
        userId: user.id,
        donorName: donorName || '',
        donorEmail: donorEmail || ''
      }
    }, {
      stripeAccount: user.stripe_account_id
    });

    const { v4: uuidv4 } = require('uuid');
    const donationId = uuidv4();
    db.prepare(
      `INSERT INTO donations (id, widget_id, user_id, amount, currency, donor_email, donor_name, stripe_payment_intent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(donationId, widgetId, user.id, amountCents, currency || widget.currency, donorEmail || null, donorName || null, paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret, stripeAccount: user.stripe_account_id });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Checkout success redirect
router.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Donation Successful</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0fdf4; }
      .card { text-align: center; background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
      .icon { font-size: 4rem; margin-bottom: 1rem; }
      h1 { color: #16a34a; margin-bottom: 0.5rem; }
      p { color: #6b7280; }
    </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">🎉</div>
        <h1>Thank You!</h1>
        <p>Your donation was successful. You may close this window.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'donation-success' }, '*');
            setTimeout(() => window.close(), 3000);
          }
        </script>
      </div>
    </body>
    </html>
  `);
});

// Checkout cancel redirect
router.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Donation Cancelled</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fef2f2; }
      .card { text-align: center; background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
      .icon { font-size: 4rem; margin-bottom: 1rem; }
      h1 { color: #dc2626; margin-bottom: 0.5rem; }
      p { color: #6b7280; }
    </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">😔</div>
        <h1>Donation Cancelled</h1>
        <p>No worries! You can try again anytime.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'donation-cancelled' }, '*');
            setTimeout(() => window.close(), 3000);
          }
        </script>
      </div>
    </body>
    </html>
  `);
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    db.prepare(
      `UPDATE donations SET status = 'completed', stripe_payment_intent = ? WHERE stripe_session_id = ?`
    ).run(session.payment_intent, session.id);
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    db.prepare(
      `UPDATE donations SET status = 'expired' WHERE stripe_session_id = ?`
    ).run(session.id);
  }

  res.json({ received: true });
});

module.exports = router;
