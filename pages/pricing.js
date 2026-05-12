import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '@/components/SEO';
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
  const planEntries = Object.entries(PLANS);

  const success = router.query.success === 'true';
  const canceled = router.query.canceled === 'true';

  async function handleCheckout(planId) {
    if (PLANS[planId].price === 0) return;
    setLoading(planId);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || 'Checkout initiated (demo mode)');
      }
    } catch {
      alert('Unable to start checkout. Please try again.');
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
              <div
                key={key}
                className={`${homeStyles.priceCard} ${plan.featured ? homeStyles.priceCardFeatured : ''}`}
              >
                {plan.featured && <div className={homeStyles.priceBadge}>Most Popular</div>}
                <div className={homeStyles.priceName}>{plan.name}</div>
                <div className={homeStyles.priceAmount}>
                  <span className={homeStyles.priceCurrency}>$</span>
                  {plan.price}
                  {plan.period !== 'Free forever' && (
                    <span className={homeStyles.pricePeriod}>{plan.period}</span>
                  )}
                </div>
                <p className={homeStyles.priceDesc}>{plan.description}</p>
                <ul className={homeStyles.priceFeatures}>
                  {plan.features.map((feat) => (
                    <li key={feat}>
                      <span className={homeStyles.checkIcon} aria-hidden="true">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className={`${homeStyles.priceBtn} ${
                    plan.featured ? homeStyles.priceBtnPrimary : homeStyles.priceBtnOutline
                  }`}
                  onClick={() => plan.price === 0 ? null : handleCheckout(key)}
                  disabled={loading === key}
                >
                  {loading === key
                    ? 'Loading...'
                    : plan.price === 0
                      ? 'Start Free'
                      : 'Subscribe Now'}
                </button>
              </div>
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

      {/* Bottom CTA */}
      <section className={homeStyles.ctaSection}>
        <div className={homeStyles.ctaBg} aria-hidden="true" />
        <div className={`container ${homeStyles.ctaContent}`}>
          <h2 className={homeStyles.ctaTitle}>Start Building Today</h2>
          <p className={homeStyles.ctaSub}>
            No credit card required. Your next career move starts here.
          </p>
          <Link href="/" className={homeStyles.btnPrimary}>
            Create Your Resume &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
