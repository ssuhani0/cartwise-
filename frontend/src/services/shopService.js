import api from './api';

export const shopService = {
  getNearbyShops: (params) => api.get('/v1/shops/nearby', { params }),
  getShopById: (id) => api.get(`/v1/shops/${id}`),
  getShopProducts: (id, params) => api.get(`/v1/shops/${id}/products`, { params }),
  getAllShops: (params) => api.get('/v1/shops', { params }),
};
