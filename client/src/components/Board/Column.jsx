import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import styles from './Column.module.css';

export default function Column({ column, onTaskClick, onAddColumn }) {
  const [newColName, setNewColName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddColumn = () => {
    if (newColName.trim()) {
      onAddColumn(newColName.trim());
      setNewColName('');
      setAdding(false);
    }
  };

  // The last "column" is a special add-column slot
  if (column.__isAddSlot) {
    return (
      <div className={styles.addSlot}>
        {adding ? (
          <div className={styles.addForm}>
            <input
              className={styles.addInput}
              autoFocus
              placeholder="Column name…"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddColumn();
                if (e.key === 'Escape') setAdding(false);
              }}
            />
            <div className={styles.addActions}>
              <button className={styles.confirmBtn} onClick={handleAddColumn}>Add Column</button>
              <button className={styles.cancelBtn} onClick={() => setAdding(false)}>✕</button>
            </div>
          </div>
        ) : (
          <button className={styles.addColBtn} onClick={() => setAdding(true)}>
            + New Column
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.dot} style={{ background: column.color }} />
        <span className={styles.name}>
          {column.name} ({column.tasks.length})
        </span>
      </div>

      <Droppable droppableId={String(column.id)}>
        {(provided, snapshot) => (
          <div
            className={`${styles.taskList} ${snapshot.isDraggingOver ? styles.dragOver : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
