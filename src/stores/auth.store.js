
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
          // Verificar si tiene suscripción activa en el token decoded
          const isSubscribed = !!(
            decoded.isSubscribed ||
            decoded.is_subscribed ||
            decoded.subscribed ||
            decoded.role === 'admin'
          );
          set({ token, user: decoded, isAuth: true, isSubscribed });
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
       * Renueva el token JWT para obtener el estado más reciente.
       */
      refreshSubscriptionStatus: async (token) => {
        const tkn = token || get().token;
        if (!tkn) return;
        try {
          const headers = { Authorization: `Bearer ${tkn}` };

          // Renovar token para obtener el JWT actualizado con el estado de suscripción
          const res = await fetch(`${API_BASE}/api/v1/user/renew-token`, { headers });
          if (res.ok) {
            const data = await res.json();
            const newToken = data.token;
            if (newToken) {
              get().setToken(newToken);
              return;
            }
          }

          set({ isSubscribed: false });
        } catch (err) {
          console.error('Error verificando suscripción por renew-token:', err);
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
