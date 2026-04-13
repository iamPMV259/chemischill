import api from '../lib/api';

export const documentsService = {
  getDocuments: (params?: {
    search?: string;
    tag_ids?: string;
    category_id?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) => api.get('/documents', { params }),

  getFeaturedDocuments: () =>
    api.get('/documents/featured'),

  getDocument: (id: string) =>
    api.get(`/documents/${id}`),

  incrementView: (id: string) =>
    api.post(`/documents/${id}/view`),

  getDownloadUrl: (id: string) =>
    api.get(`/documents/${id}/download`),

  saveDocument: (id: string) =>
    api.post(`/documents/${id}/save`),

  unsaveDocument: (id: string) =>
    api.delete(`/documents/${id}/save`),

  // Admin endpoints
  getAdminDocuments: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/admin/documents', { params }),

  getAdminDocument: (id: string) =>
    api.get(`/admin/documents/${id}`),

  createDocument: (formData: FormData) =>
    api.post('/admin/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateDocument: (id: string, formData: FormData) =>
    api.patch(`/admin/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  toggleDownload: (id: string) =>
    api.patch(`/admin/documents/${id}/toggle-download`),

  deleteDocument: (id: string) =>
    api.delete(`/admin/documents/${id}`),
};
