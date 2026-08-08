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
  // `/empieza-tu-cambio` faltaba, y no es una página menor: medido en GA4 del
  // 1 al 7 de agosto, es la SEGUNDA página por usuarios de todo el sitio —68 de
  // 194, un 35 %— por detrás solo de la portada. Responde 200, no lleva
  // `noindex` y `robots.txt` no la bloquea; simplemente nunca se declaró.
  //
  // Se le da 0.8: por encima del resto de páginas de contenido y por debajo de
  // `/programa`, que es donde se vende el producto caro.
  const routes = [
    '',
    '/programa',
    '/empieza-tu-cambio',
    '/cocina',
    '/cursos',
    '/conocenos',
    '/contacto',
    '/politicas',
  ];

  const prioridad = (path) => {
    if (path === '') return 1;
    if (path === '/programa') return 0.9;
    if (path === '/empieza-tu-cambio') return 0.8;
    return 0.7;
  };

  // SIN `lastModified`. Antes era `new Date()` en cada petición, o sea que el
  // sitemap juraba que las siete páginas se habían modificado hoy… todos los
  // días. Eso no es un dato, es ruido: si todo cambia siempre, el campo deja de
  // significar nada. Mejor no decir nada que decir algo falso.
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: prioridad(path),
  }));
}
