import api from './api';

export const orderService = {
  createOrder: (params) => api.post('/v1/orders/create', null, { params }),
  getOrders: (params) => api.get('/v1/orders', { params }),
  getOrderById: (id) => api.get(`/v1/orders/${id}`),
  cancelOrder: (id) => api.put(`/v1/orders/${id}/cancel`),
  repeatOrder: (id) => api.post(`/v1/orders/${id}/repeat`),
};
