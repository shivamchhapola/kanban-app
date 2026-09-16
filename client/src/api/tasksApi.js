import { apiClient } from './apiClient';

export const tasksApi = {
  getTaskById: (id) => apiClient(`/tasks/${id}`),
  createTask: (data) => apiClient('/tasks', { body: data, method: 'POST' }),
  updateTask: (id, data) => apiClient(`/tasks/${id}`, { body: data, method: 'PUT' }),
  deleteTask: (id) => apiClient(`/tasks/${id}`, { method: 'DELETE' }),
};
