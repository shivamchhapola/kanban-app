import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { boardsApi } from './api/boardsApi';
import { tasksApi } from './api/tasksApi';
import { subtasksApi } from './api/subtasksApi';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import BoardView from './components/Board/BoardView';
import TaskModal from './components/Modals/TaskModal';
import CreateTaskModal from './components/Modals/CreateTaskModal';
import EditTaskModal from './components/Modals/EditTaskModal';
import EditBoardModal from './components/Modals/EditBoardModal';
import ConfirmDeleteModal from './components/Modals/ConfirmDeleteModal';
import './styles/global.css';
import styles from './App.module.css';

// ── Helpers ──────────────────────────────────────────────────────────
function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function App() {
  // ── Auto-disappearing scrollbars ──
  useEffect(() => {
    const handleScroll = (e) => {
      const el = e.target;
      if (el && el.classList) {
        el.classList.add('is-scrolling');
        clearTimeout(el._scrollTimer);
        el._scrollTimer = setTimeout(() => {
          el.classList.remove('is-scrolling');
        }, 600);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  // ── State ──
  const [boards, setBoards] = useState([]);
  const [boardDetails, setBoardDetails] = useState({});
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedTask, setSelectedTask]       = useState(null);
  const [taskToEdit, setTaskToEdit]           = useState(null);
  const [taskToDelete, setTaskToDelete]       = useState(null);
  const [showCreateTask, setShowCreateTask]   = useState(false);
  const [showEditBoard, setShowEditBoard]     = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);

  const activeBoard = (activeBoardId && boardDetails[activeBoardId]) ? boardDetails[activeBoardId] : null;

  // ── Initial Fetch on Mount ──
  useEffect(() => {
    async function loadBoards() {
      try {
        setLoading(true);
        setError(null);
        const data = await boardsApi.getAllBoards();
        setBoards(data);
        if (data.length > 0) {
          const firstId = data[0].id;
          setActiveBoardId(firstId);
          const detail = await boardsApi.getBoardById(firstId);
          setBoardDetails(prev => ({ ...prev, [firstId]: detail }));
        }
      } catch (err) {
        console.error('Failed to load boards:', err);
        setError('Failed to load data from backend server. Please make sure the server is running.');
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, []);

  // ── Board selection ──
  const handleSelectBoard = async (id) => {
    setActiveBoardId(id);
    if (!boardDetails[id]) {
      try {
        const detail = await boardsApi.getBoardById(id);
        setBoardDetails(prev => ({ ...prev, [id]: detail }));
      } catch (err) {
        console.error('Failed to load board detail:', err);
      }
    }
  };

  // ── Drag and drop ──
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const board = boardDetails[activeBoardId];
    if (!board) return;

    const sourceCol = board.columns.find(c => String(c.id) === source.droppableId);
    const destCol = board.columns.find(c => String(c.id) === destination.droppableId);
    if (!sourceCol || !destCol) return;

    const movedTask = sourceCol.tasks[source.index];

    // Optimistic UI update
    if (source.droppableId === destination.droppableId) {
      const reordered = reorder(sourceCol.tasks, source.index, destination.index);
      setBoardDetails(prev => ({
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => (c.id === sourceCol.id ? { ...c, tasks: reordered } : c)),
        },
      }));
    } else {
      const newSourceTasks = Array.from(sourceCol.tasks);
      newSourceTasks.splice(source.index, 1);
      const newDestTasks = Array.from(destCol.tasks);
      newDestTasks.splice(destination.index, 0, { ...movedTask, columnId: destCol.id });

      setBoardDetails(prev => ({
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => {
            if (c.id === sourceCol.id) return { ...c, tasks: newSourceTasks };
            if (c.id === destCol.id) return { ...c, tasks: newDestTasks };
            return c;
          }),
        },
      }));
    }

    // Persist drag position to backend API
    try {
      await tasksApi.updateTask(movedTask.id, {
        columnId: destCol.id,
        position: destination.index,
      });
    } catch (err) {
      console.error('Failed to persist task drag position:', err);
    }
  };

  // ── Task CRUD ──
  const handleCreateTask = async ({ title, description, columnId, subtasks }) => {
    try {
      const created = await tasksApi.createTask({
        title,
        description,
        columnId: Number(columnId),
        subtasks: subtasks.map(st => ({ title: st.title })),
      });

      setBoardDetails(prev => {
        const board = prev[activeBoardId];
        if (!board) return prev;
        return {
          ...prev,
          [activeBoardId]: {
            ...board,
            columns: board.columns.map(c =>
              c.id === Number(columnId) ? { ...c, tasks: [...c.tasks, created] } : c
            ),
          },
        };
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    try {
      await tasksApi.updateTask(taskId, {
        title: data.title,
        description: data.description,
        columnId: Number(data.columnId),
        subtasks: data.subtasks.map(st => ({ title: st.title, isCompleted: st.isCompleted })),
      });

      const detail = await boardsApi.getBoardById(activeBoardId);
      setBoardDetails(prev => ({ ...prev, [activeBoardId]: detail }));

      setSelectedTask(null);
      setTaskToEdit(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await tasksApi.deleteTask(taskToDelete.id);

      setBoardDetails(prev => {
        const board = prev[activeBoardId];
        if (!board) return prev;
        return {
          ...prev,
          [activeBoardId]: {
            ...board,
            columns: board.columns.map(c => ({
              ...c,
              tasks: c.tasks.filter(t => t.id !== taskToDelete.id),
            })),
          },
        };
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setTaskToDelete(null);
      setSelectedTask(null);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    // Optimistic UI update
    setBoardDetails(prev => {
      const board = prev[activeBoardId];
      if (!board) return prev;
      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => ({
            ...c,
            tasks: c.tasks.map(t =>
              t.id !== taskId
                ? t
                : {
                    ...t,
                    subtasks: t.subtasks.map(st =>
                      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
                    ),
                  }
            ),
          })),
        },
      };
    });

    setSelectedTask(prev =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks.map(st =>
              st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            ),
          }
        : prev
    );

    try {
      await subtasksApi.toggleSubtask(subtaskId);
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleStatusChange = async (taskId, newColumnId) => {
    const numColId = Number(newColumnId);

    setBoardDetails(prev => {
      const board = prev[activeBoardId];
      if (!board) return prev;
      const sourceCol = board.columns.find(c => c.tasks.some(t => t.id === taskId));
      if (!sourceCol) return prev;
      const task = sourceCol.tasks.find(t => t.id === taskId);
      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => {
            if (c.id === sourceCol.id) return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
            if (c.id === numColId) return { ...c, tasks: [...c.tasks, { ...task, columnId: numColId }] };
            return c;
          }),
        },
      };
    });
    setSelectedTask(null);

    try {
      await tasksApi.updateTask(taskId, { columnId: numColId });
    } catch (err) {
      console.error('Failed to change task status:', err);
    }
  };

  // ── Board CRUD ──
  const handleSaveBoard = async ({ name, columns }) => {
    try {
      if (showEditBoard && activeBoardId) {
        const updated = await boardsApi.updateBoard(activeBoardId, { name, columns });
        const normalized = {
          ...updated,
          columns: (updated.columns || []).map(c => ({ ...c, tasks: c.tasks || [] })),
        };
        setBoardDetails(prev => ({ ...prev, [activeBoardId]: normalized }));
        setBoards(prev => prev.map(b => (b.id === activeBoardId ? { ...b, name } : b)));
      } else {
        const created = await boardsApi.createBoard({ name, columns });
        const normalized = {
          ...created,
          columns: (created.columns || []).map(c => ({ ...c, tasks: c.tasks || [] })),
        };
        setBoards(prev => [...prev, { id: normalized.id, name: normalized.name }]);
        setBoardDetails(prev => ({ ...prev, [normalized.id]: normalized }));
        setActiveBoardId(normalized.id);
      }
    } catch (err) {
      console.error('Failed to save board:', err);
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoardId) return;
    try {
      await boardsApi.deleteBoard(activeBoardId);

      const remainingBoards = boards.filter(b => b.id !== activeBoardId);
      setBoards(remainingBoards);
      setBoardDetails(prev => {
        const copy = { ...prev };
        delete copy[activeBoardId];
        return copy;
      });

      const nextId = remainingBoards[0]?.id ?? null;
      setActiveBoardId(nextId);
      if (nextId) {
        const detail = await boardsApi.getBoardById(nextId);
        setBoardDetails(prev => ({ ...prev, [nextId]: detail }));
      }
    } catch (err) {
      console.error('Failed to delete board:', err);
    } finally {
      setShowDeleteBoard(false);
    }
  };

  // ── Add column inline ──
  const handleAddColumn = async (colName) => {
    if (!activeBoardId) return;
    const COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#EA5555', '#F0A500'];
    const currentCols = boardDetails[activeBoardId]?.columns ?? [];
    const color = COLORS[currentCols.length % COLORS.length];

    try {
      const newCol = await boardsApi.addColumn(activeBoardId, { name: colName, color });
      setBoardDetails(prev => {
        const board = prev[activeBoardId];
        if (!board) return prev;
        return {
          ...prev,
          [activeBoardId]: {
            ...board,
            columns: [...board.columns, { ...newCol, tasks: [] }],
          },
        };
      });
    } catch (err) {
      console.error('Failed to add column:', err);
    }
  };

  return (
    <ThemeProvider>
      <div className={styles.app}>
        <Sidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={() => setShowCreateBoard(true)}
        />
        <div className={styles.main}>
          <Header
            board={activeBoard}
            onAddTask={() => setShowCreateTask(true)}
            onEditBoard={() => setShowEditBoard(true)}
            onDeleteBoard={() => setShowDeleteBoard(true)}
          />
          <div className={styles.boardArea}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Loading boards from database…
              </div>
            ) : error ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--danger)', fontWeight: 700 }}>
                {error}
              </div>
            ) : (
              <BoardView
                board={activeBoard}
                onTaskClick={setSelectedTask}
                onDragEnd={handleDragEnd}
                onAddColumn={handleAddColumn}
              />
            )}
          </div>
        </div>
      </div>

      {/* Task view modal */}
      <TaskModal
        task={selectedTask}
        board={activeBoard}
        isOpen={!!selectedTask && !taskToEdit}
        onClose={() => setSelectedTask(null)}
        onEdit={(task) => { setTaskToEdit(task); setSelectedTask(null); }}
        onDelete={(task) => { setTaskToDelete(task); setSelectedTask(null); }}
        onToggleSubtask={handleToggleSubtask}
        onStatusChange={handleStatusChange}
      />

      {/* Create task modal */}
      <CreateTaskModal
        board={activeBoard}
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={handleCreateTask}
      />

      {/* Edit task modal */}
      <EditTaskModal
        task={taskToEdit}
        board={activeBoard}
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onSubmit={handleUpdateTask}
      />

      {/* Edit board modal */}
      <EditBoardModal
        board={showEditBoard ? activeBoard : null}
        isOpen={showEditBoard || showCreateBoard}
        onClose={() => { setShowEditBoard(false); setShowCreateBoard(false); }}
        onSubmit={handleSaveBoard}
      />

      {/* Delete task */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        type="task"
        name={taskToDelete?.title ?? ''}
      />

      {/* Delete board */}
      <ConfirmDeleteModal
        isOpen={showDeleteBoard}
        onClose={() => setShowDeleteBoard(false)}
        onConfirm={handleDeleteBoard}
        type="board"
        name={activeBoard?.name ?? ''}
      />
    </ThemeProvider>
  );
}
