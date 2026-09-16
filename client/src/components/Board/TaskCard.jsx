import { Draggable } from '@hello-pangea/dnd';
import styles from './TaskCard.module.css';

export default function TaskCard({ task, index, onClick }) {
  const completed = task.subtasks.filter(s => s.isCompleted).length;
  const total = task.subtasks.length;

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`${styles.card} ${snapshot.isDragging ? styles.dragging : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
        >
          <h3 className={styles.title}>{task.title}</h3>
          {total > 0 && (
            <p className={styles.subtasks}>
              {completed} of {total} subtask{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
