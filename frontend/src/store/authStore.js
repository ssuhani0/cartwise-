import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      login: (user, tokens) => {
        set({ user, tokens, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      setTokens: (tokens) => {
        set({ tokens });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        set({ user: { ...currentUser, ...userData } });
      },

      fetchProfile: async () => {
        try {
          const { authService } = await import('@/services/authService');
          const response = await authService.getProfile();
          set({ user: response.data, isAuthenticated: true });
          return response.data;
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          if (error.response?.status === 401) {
            get().logout();
          }
          throw error;
        }
      },
    }),
    {
      name: 'cartwise-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
