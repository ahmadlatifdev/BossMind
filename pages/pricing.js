import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import SEO from '@/components/SEO';
import CTASection from '@/components/CTASection';
import PricingCard from '@/components/PricingCard';
import Toast from '@/components/Toast';
import { PLANS } from '@/lib/stripe';
import homeStyles from '@/styles/Home.module.css';
import styles from '@/styles/Pages.module.css';

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Absolutely. You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes! All paid plans include a 7-day free trial. No credit card required to start your trial.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. All payments are securely processed and encrypted.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel anytime from your account settings. You will retain access to your current plan until the end of your billing period.',
  },
  {
    q: 'Do you offer team or enterprise pricing?',
    a: 'Yes! Contact us for custom enterprise pricing for teams of 10 or more. We offer volume discounts and dedicated support.',
  },
];

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [toast, setToast] = useState({ open: false, title: '', message: '' });
  const planEntries = Object.entries(PLANS);

  const success = router.query.success === 'true';
  const canceled = router.query.canceled === 'true';

  const closeToast = useCallback(() => setToast((t) => ({ ...t, open: false })), []);

  async function handleCheckout(planKey, isFree) {
    if (isFree) {
      setToast({
        open: true,
        title: 'Welcome to Resumora!',
        message: 'Your free account is ready. Start building your resume now.',
      });
      return;
    }

    setLoading(planKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: planKey }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({
          open: true,
          title: 'Demo Mode',
          message: data.message || `${PLANS[planKey].name} plan selected. Stripe checkout will activate once payment keys are configured.`,
        });
      }
    } catch {
      setToast({
        open: true,
        title: 'Connection Error',
        message: 'Unable to reach the checkout service. Please try again in a moment.',
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <SEO
        title="Pricing — Resumora"
        description="Simple, transparent pricing for Resumora. Start free, upgrade when ready. Plans for individuals and executives."
        canonical="/pricing"
      />

      <Toast open={toast.open} onClose={closeToast} title={toast.title} message={toast.message} />

      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            Choose Your <span className={styles.goldText}>Plan</span>
          </h1>
          <p className={styles.pageSub}>
            Start free. Scale as you grow. Every plan includes our core AI-powered resume builder.
          </p>
          {success && (
            <p style={{ color: 'var(--color-success)', marginTop: 16 }}>
              ✓ Payment successful! Welcome to Resumora Pro.
            </p>
          )}
          {canceled && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
              Checkout canceled. You can try again anytime.
            </p>
          )}
        </div>
      </section>

      <section className={styles.pricingPageSection}>
        <div className="container">
          <div className={homeStyles.pricingGrid}>
            {planEntries.map(([key, plan]) => (
              <PricingCard
                key={key}
                plan={plan}
                planKey={key}
                interactive
                onCheckout={handleCheckout}
                loading={loading}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <div className="container">
          <h2 className={homeStyles.sectionTitle} style={{ textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <span className={`${styles.faqArrow} ${openFaq === i ? styles.faqArrowOpen : ''}`}>
                    ▼
                  </span>
                </button>
                {openFaq === i && <div className={styles.faqAnswer}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Start Building Today"
        subtitle="No credit card required. Your next career move starts here."
        buttonText="Create Your Resume"
        buttonHref="/"
      />
    </>
  );
}
