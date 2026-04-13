import api from '../lib/api';

export const adminService = {
  getStats: () =>
    api.get('/admin/stats'),

  getUsers: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),

  updateUserStatus: (id: string, status: 'ACTIVE' | 'BLOCKED') =>
    api.patch(`/admin/users/${id}/status`, { status }),
};
