import { PLANS } from '@/lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId } = req.body;

  if (!planId || !PLANS[planId]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const plan = PLANS[planId];
  if (!plan.priceId || plan.price === 0) {
    return res.status(400).json({ error: 'This plan does not require payment' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(200).json({
      message: 'Stripe not configured — demo mode',
      plan: plan.name,
      url: null,
    });
  }

  try {
    const stripe = require('stripe')(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${req.headers.origin || 'https://resumora.net'}/pricing?success=true`,
      cancel_url: `${req.headers.origin || 'https://resumora.net'}/pricing?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
