
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuth: false,

      setToken: (token) => {
        try {
          const decoded = jwtDecode(token);
          set({ token, user: decoded, isAuth: true });
        } catch (error) {
          console.error("Invalid token:", error);
          get().logout();
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuth: false });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
