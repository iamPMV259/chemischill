import api from '../lib/api';

export const teachersService = {
  getTeachers: () =>
    api.get('/teachers'),

  getTeacher: (id: string) =>
    api.get(`/teachers/${id}`),

  contactTeacher: (id: string, body: { sender_name: string; sender_email: string; message: string }) =>
    api.post(`/teachers/${id}/contact`, body),
};
