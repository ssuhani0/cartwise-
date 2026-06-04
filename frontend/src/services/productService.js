import api from './api';

export const productService = {
  getProducts: (params) => api.get('/v1/products', { params }),
  getProductById: (id) => api.get(`/v1/products/${id}`),
  getProductsByCategory: (category, params) => api.get(`/v1/products/category/${category}`, { params }),
};
