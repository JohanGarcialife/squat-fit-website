'use client';

// Aceptación de la Política de Privacidad UNA sola vez por dispositivo/cuenta.
// El backend hoy no expone un flag de RGPD en /user/info, así que persistimos
// la aceptación en localStorage con fecha (petición de Hamlet: «ya la acepté;
// no debería salirme otra vez»). El PRIMER guardado sí exige la casilla.

const PRIVACY_KEY = 'sqf-privacy-accepted';

export const hasAcceptedPrivacy = () => {
  try {
    return !!localStorage.getItem(PRIVACY_KEY);
  } catch {
    return false; // Sin localStorage (Safari privado): se pedirá la casilla.
  }
};

export const markPrivacyAccepted = () => {
  try {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
  } catch {
    // Si no se puede persistir, simplemente volverá a pedirse la próxima vez.
  }
};
