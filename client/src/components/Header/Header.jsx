import { useState, useRef, useEffect } from 'react';
import Button from '../UI/Button';
import styles from './Header.module.css';

function ThreeDotsIcon() {
  return (
    <svg width="5" height="20" viewBox="0 0 5 20" fill="none">
      <circle cx="2.5" cy="2.5" r="2.5" fill="#828FA3"/>
      <circle cx="2.5" cy="10" r="2.5" fill="#828FA3"/>
      <circle cx="2.5" cy="17.5" r="2.5" fill="#828FA3"/>
    </svg>
  );
}

export default function Header({ board, onAddTask, onEditBoard, onDeleteBoard }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{board?.name ?? 'Select a Board'}</h1>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="md"
          disabled={!board}
          onClick={onAddTask}
        >
          + Add New Task
        </Button>

        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Board options"
            disabled={!board}
          >
            <ThreeDotsIcon />
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={() => { setMenuOpen(false); onEditBoard(); }}>
                Edit Board
              </button>
              <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => { setMenuOpen(false); onDeleteBoard(); }}>
                Delete Board
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
