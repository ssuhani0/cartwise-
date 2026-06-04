import api from './api';

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/v1/payments/create-order', data),
  verifyPayment: (data) => api.post('/v1/payments/verify', data),
};
