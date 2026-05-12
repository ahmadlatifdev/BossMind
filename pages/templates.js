import SEO from '@/components/SEO';
import CTASection from '@/components/CTASection';
import styles from '@/styles/Pages.module.css';

const templates = [
  {
    name: 'Executive Noir',
    desc: 'Bold dark design for C-suite and senior leadership roles.',
    tags: ['Executive', 'ATS', 'Dark'],
    colors: ['var(--color-gold)', 'var(--color-bg-tertiary)', 'var(--color-border)'],
  },
  {
    name: 'Modern Minimal',
    desc: 'Clean, whitespace-driven layout trusted by top tech professionals.',
    tags: ['Tech', 'ATS', 'Minimal'],
    colors: ['var(--color-text-secondary)', 'var(--color-bg-tertiary)', 'var(--color-border)'],
  },
  {
    name: 'Classic Prestige',
    desc: 'Timeless serif design for finance, law, and consulting.',
    tags: ['Finance', 'Traditional', 'ATS'],
    colors: ['#3a5a8c', 'var(--color-bg-tertiary)', 'var(--color-border)'],
  },
  {
    name: 'Creative Edge',
    desc: 'Eye-catching layout for designers, marketers, and creatives.',
    tags: ['Creative', 'Portfolio', 'Bold'],
    colors: ['#8b5cf6', 'var(--color-bg-tertiary)', 'var(--color-border)'],
  },
  {
    name: 'Tech Stack',
    desc: 'Skill-focused template optimized for engineering and developer roles.',
    tags: ['Engineering', 'ATS', 'Skills'],
    colors: ['#10b981', 'var(--color-bg-tertiary)', 'var(--color-border)'],
  },
  {
    name: 'Luxury Gold',
    desc: 'Premium gold-accented design for professionals who demand the best.',
    tags: ['Premium', 'Executive', 'Luxury'],
    colors: ['var(--color-gold)', 'var(--color-gold-dark)', 'var(--color-border-gold)'],
  },
];

export default function Templates() {
  return (
    <>
      <SEO
        title="Resume Templates — Resumora"
        description="Browse Resumora's collection of luxury, ATS-optimized resume templates. Designed for executives, engineers, creatives, and more."
        canonical="/templates"
      />

      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} aria-hidden="true" />
        <div className={styles.pageHeroContent}>
          <h1 className={styles.pageTitle}>
            Luxury <span className={styles.goldText}>Templates</span>
          </h1>
          <p className={styles.pageSub}>
            Every template is ATS-optimized and meticulously designed to make your experience shine.
            Choose your style, add your story.
          </p>
        </div>
      </section>

      <section className={styles.templatesSection}>
        <div className="container">
          <div className={styles.templatesGrid}>
            {templates.map((t) => (
              <div key={t.name} className={styles.templateCard}>
                <div className={styles.templatePreview}>
                  <div className={styles.templateMock}>
                    <div className={styles.templateMockLine} style={{ width: '40%', background: t.colors[0] }} />
                    <div className={styles.templateMockLine} style={{ width: '70%', background: t.colors[1] }} />
                    <div className={styles.templateMockLine} style={{ width: '55%', background: t.colors[1] }} />
                    <div className={styles.templateMockLine} style={{ width: '80%', background: t.colors[2] }} />
                    <div className={styles.templateMockLine} style={{ width: '45%', background: t.colors[1] }} />
                  </div>
                </div>
                <div className={styles.templateInfo}>
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                  <div className={styles.templateTags}>
                    {t.tags.map((tag) => (
                      <span key={tag} className={styles.templateTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Get Started?"
        subtitle="Pick a template and build your resume in minutes."
        buttonText="Start Building"
      />
    </>
  );
}
