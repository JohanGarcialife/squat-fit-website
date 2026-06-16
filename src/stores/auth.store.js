
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
       * Primero llama a /book/by-user (acceso específico).
       * Si devuelve vacío, llama a /book/all (suscripción digital).
       * Si alguno devuelve libros → isSubscribed = true.
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

          // Paso 2: fallback a /book/all (suscripción digital activa)
          const allRes = await fetch(`${API_BASE}/api/v1/book/all`, { headers });
          if (allRes.ok) {
            const allData = await allRes.json();
            set({ isSubscribed: Array.isArray(allData) && allData.length > 0 });
          } else {
            set({ isSubscribed: false });
          }
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
