# BossMind — Resumora

**[resumora.net](https://resumora.net)** — AI-powered luxury resume builder.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Environment Variables (optional)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side) |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Stripe price ID for Professional plan |
| `NEXT_PUBLIC_STRIPE_EXEC_PRICE_ID` | Stripe price ID for Executive plan |

The app runs in demo mode without Stripe keys configured.
