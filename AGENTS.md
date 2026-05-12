# AGENTS.md

## Cursor Cloud specific instructions

This is the **BossMind** ecosystem — containing the **Resumora** public site (branded as **resumora.net**) and the **BossMind Master Admin Dashboard** (`/admin`). Built as a Next.js 14 application using the Pages Router.

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

- `pages/` — Public pages: `index.js`, `pricing.js`, `about.js`, `templates.js`, `contact.js`, `privacy.js`, `terms.js`, `404.js`
- `pages/admin/index.js` — BossMind Master Admin Dashboard (uses custom layout, no Navbar/Footer)
- `pages/api/checkout.js` — Stripe checkout session API route (demo-safe without keys)
- `components/` — `Navbar.js`, `Footer.js`, `Layout.js`, `SEO.js`, `CTASection.js`, `PricingCard.js`, `Toast.js`
- `lib/stripe.js` — Stripe client loader + plan definitions (`PLANS` object)
- `lib/dashboard-data.js` — Dashboard mock data for all 5 BossMind projects + global metrics
- `styles/` — CSS Modules for each component/page + `globals.css` + `Admin.module.css`

### Non-obvious caveats

- **Admin dashboard layout:** `/admin` uses a per-page `getLayout` pattern to bypass the default Navbar/Footer layout. The `_app.js` checks for `Component.getLayout` and falls back to the default `<Layout>` wrapper.
- **Stripe server SDK:** The `stripe` npm package is NOT in `package.json` dependencies. The API route dynamically `require('stripe')` only when `STRIPE_SECRET_KEY` env var is set. Without it, the checkout endpoint returns a demo-mode JSON response. This produces a build warning (not an error).
- **Fonts:** Google Fonts (Inter + Playfair Display) are loaded via `_document.js`. System font stack is the fallback.
- **Branding:** Public pages use "Resumora" and "resumora.net". "BossMind" appears in the footer copyright and the admin dashboard. Do not change this hierarchy.
- **Toast component:** Replaces browser `alert()` for checkout feedback. Supports Escape key to close and backdrop click dismiss.
