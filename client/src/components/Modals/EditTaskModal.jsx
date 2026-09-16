import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import CrossIcon from '../UI/CrossIcon';
import styles from './TaskFormModal.module.css';

const EMPTY_SUBTASK = (title = '', isCompleted = false) => ({ id: Date.now() + Math.random(), title, isCompleted });

export default function EditTaskModal({ task, board, isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [columnId, setColumnId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setSubtasks(task.subtasks.map(st => EMPTY_SUBTASK(st.title, st.isCompleted)));
      setColumnId(String(task.columnId));
    }
  }, [task]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Can't be empty";
    subtasks.forEach((st, i) => { if (!st.title.trim()) e[`st_${i}`] = "Can't be empty"; });
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(task.id, { title: title.trim(), description: description.trim(), columnId: Number(columnId), subtasks: subtasks.map(st => ({ title: st.title.trim(), isCompleted: st.isCompleted })) });
    onClose();
  };

  const addSubtask = () => setSubtasks(s => [...s, EMPTY_SUBTASK()]);
  const removeSubtask = (id) => setSubtasks(s => s.filter(st => st.id !== id));
  const updateSubtask = (id, val) => setSubtasks(s => s.map(st => st.id === id ? { ...st, title: val } : st));

  const columnOptions = (board?.columns ?? []).map(c => ({ value: String(c.id), label: c.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <div className={styles.form}>
        <Input label="Title" value={title} onChange={e => { setTitle(e.target.value); setErrors(err => { const c = {...err}; delete c.title; return c; }); }} placeholder="Task title" error={errors.title} />
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={4} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Subtasks</label>
          <div className={styles.subtaskList}>
            {subtasks.map((st, i) => (
              <div key={st.id} className={styles.subtaskRow}>
                <Input value={st.title} onChange={e => updateSubtask(st.id, e.target.value)} placeholder="Subtask title" error={errors[`st_${i}`]} />
                <button className={styles.removeBtn} onClick={() => removeSubtask(st.id)} aria-label="Remove subtask">
                  <CrossIcon />
                </button>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={addSubtask} className={styles.addSubtaskBtn}>+ Add New Subtask</Button>
        </div>
        <Select label="Status" value={columnId} onChange={e => setColumnId(e.target.value)} options={columnOptions} />
        <Button variant="primary" onClick={handleSubmit} className={styles.submitBtn}>Save Changes</Button>
      </div>
    </Modal>
  );
}
