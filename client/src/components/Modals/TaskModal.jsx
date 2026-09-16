import { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Select from '../UI/Select';
import styles from './TaskModal.module.css';

export default function TaskModal({ task, board, isOpen, onClose, onEdit, onDelete, onStatusChange, onToggleSubtask }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!task) return null;

  const completed = task.subtasks.filter(s => s.isCompleted).length;
  const total = task.subtasks.length;

  const statusOptions = (board?.columns ?? []).map(col => ({ value: String(col.id), label: col.name }));
  const currentColumnId = String(task.columnId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null}>
      <div className={styles.taskHeader}>
        <h2 className={styles.taskTitle}>{task.title}</h2>
        <div className={styles.taskMenuWrapper}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)} aria-label="Task options">
            <svg width="5" height="20" viewBox="0 0 5 20" fill="none">
              <circle cx="2.5" cy="2.5" r="2.5" fill="#828FA3"/>
              <circle cx="2.5" cy="10" r="2.5" fill="#828FA3"/>
              <circle cx="2.5" cy="17.5" r="2.5" fill="#828FA3"/>
            </svg>
          </button>
          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={() => { setMenuOpen(false); onEdit(task); }}>Edit Task</button>
              <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => { setMenuOpen(false); onDelete(task); }}>Delete Task</button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {total > 0 && (
        <div className={styles.subtasksSection}>
          <p className={styles.sectionLabel}>Subtasks ({completed} of {total})</p>
          <ul className={styles.subtaskList}>
            {task.subtasks.map(st => (
              <li
                key={st.id}
                className={`${styles.subtaskItem} ${st.isCompleted ? styles.completed : ''}`}
                onClick={() => onToggleSubtask(task.id, st.id)}
              >
                <span className={`${styles.checkbox} ${st.isCompleted ? styles.checked : ''}`}>
                  {st.isCompleted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className={styles.subtaskTitle}>{st.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.statusSection}>
        <Select
          label="Current Status"
          value={currentColumnId}
          onChange={e => onStatusChange(task.id, Number(e.target.value))}
          options={statusOptions}
        />
      </div>
    </Modal>
  );
}
