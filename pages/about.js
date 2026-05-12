import Link from 'next/link';
import SEO from '@/components/SEO';
import homeStyles from '@/styles/Home.module.css';
import styles from '@/styles/Pages.module.css';

const values = [
  { icon: '◆', title: 'Excellence', desc: 'Every pixel, every word suggestion — crafted to perfection.' },
  { icon: '✦', title: 'Innovation', desc: 'AI that understands career narratives, not just keywords.' },
  { icon: '◈', title: 'Accessibility', desc: 'Professional tools that are powerful yet intuitive for everyone.' },
];

const stats = [
  { value: '50K+', label: 'Resumes Created' },
  { value: '120+', label: 'Countries Served' },
  { value: '94%', label: 'Interview Rate' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function About() {
  return (
    <>
      <SEO
        title="About — Resumora"
        description="Learn about Resumora by BossMind — the AI-powered luxury resume builder helping professionals worldwide land their dream roles."
        canonical="/about"
      />

      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            The Story Behind <span className={styles.goldText}>Resumora</span>
          </h1>
          <p className={styles.pageSub}>
            We believe every professional deserves a resume that reflects their true potential.
            Resumora was built to make that a reality.
          </p>
        </div>
      </section>

      <section className={styles.aboutSection}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutVisual}>
              <span className={styles.aboutVisualText} aria-hidden="true">R</span>
            </div>
            <div className={styles.aboutContent}>
              <h2>Built by <span className={styles.goldText}>BossMind</span></h2>
              <p>
                Resumora started with a simple observation: the tools professionals use to present
                themselves haven&apos;t kept pace with how hiring works today. Generic templates and
                outdated formats were costing talented people opportunities.
              </p>
              <p>
                We combined cutting-edge AI with luxury design principles to create a resume
                builder that doesn&apos;t just format your experience — it elevates it. Every template
                is ATS-optimized, every AI suggestion is contextually aware, and every export is
                pixel-perfect.
              </p>
              <p>
                Today, <strong>resumora.net</strong> serves over 50,000 professionals across 120+
                countries, helping them land roles at companies like Google, Meta, Goldman Sachs,
                and McKinsey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.values}>
        <div className="container">
          <h2 className={homeStyles.sectionTitle} style={{ textAlign: 'center' }}>
            Our Values
          </h2>
          <div className={styles.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon} aria-hidden="true">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className={homeStyles.heroStats} style={{ borderTop: 'none', paddingTop: 0 }}>
            {stats.map((s) => (
              <div key={s.label} className={homeStyles.stat}>
                <div className={homeStyles.statValue}>{s.value}</div>
                <div className={homeStyles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={homeStyles.ctaSection}>
        <div className={homeStyles.ctaBg} aria-hidden="true" />
        <div className={`container ${homeStyles.ctaContent}`}>
          <h2 className={homeStyles.ctaTitle}>Join the Resumora Community</h2>
          <p className={homeStyles.ctaSub}>
            Start building your professional future today.
          </p>
          <Link href="/pricing" className={homeStyles.btnPrimary}>
            Get Started Free &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
