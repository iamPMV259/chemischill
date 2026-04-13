import api from '../lib/api';

export const quizzesService = {
  getQuizzes: (params?: {
    search?: string;
    difficulty?: string;
    tag_ids?: string;
    has_reward?: boolean;
    page?: number;
    limit?: number;
  }) => api.get('/quizzes', { params }),

  getFeaturedQuizzes: () =>
    api.get('/quizzes/featured'),

  getQuiz: (id: string) =>
    api.get(`/quizzes/${id}`),

  getMySubmission: (id: string) =>
    api.get(`/quizzes/${id}/submissions/me`),

  submitQuiz: (id: string, body: {
    answers: Array<{ question_id: string; selected_option_id: string | null }>;
    time_taken_secs?: number;
  }) => api.post(`/quizzes/${id}/submit`, body),

  // Admin endpoints
  getAdminQuizzes: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/admin/quizzes', { params }),

  getAdminQuiz: (id: string) =>
    api.get(`/admin/quizzes/${id}`),

  createQuiz: (body: any) =>
    api.post('/admin/quizzes', body),

  updateQuiz: (id: string, body: any) =>
    api.patch(`/admin/quizzes/${id}`, body),

  publishQuiz: (id: string, isPublished: boolean) =>
    api.patch(`/admin/quizzes/${id}/publish`, { is_published: isPublished }),

  duplicateQuiz: (id: string) =>
    api.post(`/admin/quizzes/${id}/duplicate`),

  deleteQuiz: (id: string) =>
    api.delete(`/admin/quizzes/${id}`),
};
