import Column from './Column';
import styles from './BoardView.module.css';

export default function BoardView({ board, onTaskClick, onAddColumn }) {
  if (!board) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Select a board to get started</p>
      </div>
    );
  }

  const columns = board.columns ?? [];
  const allColumns = [...columns, { id: '__add__', __isAddSlot: true }];

  return (
    <div className={styles.canvas}>
      {allColumns.map(col => (
        <Column
          key={col.id}
          column={col}
          onTaskClick={onTaskClick}
          onAddColumn={onAddColumn}
        />
      ))}
    </div>
  );
}
