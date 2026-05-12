import Link from 'next/link';
import SEO from '@/components/SEO';
import homeStyles from '@/styles/Home.module.css';
import styles from '@/styles/Pages.module.css';

export default function Custom404() {
  return (
    <>
      <SEO title="Page Not Found — Resumora" noindex />
      <section className={styles.pageHero} style={{ minHeight: '60vh' }}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            <span className={styles.goldText}>404</span>
          </h1>
          <p className={styles.pageSub} style={{ marginBottom: 40 }}>
            This page doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
          <Link href="/" className={homeStyles.btnPrimary}>
            Back to Home &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
