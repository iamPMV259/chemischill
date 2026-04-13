import api from '../lib/api';

export const communityService = {
  getQuestions: (params?: {
    search?: string;
    tag_ids?: string;
    page?: number;
    limit?: number;
  }) => api.get('/community/questions', { params }),

  getQuestion: (id: string) =>
    api.get(`/community/questions/${id}`),

  getAnswers: (questionId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/community/questions/${questionId}/answers`, { params }),

  createQuestion: (formData: FormData) =>
    api.post('/community/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  createAnswer: (questionId: string, formData: FormData) =>
    api.post(`/community/questions/${questionId}/answers`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadImage: (file: File, type: 'question' | 'answer' | 'avatar' = 'question') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  upvoteAnswer: (answerId: string) =>
    api.post(`/community/answers/${answerId}/upvote`),

  removeUpvote: (answerId: string) =>
    api.delete(`/community/answers/${answerId}/upvote`),

  // Admin endpoints
  getAdminQuestions: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/community/questions', { params }),

  approveQuestion: (id: string) =>
    api.patch(`/admin/community/questions/${id}/approve`),

  rejectQuestion: (id: string, adminNote: string) =>
    api.patch(`/admin/community/questions/${id}/reject`, { admin_note: adminNote }),

  requestRevision: (id: string, adminNote: string) =>
    api.patch(`/admin/community/questions/${id}/request-revision`, { admin_note: adminNote }),

  deleteAdminQuestion: (id: string) =>
    api.delete(`/admin/community/questions/${id}`),
};
