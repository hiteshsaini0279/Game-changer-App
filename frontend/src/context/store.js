import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.user, token: data.token, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return true
        } catch (err) {
          set({ error: err.response?.data?.message || 'Login failed', isLoading: false })
          return false
        }
      },

      register: async (name, email, password, startDate) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', { name, email, password, startDate })
          set({ user: data.user, token: data.token, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return true
        } catch (err) {
          set({ error: err.response?.data?.message || 'Registration failed', isLoading: false })
          return false
        }
      },

      logout: () => {
        set({ user: null, token: null })
        delete api.defaults.headers.common['Authorization']
      },

      updateUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: '180days-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      }
    }
  )
)

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => {
        const next = s.theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        return { theme: next }
      }),
      initTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      }
    }),
    { name: '180days-theme' }
  )
)
