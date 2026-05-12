import { useState } from 'react';
import SEO from '@/components/SEO';
import styles from '@/styles/Pages.module.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <>
      <SEO
        title="Contact — Resumora"
        description="Get in touch with the Resumora team. We're here to help with questions, feedback, or partnership inquiries."
        canonical="/contact"
      />

      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            Get in <span className={styles.goldText}>Touch</span>
          </h1>
          <p className={styles.pageSub}>
            Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <h2>Let&apos;s Connect</h2>
              <p>
                Whether you need help with your resume, have feedback on our platform, or want
                to explore partnership opportunities, our team is ready to assist.
              </p>
              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <div className={styles.contactMethodIcon} aria-hidden="true">✉</div>
                  <div>
                    <strong>Email</strong>
                    <span>hello@resumora.net</span>
                  </div>
                </div>
                <div className={styles.contactMethod}>
                  <div className={styles.contactMethodIcon} aria-hidden="true">◆</div>
                  <div>
                    <strong>Website</strong>
                    <span>resumora.net</span>
                  </div>
                </div>
                <div className={styles.contactMethod}>
                  <div className={styles.contactMethodIcon} aria-hidden="true">⏱</div>
                  <div>
                    <strong>Response Time</strong>
                    <span>Within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>

            <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={styles.formInput}
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.formInput}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className={styles.formInput}
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  placeholder="Tell us more..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className={styles.formSubmit}>
                Send Message
              </button>
              {status === 'success' && (
                <p className={`${styles.formMessage} ${styles.formSuccess}`}>
                  ✓ Message sent! We&apos;ll get back to you within 24 hours.
                </p>
              )}
              {status === 'error' && (
                <p className={styles.formMessage} style={{
                  background: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  color: 'var(--color-error)',
                }}>
                  Please fill in all required fields.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
