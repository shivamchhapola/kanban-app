import { apiClient } from './apiClient';

export const subtasksApi = {
  toggleSubtask: (id) => apiClient(`/subtasks/${id}/toggle`, { method: 'PATCH' }),
};
