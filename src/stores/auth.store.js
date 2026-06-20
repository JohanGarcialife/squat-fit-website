
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

          // Paso 1: /book/by-user
          const byUserRes = await fetch(`${API_BASE}/api/v1/book/by-user`, { headers });
          if (byUserRes.ok) {
            const byUserData = await byUserRes.json();
            if (Array.isArray(byUserData) && byUserData.length > 0) {
              set({ isSubscribed: true });
              return;
            }
          }

          // Paso 2: /course/by-user
          const courseByUserRes = await fetch(`${API_BASE}/api/v1/course/by-user`, { headers });
          if (courseByUserRes.ok) {
            const courseByUserData = await courseByUserRes.json();
            if (Array.isArray(courseByUserData) && courseByUserData.length > 0) {
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
