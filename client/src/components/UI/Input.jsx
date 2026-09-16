import styles from './Input.module.css';

export default function Input({ label, value, onChange, placeholder, error, type = 'text', ...rest }) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputRow}>
        <input
          type={type}
          className={`${styles.input} ${error ? styles.hasError : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...rest}
        />
        {error && <span className={styles.errorInline}>{error}</span>}
      </div>
    </div>
  );
}
