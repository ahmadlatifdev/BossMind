import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function CTASection({
  title = 'Ready to Elevate Your Career?',
  subtitle = 'Join 50,000+ professionals who chose Resumora. Start building your resume today.',
  buttonText = 'Get Started Free',
  buttonHref = '/pricing',
  note,
}) {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaBg} aria-hidden="true" />
      <div className={`container ${styles.ctaContent}`}>
        <h2 className={styles.ctaTitle}>{title}</h2>
        <p className={styles.ctaSub}>{subtitle}</p>
        <Link href={buttonHref} className={styles.btnPrimary}>
          {buttonText}
          <span aria-hidden="true">&rarr;</span>
        </Link>
        {note && <p className={styles.ctaNote}>{note}</p>}
      </div>
    </section>
  );
}
