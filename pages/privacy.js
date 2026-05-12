import SEO from '@/components/SEO';
import CTASection from '@/components/CTASection';
import styles from '@/styles/Pages.module.css';
import legalStyles from '@/styles/Legal.module.css';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy — Resumora"
        description="Read Resumora's privacy policy. Learn how we collect, use, and protect your personal information."
        canonical="/privacy"
      />

      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            Privacy <span className={styles.goldText}>Policy</span>
          </h1>
          <p className={styles.pageSub}>
            Your privacy matters. Here&apos;s how we handle your data.
          </p>
        </div>
      </section>

      <section className={legalStyles.content}>
        <div className="container">
          <div className={legalStyles.body}>
            <p className={legalStyles.updated}>Last updated: May 2026</p>

            <h2>1. Information We Collect</h2>
            <p>
              When you use Resumora (&quot;resumora.net&quot;), we may collect information you provide
              directly, such as your name, email address, and resume content. We also collect
              usage data to improve our service, including pages visited and features used.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve the Resumora resume builder service</li>
              <li>Process payments through our secure payment partner (Stripe)</li>
              <li>Send service-related communications</li>
              <li>Analyze usage patterns to enhance the user experience</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal
              information. All data is encrypted in transit using TLS and at rest. Payment
              information is processed by Stripe and never stored on our servers.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>
              We use trusted third-party services including Stripe for payment processing
              and Google Fonts for typography. Each service has its own privacy policy
              governing data handling.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal data at any time.
              Contact us at <strong>hello@resumora.net</strong> to exercise these rights.
            </p>

            <h2>6. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and preferences. We do not
              use third-party tracking cookies without your consent.
            </p>

            <h2>7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at <strong>hello@resumora.net</strong>.
            </p>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Build Your Resume?"
        subtitle="Your data is safe with us. Start creating today."
        buttonText="Get Started"
      />
    </>
  );
}
