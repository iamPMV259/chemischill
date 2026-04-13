import api from '../lib/api';

export const usersService = {
  getMe: () =>
    api.get('/users/me'),

  updateMe: (body: {
    full_name?: string | null;
    phone?: string | null;
    birth_year?: number | null;
    school?: string | null;
  }) => api.patch('/users/me', body),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getUser: (id: string) =>
    api.get(`/users/${id}`),

  getPublicActivity: (id: string, params?: { limit?: number }) =>
    api.get(`/users/${id}/activity`, { params }),

  getSavedDocuments: () =>
    api.get('/users/me/saved-documents'),

  getDownloadHistory: (params?: { limit?: number }) =>
    api.get('/users/me/download-history', { params }),

  getQuizHistory: (params?: { limit?: number }) =>
    api.get('/users/me/quiz-history', { params }),

  getMyQuestions: (params?: { include_unapproved?: boolean; limit?: number }) =>
    api.get('/users/me/questions', { params }),

  getLeaderboard: (params?: { period?: string; limit?: number }) =>
    api.get('/leaderboard', { params }),
};
