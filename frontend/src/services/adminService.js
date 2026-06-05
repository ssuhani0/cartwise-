import api from './api';

export const adminService = {
  getUsers: (params) => api.get('/v1/admin/users', { params }),
  getShops: (params) => api.get('/v1/admin/shops', { params }),
  getProducts: (params) => api.get('/v1/admin/products', { params }),
  getDailyOrders: (params) => api.get('/v1/admin/analytics/daily-orders', { params }),
  getRevenue: (params) => api.get('/v1/admin/analytics/revenue', { params }),
  getPopularItems: (params) => api.get('/v1/admin/analytics/popular-items', { params }),
  assignAgent: (agentId, data) => api.put(`/v1/admin/delivery-agents/${agentId}/assign`, data),
};
