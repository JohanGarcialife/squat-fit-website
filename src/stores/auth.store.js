
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

const API_BASE = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuth: false,
      isSubscribed: false,

      setToken: (token) => {
        try {
          const decoded = jwtDecode(token);
          set({ token, user: decoded, isAuth: true });
        } catch (error) {
          console.error("Invalid token:", error);
          get().logout();
        }
      },

      /** Actualiza manualmente el estado de suscripción */
      setSubscribed: (value) => {
        set({ isSubscribed: !!value });
      },

      /**
       * Verifica si el usuario tiene suscripción activa.
       * Valida /book/by-user y /course/by-user.
       * Si alguno devuelve elementos → isSubscribed = true.
       */
      refreshSubscriptionStatus: async (token) => {
        const tkn = token || get().token;
        if (!tkn) return;
        try {
          const headers = { Authorization: `Bearer ${tkn}` };

          // Paso 1: /book/all
          const bookRes = await fetch(`${API_BASE}/api/v1/book/all`, { headers });
          if (bookRes.ok) {
            const bookData = await bookRes.json();
            if (Array.isArray(bookData) && bookData.length > 0) {
              set({ isSubscribed: true });
              return;
            }
          }

          // Paso 2: /course/all
          const courseRes = await fetch(`${API_BASE}/api/v1/course/all`, { headers });
          if (courseRes.ok) {
            const courseData = await courseRes.json();
            if (Array.isArray(courseData) && courseData.length > 0) {
              set({ isSubscribed: true });
              return;
            }
          }

          set({ isSubscribed: false });
        } catch (err) {
          console.error('Error verificando suscripción:', err);
          set({ isSubscribed: false });
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuth: false, isSubscribed: false });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
