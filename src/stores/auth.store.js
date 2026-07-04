
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuth: false,
      isSubscribed: false,
      subscriptionType: null, // 'monthly' | 'annual' | 'permanent' | null

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
          // Tipo de suscripción de biblioteca digital (monthly/annual/permanent)
          const subscriptionType =
            decoded.subscription_type ||
            decoded.subscriptionType ||
            decoded.digital_subscription_type ||
            null;
          set({ token, user: decoded, isAuth: true, isSubscribed, subscriptionType });
        } catch (error) {
          console.error("Invalid token:", error);
          get().logout();
        }
      },

      /** Actualiza manualmente el estado de suscripción */
      setSubscribed: (value) => {
        set({ isSubscribed: !!value });
      },

      /** Actualiza manualmente el tipo de suscripción de biblioteca digital */
      setSubscriptionType: (type) => {
        set({ subscriptionType: type || null });
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
              // Intentar también obtener subscription type via user/info
              try {
                const infoRes = await fetch(`${API_BASE}/api/v1/user/info`, {
                  headers: { Authorization: `Bearer ${newToken}` }
                });
                if (infoRes.ok) {
                  const info = await infoRes.json();
                  const subType = info.subscription?.type || info.suscription_type || info.subscription_type || null;
                  if (subType) set({ subscriptionType: subType });
                }
              } catch (_) { /* silenciar error de info */ }
              return;
            }
          }

          set({ isSubscribed: false, subscriptionType: null });
        } catch (err) {
          console.error('Error verificando suscripción por renew-token:', err);
          set({ isSubscribed: false });
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuth: false, isSubscribed: false, subscriptionType: null });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
