// Evita open redirects: el parámetro ?redirect= puede llegar manipulado con una
// URL absoluta («https://evil.com») o con «//evil.com» (que el navegador trata
// como esquema-relativo → otro dominio). Solo aceptamos rutas internas: deben
// empezar por «/» y NO por «//». Cualquier otra cosa cae al destino por defecto.
export function safeRedirectPath(value, fallback = '/') {
  if (typeof value !== 'string') return fallback;
  const path = value.trim();
  if (!path.startsWith('/')) return fallback; // absoluta o relativa rara
  if (path.startsWith('//') || path.startsWith('/\\')) return fallback; // //host o /\host
  return path;
}
