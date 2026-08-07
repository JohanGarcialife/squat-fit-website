// Sitemap del lanzamiento: rutas públicas indexables de squadfit.es.
// El panel del cliente, el carrito y el onboarding NO se listan (van tras login
// o no aportan a buscadores). robots.js excluye esas zonas explícitamente.
const BASE = 'https://squadfit.es';

export default function sitemap() {
  // Fuera `/login` y `/register` (3-ago): el comentario de arriba ya decía que
  // no se listan las páginas de acceso, y estaban listadas igualmente. Nadie
  // llega a una tienda buscando su formulario de acceso, así que solo se
  // llevaban rastreo de las páginas que sí venden. Medido ese día en Search
  // Console: de las 9 enviadas, Google conocía 4 y no había ninguna indexada,
  // conque más vale que las que queden sean todas comerciales.
  const routes = [
    '',
    '/programa',
    '/cocina',
    '/cursos',
    '/conocenos',
    '/contacto',
    '/politicas',
  ];

  // SIN `lastModified`. Antes era `new Date()` en cada petición, o sea que el
  // sitemap juraba que las siete páginas se habían modificado hoy… todos los
  // días. Eso no es un dato, es ruido: si todo cambia siempre, el campo deja de
  // significar nada. Mejor no decir nada que decir algo falso.
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/programa' ? 0.9 : 0.7,
  }));
}
