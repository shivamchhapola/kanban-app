import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { MOCK_BOARDS, MOCK_BOARD_DETAIL } from './data/mockData';
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
  // ── State ──
  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [boardDetails, setBoardDetails] = useState({ [MOCK_BOARD_DETAIL.id]: MOCK_BOARD_DETAIL });
  const [activeBoardId, setActiveBoardId] = useState(MOCK_BOARD_DETAIL.id);

  // Modal state
  const [selectedTask, setSelectedTask]         = useState(null);
  const [taskToEdit, setTaskToEdit]             = useState(null);
  const [taskToDelete, setTaskToDelete]         = useState(null);
  const [showCreateTask, setShowCreateTask]     = useState(false);
  const [showEditBoard, setShowEditBoard]       = useState(false);
  const [showCreateBoard, setShowCreateBoard]   = useState(false);
  const [showDeleteBoard, setShowDeleteBoard]   = useState(false);

  const activeBoard = boardDetails[activeBoardId] ?? null;

  // ── Board selection ──
  const handleSelectBoard = (id) => {
    setActiveBoardId(id);
    // Load mock detail for others too (stub — real app fetches from API)
    if (!boardDetails[id]) {
      setBoardDetails(d => ({ ...d, [id]: { id, name: boards.find(b => b.id === id)?.name, columns: [] } }));
    }
  };

  // ── Drag and drop ──
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const board = boardDetails[activeBoardId];
    const sourceCol = board.columns.find(c => String(c.id) === source.droppableId);
    const destCol = board.columns.find(c => String(c.id) === destination.droppableId);

    if (source.droppableId === destination.droppableId) {
      // Same column reorder
      const reordered = reorder(sourceCol.tasks, source.index, destination.index);
      setBoardDetails(d => ({
        ...d,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => c.id === sourceCol.id ? { ...c, tasks: reordered } : c),
        },
      }));
    } else {
      // Move to different column
      const task = sourceCol.tasks[source.index];
      const newSourceTasks = Array.from(sourceCol.tasks);
      newSourceTasks.splice(source.index, 1);
      const newDestTasks = Array.from(destCol.tasks);
      newDestTasks.splice(destination.index, 0, { ...task, columnId: destCol.id });

      setBoardDetails(d => ({
        ...d,
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
  };

  // ── Task CRUD ──
  const handleCreateTask = ({ title, description, columnId, subtasks }) => {
    const board = boardDetails[activeBoardId];
    const newTask = { id: Date.now(), title, description, columnId, subtasks: subtasks.map((st, i) => ({ id: Date.now() + i, title: st.title, isCompleted: false })) };
    setBoardDetails(d => ({
      ...d,
      [activeBoardId]: {
        ...board,
        columns: board.columns.map(c => c.id === columnId ? { ...c, tasks: [...c.tasks, newTask] } : c),
      },
    }));
  };

  const handleUpdateTask = (taskId, data) => {
    const board = boardDetails[activeBoardId];
    const currentCol = board.columns.find(c => c.tasks.some(t => t.id === taskId));
    let task = currentCol.tasks.find(t => t.id === taskId);
    const updated = { ...task, ...data, subtasks: data.subtasks.map((st, i) => ({ id: Date.now() + i, ...st })) };

    if (data.columnId !== currentCol.id) {
      // Move between columns
      setBoardDetails(d => ({
        ...d,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => {
            if (c.id === currentCol.id) return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
            if (c.id === data.columnId) return { ...c, tasks: [...c.tasks, { ...updated, columnId: data.columnId }] };
            return c;
          }),
        },
      }));
    } else {
      setBoardDetails(d => ({
        ...d,
        [activeBoardId]: {
          ...board,
          columns: board.columns.map(c => c.id === currentCol.id ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? updated : t) } : c),
        },
      }));
    }
    setSelectedTask(null);
    setTaskToEdit(null);
  };

  const handleDeleteTask = () => {
    const board = boardDetails[activeBoardId];
    setBoardDetails(d => ({
      ...d,
      [activeBoardId]: {
        ...board,
        columns: board.columns.map(c => ({ ...c, tasks: c.tasks.filter(t => t.id !== taskToDelete.id) })),
      },
    }));
    setTaskToDelete(null);
    setSelectedTask(null);
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    const board = boardDetails[activeBoardId];
    const newBoard = {
      ...board,
      columns: board.columns.map(c => ({
        ...c,
        tasks: c.tasks.map(t => t.id !== taskId ? t : {
          ...t,
          subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st),
        }),
      })),
    };
    setBoardDetails(d => ({ ...d, [activeBoardId]: newBoard }));
    setSelectedTask(prev => prev ? {
      ...prev,
      subtasks: prev.subtasks.map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st),
    } : prev);
  };

  const handleStatusChange = (taskId, newColumnId) => {
    const board = boardDetails[activeBoardId];
    const sourceCol = board.columns.find(c => c.tasks.some(t => t.id === taskId));
    const task = sourceCol.tasks.find(t => t.id === taskId);
    setBoardDetails(d => ({
      ...d,
      [activeBoardId]: {
        ...board,
        columns: board.columns.map(c => {
          if (c.id === sourceCol.id) return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
          if (c.id === newColumnId) return { ...c, tasks: [...c.tasks, { ...task, columnId: newColumnId }] };
          return c;
        }),
      },
    }));
    setSelectedTask(null);
  };

  // ── Board CRUD ──
  const handleSaveBoard = ({ name, columns }) => {
    if (showEditBoard) {
      // Edit existing
      setBoardDetails(d => ({
        ...d,
        [activeBoardId]: { ...d[activeBoardId], name, columns: columns.map((c, i) => ({ ...c, tasks: d[activeBoardId].columns.find(oc => oc.id === c.id)?.tasks ?? [], position: i })) },
      }));
      setBoards(b => b.map(board => board.id === activeBoardId ? { ...board, name } : board));
    } else {
      // Create new
      const id = Date.now();
      const newBoard = { id, name, columns: columns.map((c, i) => ({ ...c, id: Date.now() + i, tasks: [], position: i })) };
      setBoards(b => [...b, { id, name }]);
      setBoardDetails(d => ({ ...d, [id]: newBoard }));
      setActiveBoardId(id);
    }
  };

  const handleDeleteBoard = () => {
    setBoards(b => b.filter(board => board.id !== activeBoardId));
    setBoardDetails(d => { const copy = { ...d }; delete copy[activeBoardId]; return copy; });
    const remaining = boards.filter(b => b.id !== activeBoardId);
    setActiveBoardId(remaining[0]?.id ?? null);
    setShowDeleteBoard(false);
  };

  // ── Add column inline ──
  const handleAddColumn = (colName) => {
    const board = boardDetails[activeBoardId];
    const COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#EA5555', '#F0A500'];
    const newCol = { id: Date.now(), name: colName, color: COLORS[board.columns.length % COLORS.length], tasks: [] };
    setBoardDetails(d => ({ ...d, [activeBoardId]: { ...board, columns: [...board.columns, newCol] } }));
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
            <BoardView
              board={activeBoard}
              onTaskClick={setSelectedTask}
              onDragEnd={handleDragEnd}
              onAddColumn={handleAddColumn}
            />
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
