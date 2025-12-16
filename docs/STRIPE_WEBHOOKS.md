# Stripe Webhook Setup (local dev)

This project supports Stripe webhooks to automatically confirm orders when Stripe reports successful payments and to mark failed payments.

## Options for development

### 1) Using the Stripe CLI (recommended)

1. Install Stripe CLI: https://stripe.com/docs/cli
2. Login and forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

3. Create a test payment (e.g., from a checkout session). The CLI will show a webhook signing secret; add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

### 2) Using ngrok

1. run ngrok to expose local server:

```bash
ngrok http 3000
```

2. Visit Stripe dashboard -> Developers -> Webhooks and add `https://<NGROK_HOST>/api/payments/webhook` as an endpoint.
3. Copy the signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`.

## Notes

- When `STRIPE_WEBHOOK_SECRET` is present, the server will verify incoming webhook signatures. This is strongly recommended for production/dev safety.
- The backend will mark orders `PAID` on `checkout.session.completed` and `FAILED` on `payment_intent.payment_failed` or `checkout.session.async_payment_failed`.
- If you don't set `STRIPE_WEBHOOK_SECRET` while developing, the webhook handler will accept JSON without signature verification (not recommended for production).

