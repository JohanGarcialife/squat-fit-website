'use client'

import { useAuthStore } from '@/stores/auth.store'

/**
 * Manejo global de sesión caducada en el panel del cliente.
 *
 * Todas las páginas del panel hacen fetch autenticado con el JWT del auth
 * store. El token puede seguir "presente y válido" en el navegador (sus claims
 * se decodifican en local) pero estar caducado o revocado en el servidor, que
 * responde 401. Antes cada página trataba ese 401 como "sin datos" y pintaba un
 * estado vacío engañoso: la tienda de "aún no tienes acceso" a alguien que ya
 * pagó, "0 días" en Alertas, etc.
 *
 * Ante un 401 este helper:
 *   1. limpia el token del auth store (logout), y
 *   2. redirige a /login?redirect=<ruta actual> para re-autenticar y volver.
 *
 * SOLO reacciona a 401. El 403 se reserva para accesos legítimos sin permiso
 * (p. ej. suscripción no activa); nunca debe forzar un logout.
 *
 * Devuelve `true` si era un 401 (y por tanto ya se ha gestionado la sesión):
 * el llamador debe cortar su flujo normal (return) al recibir `true`.
 *
 * @param {unknown} error       Error capturado (axios o fetch envuelto).
 * @param {string}  redirectPath Ruta a la que volver tras el re-login. Si se
 *                               omite, se usa la ruta actual del navegador.
 * @returns {boolean} true si se trató un 401.
 */
export function handleApiError(error, redirectPath) {
  if (error?.response?.status !== 401) return false

  try {
    useAuthStore.getState().logout()
  } catch (_) {
    /* el store podría no estar disponible en SSR: ignorar */
  }

  if (typeof window !== 'undefined') {
    const current =
      redirectPath || `${window.location.pathname}${window.location.search}`
    window.location.href = `/login?redirect=${encodeURIComponent(current)}`
  }

  return true
}
