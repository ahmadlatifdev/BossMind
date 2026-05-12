# AGENTS.md

## Cursor Cloud specific instructions

This is the **Resumora** project (branded as **resumora.net**) — an AI-powered luxury resume builder by BossMind. It is a Next.js 14 application using the Pages Router.

### Tech stack

- **Framework:** Next.js 14 (Pages Router)
- **Language:** JavaScript (JSX)
- **Styling:** CSS Modules + global CSS custom properties (luxury dark theme with gold accents)
- **Payments:** Stripe Checkout (client-side via `@stripe/stripe-js`, server-side conditionally requires `stripe`)
- **Package manager:** npm (lockfile: `package-lock.json`)

### Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Build | `npm run build` |
| Lint | `npm run lint` |

### Project structure

- `pages/` — Next.js pages: `index.js`, `pricing.js`, `about.js`, `templates.js`, `contact.js`, `404.js`
- `pages/api/checkout.js` — Stripe checkout session API route (gracefully handles missing Stripe keys with demo mode)
- `components/` — `Navbar.js`, `Footer.js`, `Layout.js`, `SEO.js`
- `lib/stripe.js` — Stripe client loader + plan definitions (`PLANS` object)
- `styles/` — CSS Modules (`Home.module.css`, `Pages.module.css`, `Navbar.module.css`, `Footer.module.css`) + `globals.css`

### Non-obvious caveats

- **Stripe server SDK:** The `stripe` npm package is NOT in `package.json` dependencies. The API route (`pages/api/checkout.js`) dynamically `require('stripe')` only when `STRIPE_SECRET_KEY` env var is set. Without it, the checkout endpoint returns a demo-mode JSON response. This is intentional for development without Stripe credentials.
- **Fonts:** Google Fonts (Inter + Playfair Display) are loaded via `_document.js`. If network is unavailable, the system font stack is the fallback.
- **Branding:** All user-facing references use "Resumora" and "resumora.net". "BossMind" appears only in the footer copyright as the parent brand. Do not change this.
