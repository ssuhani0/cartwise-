import api from './api';

export const ocrService = {
  uploadImage: (formData) => api.post('/v1/ocr/upload', formData),
  extractItems: (formData) => api.post('/v1/ocr/extract', formData),
  addToCart: (items) => api.post('/v1/ocr/add-to-cart', { items }),
};
