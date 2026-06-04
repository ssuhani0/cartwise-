import api from './api';

export const ocrService = {
  uploadImage: (formData) =>
    api.post('/v1/ocr/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  extractItems: (formData) =>
    api.post('/v1/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addToCart: (items) => api.post('/v1/ocr/add-to-cart', { items }),
};
