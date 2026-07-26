// Redirecciones 301 del dominio viejo al nuevo: squatfit.es -> squadfit.es
//
// El WordPress viejo servía 113 URLs (sitemap wp-sitemap.xml). Cuando squatfit.es
// deje de apuntar a IONOS y pase a Vercel, estas reglas mantienen vivos los enlaces
// que hay repartidos por bios de Instagram, descripciones de YouTube, emails y Google.
//
// Todas llevan condición de HOST (solo disparan en squatfit.es / www.squatfit.es).
// Es imprescindible: rutas como /contacto existen en AMBOS dominios y sin la
// condición squadfit.es entraría en un bucle de redirección infinito.
//
// El destino es absoluto (https://squadfit.es/...) porque cruzamos de dominio.

const NEW = 'https://squadfit.es';

// Pares [ruta vieja, ruta nueva]. El orden importa: Next.js aplica la primera que
// encaja, así que lo específico va antes que los comodines.
const MAP = [
  // --- Páginas legales -----------------------------------------------------
  ['/legal/:path*', '/politicas'],
  ['/consentimiento', '/politicas'],

  // --- Cursos (LearnPress) -------------------------------------------------
  ['/courses/:path*', '/cursos'],
  ['/mis-cursos', '/cursos'],
  ['/instructors-2', '/nosotros'],
  ['/instructor-2', '/nosotros'],
  ['/become_a_teacher-2', '/'],

  // --- Libro de cocina -----------------------------------------------------
  // Antes de los comodines de /producto y /categoria-producto.
  ['/libro-de-cocina', '/cocina'],
  ['/producto/copia-extra-libro-impreso', '/cocina'],
  ['/producto/cocina-squat-fit-impreso', '/cocina'],
  ['/producto/la-cocina-squad-fit-trimestral', '/cocina'],
  ['/producto/la-cocina-squad-fit-bundle', '/cocina'],
  ['/producto/la-cocina-squad-fit-permanente', '/cocina'],
  ['/producto/la-cocina-squad-fit-anual', '/cocina'],
  ['/categoria-producto/ebooks/libro-de-cocina', '/cocina'],

  // --- Tienda: el resto de productos y categorías --------------------------
  ['/producto/:path*', '/cursos'],
  ['/categoria-producto/:path*', '/cursos'],
  ['/tienda', '/cursos'],

  // --- Landings de cursos (páginas sueltas) --------------------------------
  ['/entrena-casa', '/cursos'],
  ['/fuerte-y-definido', '/cursos'],
  ['/fuerte-definido-ad1', '/cursos'],
  ['/nutricion-y-entrenamiento-en-la-mujer', '/cursos'],
  ['/perdida-de-grasa', '/cursos'],
  ['/ganar-masa-muscular', '/cursos'],

  // --- Blog ----------------------------------------------------------------
  // El sitio nuevo no tiene blog: los 26 posts y sus 4 categorías van al home.
  // El checkout vivía colgando de /blog, así que va antes del comodín.
  ['/blog/checkouts/:path*', '/cart'],
  ['/blog/:path*', '/'],

  // --- Carrito y cuenta ----------------------------------------------------
  ['/carrito', '/cart'],
  ['/finalizar-compra', '/cart'],
  ['/lp-checkout-2', '/cart'],
  ['/mi-cuenta', '/login'],
  ['/mi-perfil', '/profile'],

  // --- Quiénes somos -------------------------------------------------------
  ['/sobre-maria', '/nosotros'],
  ['/sobre-hamlet', '/nosotros'],
  ['/hamlet', '/nosotros'],

  // --- Contacto ------------------------------------------------------------
  ['/contacto', '/contacto'],
  ['/contacto-hamlet', '/contacto'],

  // --- Funnel "tu mejor versión" -------------------------------------------
  // Todas estas landings se consolidan en /programa, que es el nuevo embudo.
  ['/formulario', '/programa'],
  ['/mis-asesorias', '/programa'],
  ['/calorias', '/programa'],
  ['/calorias-h', '/programa'],
  ['/entrevista-deportiva', '/programa'],
  ['/entrevista-nutricional', '/programa'],
  ['/mejorar-alimentacion-sin-complicarte', '/programa'],
  ['/aprender-a-organizar-tu-dieta-y-entreno', '/programa'],
  ['/claridad-sobre-tu-caso', '/programa'],
  ['/ganar-musculo-con-alimentacion-facil', '/programa'],
  ['/perder-grasa-de-forma-sostenible', '/programa'],
  ['/ganar-musculo-con-estrategia-clara', '/programa'],
  ['/perder-grasa-con-estrategia-clara', '/programa'],
  ['/entrenar-y-comer-para-ganar-musculo', '/programa'],
  ['/entrenar-y-comer-para-perder-grasa', '/programa'],
  ['/mejorar-entreno-con-guia', '/programa'],
  ['/perder-grasa-con-guia-y-entreno', '/programa'],
  ['/mejorar-alimentacion-con-orientacion', '/programa'],
  ['/transformar-tu-cuerpo-con-sistema', '/programa'],
  ['/transformar-tu-cuerpo-con-guia', '/programa'],
  ['/producto-completo-para-tu-mejor-version', '/programa'],
  ['/evaluando-tu-progreso', '/programa'],
  ['/sorteo-programa-tu-mejor-version', '/programa'],

  // --- Pretty Links --------------------------------------------------------
  // Enlaces cortos que servía el plugin Pretty Links (307) desde WordPress.
  // Son los de más tráfico de todo el dominio; sin esto se pierden.
  ['/unete', '/programa'],   // ~6.883 clics/mes — bio de Instagram
  ['/form', '/programa'],    // ~2.169 clics/mes — descripciones de YouTube
  ['/sform', '/programa'],   // ~951 clics/mes — stories
  ['/eform', '/programa'],   // ~316 clics/mes — emails

  // --- Restos de WordPress -------------------------------------------------
  ['/en-construccion', '/'],
];

// Cada regla se duplica para el apex y para www. Se generan en vez de escribirse
// a mano para que no se despiste ninguna al añadir rutas nuevas.
const HOSTS = ['squatfit.es', 'www.squatfit.es'];

// statusCode 301 en vez de `permanent: true` (que emite 308). Google trata ambos
// igual, pero 301 es lo que entiende cualquier rastreador antiguo y lo que espera
// el "Cambio de dirección" de Search Console en una migración de dominio.
const legacyRedirects = HOSTS.flatMap((host) =>
  MAP.map(([source, target]) => ({
    source,
    has: [{ type: 'host', value: host }],
    destination: `${NEW}${target}`,
    statusCode: 301,
  })),
);

// Cajón de sastre: cualquier otra URL de squatfit.es que no esté mapeada arriba
// (posts antiguos borrados, parámetros raros, rutas de plugins) acaba en el home
// del dominio nuevo en lugar de en un 404. Va al final para no pisar nada.
const legacyCatchAll = HOSTS.map((host) => ({
  source: '/:path*',
  has: [{ type: 'host', value: host }],
  destination: `${NEW}/`,
  statusCode: 301,
}));

export default [...legacyRedirects, ...legacyCatchAll];
