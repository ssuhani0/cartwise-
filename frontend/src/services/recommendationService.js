import api from './api';

export const recommendationService = {
  getRecommendations: (params) => api.get('/v1/recommendations', { params }),
  getTrending: (params) => api.get('/v1/recommendations/trending', { params }),
  getBudgetOptimization: (params) => api.get('/v1/recommendations/budget-optimization', { params }),
  getRecipe: (recipeName) => api.post('/v1/recommendations/recipe', { recipe_name: recipeName }),
  getMonthlyPrediction: () => api.get('/v1/recommendations/monthly-prediction'),
};
