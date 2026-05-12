import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <span className={styles.logo}>Resumora</span>
          <p className={styles.tagline}>
            AI-powered luxury resume builder. Craft resumes that command attention and open doors.
          </p>
        </div>

        <div className={styles.column}>
          <h4>Product</h4>
          <ul>
            <li><Link href="/templates">Templates</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Resources</h4>
          <ul>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/about">Our Story</Link></li>
            <li><a href="https://resumora.net" target="_blank" rel="noopener noreferrer">resumora.net</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          &copy; {currentYear} <span className={styles.domain}>resumora.net</span> &mdash; A BossMind Product. All rights reserved.
        </p>
        <div className={styles.social}>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
            𝕏
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
            in
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
            GH
          </a>
        </div>
      </div>
    </footer>
  );
}
