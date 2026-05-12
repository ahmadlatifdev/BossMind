import Link from 'next/link';
import SEO from '@/components/SEO';
import CTASection from '@/components/CTASection';
import PricingCard from '@/components/PricingCard';
import { PLANS } from '@/lib/stripe';
import styles from '@/styles/Home.module.css';

const features = [
  {
    icon: '✦',
    title: 'AI-Powered Writing',
    desc: 'Intelligent content suggestions that transform bullet points into compelling career narratives.',
  },
  {
    icon: '◆',
    title: 'Luxury Templates',
    desc: 'Meticulously crafted designs that balance sophistication with ATS compatibility.',
  },
  {
    icon: '⬡',
    title: 'One-Click Export',
    desc: 'Export to PDF, DOCX, or share a live link. Your resume, your format.',
  },
  {
    icon: '◈',
    title: 'ATS Optimized',
    desc: 'Every template passes applicant tracking systems while looking exceptional to humans.',
  },
  {
    icon: '❖',
    title: 'Cover Letter Builder',
    desc: 'Generate tailored cover letters that complement your resume for each application.',
  },
  {
    icon: '✧',
    title: 'Real-Time Analytics',
    desc: 'Track views, downloads, and engagement with your shared resume links.',
  },
];

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Product Manager at Google',
    initial: 'S',
    text: 'Resumora transformed my resume from ordinary to extraordinary. Landed my dream role within weeks.',
  },
  {
    name: 'Marcus T.',
    role: 'Senior Engineer at Meta',
    initial: 'M',
    text: 'The AI suggestions were incredibly accurate. It knew exactly how to frame my experience for tech roles.',
  },
  {
    name: 'Elena R.',
    role: 'VP of Marketing',
    initial: 'E',
    text: 'The executive templates are stunning. Worth every penny for the professional impression they create.',
  },
];

export default function Home() {
  const planEntries = Object.entries(PLANS);

  return (
    <>
      <SEO canonical="/" />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            Now with AI-powered writing
          </div>
          <h1 className={styles.heroTitle}>
            Resumes That <span className={styles.heroGold}>Command</span> Attention
          </h1>
          <p className={styles.heroSub}>
            Resumora combines artificial intelligence with luxury design to craft resumes that
            open doors. Built for professionals who refuse to blend in.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/pricing" className={styles.btnPrimary}>
              Build Your Resume
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/templates" className={styles.btnSecondary}>
              View Templates
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>50K+</div>
              <div className={styles.statLabel}>Resumes Created</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>94%</div>
              <div className={styles.statLabel}>Interview Rate</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>4.9★</div>
              <div className={styles.statLabel}>User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className="container">
          <div className={styles.sectionLabel}>
            <span aria-hidden="true">◆</span> Features
          </div>
          <h2 className={styles.sectionTitle}>Everything You Need to Stand Out</h2>
          <p className={styles.sectionSub}>
            Professional tools designed for professionals who demand excellence.
          </p>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon} aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <div className="container">
          <div className={styles.sectionLabel}>
            <span aria-hidden="true">◆</span> Pricing
          </div>
          <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
          <p className={styles.sectionSub}>
            Start free. Upgrade when you&apos;re ready for more.
          </p>
          <div className={styles.pricingGrid}>
            {planEntries.map(([key, plan]) => (
              <PricingCard key={key} plan={plan} planKey={key} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className="container">
          <div className={styles.sectionLabel}>
            <span aria-hidden="true">◆</span> Testimonials
          </div>
          <h2 className={styles.sectionTitle}>Loved by Professionals</h2>
          <p className={styles.sectionSub}>
            Join thousands who landed their dream roles with Resumora.
          </p>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.stars} aria-label="5 stars">★★★★★</div>
                <blockquote>&ldquo;{t.text}&rdquo;</blockquote>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>{t.initial}</div>
                  <div className={styles.authorInfo}>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection note="No credit card required &bull; Free plan available" />
    </>
  );
}
