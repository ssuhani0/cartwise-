import api from './api';

export const deliveryService = {
  getAssignedOrders: () => api.get('/v1/delivery/assigned-orders'),
  updateOrderStatus: (orderId, status) => api.put(`/v1/delivery/order/${orderId}/status`, null, { params: { status } }),
  verifyOtp: (orderId, otp) => api.post(`/v1/delivery/order/${orderId}/verify-otp`, null, { params: { otp } }),
  updateAvailability: (isAvailable) => api.put('/v1/delivery/availability', null, { params: { isAvailable } }),
};
