import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import styles from './EditBoardModal.module.css';

const COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#EA5555', '#F0A500', '#FF8F70'];
const EMPTY_COL = () => ({ id: Date.now() + Math.random(), name: '', color: COLUMN_COLORS[0] });

export default function EditBoardModal({ board, isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [columns, setColumns] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (board) {
      setName(board.name);
      setColumns(board.columns.map(c => ({ id: c.id, name: c.name, color: c.color })));
    } else {
      setName('');
      setColumns([EMPTY_COL()]);
    }
    setErrors({});
  }, [board, isOpen]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Can't be empty";
    columns.forEach((c, i) => { if (!c.name.trim()) e[`col_${i}`] = "Can't be empty"; });
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ name: name.trim(), columns });
    onClose();
  };

  const addColumn = () => setColumns(c => [...c, EMPTY_COL()]);
  const removeColumn = (id) => setColumns(c => c.filter(col => col.id !== id));
  const updateColumn = (id, field, val) => setColumns(c => c.map(col => col.id === id ? { ...col, [field]: val } : col));

  const isEdit = !!board;
  const title = isEdit ? 'Edit Board' : 'Add New Board';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.form}>
        <Input
          label="Board Name"
          value={name}
          onChange={e => { setName(e.target.value); setErrors(err => { const c = {...err}; delete c.name; return c; }); }}
          placeholder="e.g. Web Design"
          error={errors.name}
        />
        <div className={styles.field}>
          <label className={styles.label}>Board Columns</label>
          <div className={styles.columnList}>
            {columns.map((col, i) => (
              <div key={col.id} className={styles.columnRow}>
                <span className={styles.colorDot} style={{ background: col.color }} />
                <div className={styles.colInput}>
                  <Input
                    value={col.name}
                    onChange={e => { updateColumn(col.id, 'name', e.target.value); setErrors(err => { const c = {...err}; delete c[`col_${i}`]; return c; }); }}
                    placeholder="e.g. Todo"
                    error={errors[`col_${i}`]}
                  />
                </div>
                <div className={styles.colorPicker}>
                  {COLUMN_COLORS.map(c => (
                    <button
                      key={c}
                      className={`${styles.colorSwatch} ${col.color === c ? styles.colorSelected : ''}`}
                      style={{ background: c }}
                      onClick={() => updateColumn(col.id, 'color', c)}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
                <button className={styles.removeBtn} onClick={() => removeColumn(col.id)}>✕</button>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={addColumn} className={styles.addColBtn}>
            + Add New Column
          </Button>
        </div>
        <Button variant="primary" onClick={handleSubmit} className={styles.submitBtn}>
          {isEdit ? 'Save Changes' : 'Create New Board'}
        </Button>
      </div>
    </Modal>
  );
}
