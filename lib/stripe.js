import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    period: 'Free forever',
    description: 'Perfect for getting started with your first professional resume.',
    features: [
      '1 resume template',
      'Basic AI suggestions',
      'PDF export',
      'Email support',
    ],
    priceId: null,
  },
  professional: {
    name: 'Professional',
    price: 12,
    period: '/month',
    description: 'For career-focused professionals who want to stand out.',
    features: [
      'All premium templates',
      'Advanced AI writing',
      'Multiple export formats',
      'Cover letter builder',
      'Priority support',
      'Analytics dashboard',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_professional',
    featured: true,
  },
  executive: {
    name: 'Executive',
    price: 29,
    period: '/month',
    description: 'For executives and senior professionals demanding the best.',
    features: [
      'Everything in Professional',
      'Executive templates',
      'Personal branding kit',
      'LinkedIn optimization',
      'Interview prep AI',
      '1-on-1 review session',
      'White-glove support',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_EXEC_PRICE_ID || 'price_executive',
  },
};
