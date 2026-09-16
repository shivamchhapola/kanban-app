import Modal from '../UI/Modal';
import Button from '../UI/Button';
import styles from './ConfirmDeleteModal.module.css';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, type = 'task', name }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete this ${type}?`} size="sm">
      <p className={styles.message}>
        Are you sure you want to delete the '{name}' {type}?{' '}
        {type === 'board'
          ? 'This action will remove all columns and tasks and cannot be reversed.'
          : 'This action cannot be reversed.'}
      </p>
      <div className={styles.actions}>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}
