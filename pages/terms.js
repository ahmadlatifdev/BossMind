import SEO from '@/components/SEO';
import CTASection from '@/components/CTASection';
import styles from '@/styles/Pages.module.css';
import legalStyles from '@/styles/Legal.module.css';

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Service — Resumora"
        description="Read Resumora's terms of service. Understand the terms governing your use of our AI-powered resume builder."
        canonical="/terms"
      />

      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            Terms of <span className={styles.goldText}>Service</span>
          </h1>
          <p className={styles.pageSub}>
            Please read these terms carefully before using Resumora.
          </p>
        </div>
      </section>

      <section className={legalStyles.content}>
        <div className="container">
          <div className={legalStyles.body}>
            <p className={legalStyles.updated}>Last updated: May 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Resumora (&ldquo;resumora.net&rdquo;), a product of BossMind,
              you agree to be bound by these Terms of Service. If you do not agree, please
              do not use the service.
            </p>

            <h2>2. Service Description</h2>
            <p>
              Resumora provides an AI-powered resume builder with professional templates,
              AI writing assistance, and export capabilities. Features vary by subscription plan.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account. You must
              provide accurate information when creating an account.
            </p>

            <h2>4. Subscriptions &amp; Payments</h2>
            <p>
              Paid plans are billed monthly through Stripe. You may cancel at any time;
              access continues through the end of the billing period. Refunds are handled
              on a case-by-case basis.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              You retain ownership of the content you create using Resumora. The Resumora
              platform, templates, and AI models remain the intellectual property of BossMind.
            </p>

            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for unlawful purposes</li>
              <li>Reverse-engineer or attempt to extract source code</li>
              <li>Share your account credentials with others</li>
              <li>Scrape or automate access to the service without permission</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <p>
              Resumora is provided &ldquo;as is&rdquo; without warranties of any kind. BossMind
              shall not be liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>

            <h2>8. Contact</h2>
            <p>
              For questions about these terms, contact us at <strong>hello@resumora.net</strong>.
            </p>
          </div>
        </div>
      </section>

      <CTASection
        title="Start Building Today"
        subtitle="Join thousands of professionals using Resumora."
        buttonText="Get Started Free"
      />
    </>
  );
}
