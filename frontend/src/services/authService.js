import api from './api';

export const authService = {
  signup: (data) => api.post('/v1/auth/signup', data),
  verifyOtp: (data) => api.post('/v1/auth/verify-otp', data),
  resendOtp: (data) => api.post('/v1/auth/resend-otp', data),
  login: (data) => api.post('/v1/auth/login', data),
  refresh: (data) => api.post('/v1/auth/refresh', data),
  forgotPassword: (data) => api.post('/v1/auth/forgot-password', data),
  resetPassword: (data) => api.post('/v1/auth/reset-password', data),
  getProfile: () => api.get('/v1/auth/me'),
  updateProfile: (data) => api.put('/v1/auth/me', data),
  addAddress: (data) => api.post('/v1/auth/addresses', data),
  deleteAddress: (id) => api.delete(`/v1/auth/addresses/${id}`),
};
