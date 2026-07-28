'use client';

// Gestor de consentimiento de cookies (RGPD) — fuente de verdad única para
// CookieBanner y para cualquier script de terceros que necesite saber si
// puede cargar (GoogleAnalytics, TrustpilotInvitations).
//
// Tres categorías:
//  - necessary: siempre true, no se pregunta (sesión, carrito, pago con Stripe).
//  - analytics: Google Analytics (GA4). Off por defecto.
//  - marketing: invitaciones de reseña de Trustpilot. Off por defecto.
//
// Se persiste en localStorage. Los componentes de terceros (client-side) lo
// leen al montar y se suscriben a CONSENT_EVENT para activarse al momento en
// cuanto el usuario acepta, sin necesitar recargar la página.

export const STORAGE_KEY = 'sqf-cookie-consent';

// Se dispara en `window` cada vez que se guarda una elección nueva.
export const CONSENT_EVENT = 'sqf-cookie-consent-change';

// Se dispara en `window` para pedir que el banner se reabra en modo
// preferencias (enlace del footer / política de cookies).
export const OPEN_PREFS_EVENT = 'sqf-cookie-open-prefs';

// Lee el consentimiento guardado. Devuelve null si aún no se ha elegido.
export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ¿Ya ha elegido el visitante (aunque sea rechazar)?
export function hasChosenConsent() {
  return getCookieConsent() !== null;
}

// ¿Puede cargarse Google Analytics?
export function analyticsAllowed() {
  return getCookieConsent()?.analytics === true;
}

// ¿Puede cargarse el snippet de invitaciones de Trustpilot?
export function marketingAllowed() {
  return getCookieConsent()?.marketing === true;
}

// Guarda la elección y avisa a quien esté escuchando (GoogleAnalytics,
// TrustpilotInvitations, otras pestañas del propio banner) para que se
// activen/desactiven sin recargar.
export function saveCookieConsent({ analytics = false, marketing = false, choice = 'custom' } = {}) {
  const value = {
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing,
    choice,
    date: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Sin localStorage (modo privado antiguo): la elección no persiste entre
    // visitas, pero al menos rige esta sesión vía el evento.
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  } catch {
    // entorno sin CustomEvent (no debería pasar en navegadores soportados)
  }
  return value;
}

// Pide reabrir el banner en modo preferencias (footer, /politicas?tab=cookies).
export function openCookiePreferences() {
  try {
    window.dispatchEvent(new Event(OPEN_PREFS_EVENT));
  } catch {
    // no-op
  }
}
