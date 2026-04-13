import api from '../lib/api';

export const tagsService = {
  getTags: () =>
    api.get('/tags'),

  createTag: (body: { name: string; name_vi: string; category: string }) =>
    api.post('/admin/tags', body),

  updateTag: (id: string, body: { name?: string; name_vi?: string; category?: string }) =>
    api.patch(`/admin/tags/${id}`, body),

  deleteTag: (id: string) =>
    api.delete(`/admin/tags/${id}`),
};
