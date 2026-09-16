import { useTheme } from '../../context/ThemeContext';
import styles from './Sidebar.module.css';

// Board grid icon SVG
function BoardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0" y="0" width="6" height="10" rx="1" fill="currentColor"/>
      <rect x="9" y="0" width="7" height="6" rx="1" fill="currentColor"/>
      <rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="1" y1="9" x2="3" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="15" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="13.54" y1="13.54" x2="14.95" y2="14.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="14.95" y1="3.05" x2="13.54" y2="4.46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4.46" y1="13.54" x2="3.05" y2="14.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2a6 6 0 1 0 8 8 4.5 4.5 0 0 1-8-8z" fill="currentColor"/>
    </svg>
  );
}

export default function Sidebar({ boards, activeBoardId, onSelectBoard, onCreateBoard }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <span style={{ background: '#635FC7' }} />
          <span style={{ background: '#A8A4FF' }} />
          <span style={{ background: '#fff' }} />
        </div>
        <span className={styles.logoText}>kanban</span>
      </div>

      {/* Board list */}
      <div className={styles.boardSection}>
        <p className={styles.sectionLabel}>ALL BOARDS ({boards.length})</p>
        <ul className={styles.boardList}>
          {boards.map(board => (
            <li key={board.id}>
              <button
                className={`${styles.boardItem} ${board.id === activeBoardId ? styles.active : ''}`}
                onClick={() => onSelectBoard(board.id)}
              >
                <BoardIcon />
                <span>{board.name}</span>
              </button>
            </li>
          ))}
          <li>
            <button className={styles.createBtn} onClick={onCreateBoard}>
              <BoardIcon />
              <span>+ Create New Board</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Theme toggle */}
      <div className={styles.themeSection}>
        <div className={styles.themeToggle}>
          <span className={styles.themeIcon}><SunIcon /></span>
          <button
            className={`${styles.toggle} ${theme === 'dark' ? styles.toggleDark : styles.toggleLight}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className={styles.toggleThumb} />
          </button>
          <span className={styles.themeIcon}><MoonIcon /></span>
        </div>
      </div>
    </aside>
  );
}
