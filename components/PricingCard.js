import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function PricingCard({
  plan,
  planKey,
  onCheckout,
  loading,
  interactive = false,
}) {
  return (
    <div className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ''}`}>
      {plan.featured && <div className={styles.priceBadge}>Most Popular</div>}
      <div className={styles.priceName}>{plan.name}</div>
      <div className={styles.priceAmount}>
        <span className={styles.priceCurrency}>$</span>
        {plan.price}
        {plan.period !== 'Free forever' && (
          <span className={styles.pricePeriod}>{plan.period}</span>
        )}
      </div>
      <p className={styles.priceDesc}>{plan.description}</p>
      <ul className={styles.priceFeatures}>
        {plan.features.map((feat) => (
          <li key={feat}>
            <span className={styles.checkIcon} aria-hidden="true">✓</span>
            {feat}
          </li>
        ))}
      </ul>

      {interactive ? (
        <button
          className={`${styles.priceBtn} ${
            plan.featured ? styles.priceBtnPrimary : styles.priceBtnOutline
          }`}
          onClick={() => {
            if (plan.price === 0) {
              onCheckout && onCheckout(planKey, true);
            } else {
              onCheckout && onCheckout(planKey, false);
            }
          }}
          disabled={loading === planKey}
        >
          {loading === planKey
            ? 'Loading…'
            : plan.price === 0
              ? 'Start Free'
              : 'Subscribe Now'}
        </button>
      ) : (
        <Link
          href="/pricing"
          className={`${styles.priceBtn} ${
            plan.featured ? styles.priceBtnPrimary : styles.priceBtnOutline
          }`}
        >
          {plan.price === 0 ? 'Start Free' : 'Get Started'}
        </Link>
      )}
    </div>
  );
}
