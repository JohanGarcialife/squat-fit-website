// Sitemap del lanzamiento (lunes): rutas públicas indexables de squadfit.es.
// El panel del cliente, el carrito y el onboarding NO se listan (van tras login
// o no aportan a buscadores). robots.js excluye esas zonas explícitamente.
const BASE = 'https://squadfit.es';

export default function sitemap() {
  const routes = [
    '',
    '/programa',
    '/cocina',
    '/cursos',
    '/nosotros',
    '/contacto',
    '/politicas',
    '/login',
    '/register',
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/programa' ? 0.9 : 0.7,
  }));
}
