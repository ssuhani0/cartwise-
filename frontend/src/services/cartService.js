import api from './api';

export const cartService = {
  getCart: () => api.get('/v1/cart'),
  addToCart: (data) => api.post('/v1/cart/add', data),
  updateCartItem: (itemId, data) => api.put(`/v1/cart/item/${itemId}`, data),
  removeCartItem: (itemId) => api.delete(`/v1/cart/item/${itemId}`),
  clearCart: () => api.delete('/v1/cart/clear'),
  applyCoupon: (code) => api.post('/v1/cart/apply-coupon', { couponCode: code }),
};
