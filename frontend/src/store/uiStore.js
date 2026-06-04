import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: false,
      location: null,
      loading: false,
      searchQuery: '',

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
          return { theme: newTheme };
        }),

      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
        set({ theme });
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLocation: (location) => set({ location }),
      setLoading: (loading) => set({ loading }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'cartwise-ui',
      partialize: (state) => ({
        theme: state.theme,
        location: state.location,
      }),
    },
  ),
);
