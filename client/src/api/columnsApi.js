import { apiClient } from './apiClient';

export const columnsApi = {
  updateColumn: (id, data) => apiClient(`/columns/${id}`, { body: data, method: 'PUT' }),
  deleteColumn: (id) => apiClient(`/columns/${id}`, { method: 'DELETE' }),
};
