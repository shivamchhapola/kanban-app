import { apiClient } from './apiClient';

export const boardsApi = {
  getAllBoards: () => apiClient('/boards'),
  getBoardById: (id) => apiClient(`/boards/${id}`),
  createBoard: (data) => apiClient('/boards', { body: data, method: 'POST' }),
  updateBoard: (id, data) => apiClient(`/boards/${id}`, { body: data, method: 'PUT' }),
  deleteBoard: (id) => apiClient(`/boards/${id}`, { method: 'DELETE' }),
  addColumn: (boardId, colData) => apiClient(`/boards/${boardId}/columns`, { body: colData, method: 'POST' }),
};
