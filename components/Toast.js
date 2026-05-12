import { useEffect } from 'react';
import styles from '@/styles/Toast.module.css';

export default function Toast({ open, onClose, title, message, icon = '✓' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon} aria-hidden="true">{icon}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <button className={styles.button} onClick={onClose}>
          Got It
        </button>
      </div>
    </div>
  );
}
