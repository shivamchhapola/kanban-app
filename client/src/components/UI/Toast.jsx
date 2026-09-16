import { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'error', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[type] || ''}`}>
        <span>{message}</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}
