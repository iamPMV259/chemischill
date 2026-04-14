import api from '../lib/api';

export const categoriesService = {
  getCategories: (params?: { parent_id?: string }) =>
    api.get('/categories', { params }),

  createCategory: (body: { name_vi: string; name_en: string; slug?: string; parent_id?: string }) =>
    api.post('/admin/categories', body),

  updateCategory: (id: string, body: { name_vi?: string; name_en?: string; slug?: string; parent_id?: string }) =>
    api.patch(`/admin/categories/${id}`, body),

  deleteCategory: (id: string) =>
    api.delete(`/admin/categories/${id}`),
};
