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
  // /formulario NO es una landing: es la URL del formulario que iba escrita en
  // los correos (…/formulario/?utmsource=Emails). Quien la abre viene a
  // rellenarlo, no a leer la oferta, así que entra directo al formulario nuevo
  // en vez de a /programa. 307 y no 301 por lo mismo que los enlaces cortos de
  // form-links.mjs: es un enlace de marketing y su destino se moverá; un 301 se
  // queda cacheado en el navegador de la gente y ya no hay forma de recolocarlo.
  //
  // El destino NO lleva ni un utm_*, a propósito: los correos ya traen el suyo y
  // Next encadena la query entrante ANTES que la del destino, así que un
  // utm_source nuestro aquí saldría duplicado en la URL final. Solo se añade
  // `via`, que es la clave de atribución fina y no choca con ningún utm: sin
  // ella, un clic desde un correo viejo sin UTM llegaría sin origen ninguno.
  ['/formulario', '/empieza-tu-cambio?via=formulario', { statusCode: 307 }],
  // Todas estas landings sí se consolidan en /programa, que es el nuevo embudo.
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
  // El sorteo va al FORMULARIO con su propio origen (ver form-links.mjs), no a
  // la landing: quien llega por aquí venía a apuntarse a algo.
  ['/sorteo-programa-tu-mejor-version', '/sorteo-programa-tu-mejor-version'],

  // --- Pretty Links --------------------------------------------------------
  // Enlaces cortos que servía el plugin Pretty Links (307) desde WordPress.
  // Son los de más tráfico de todo el dominio; sin esto se pierden.
  // ENLACES DE AFILIACIÓN. No van a nuestra web: van a programas de terceros
  // que pagan comisión. El catch-all de más abajo se los tragaría y perderíamos
  // 252 clics/mes de ingresos. Se mantienen apuntando a su destino externo tal
  // cual estaban en Pretty Links.
  ['/fitgeneration', 'https://go.fitgeneration.es/tsd/?utm_source=embajador&utm_medium=MariaCasas&utm_campaign=YoutubeMayo'],
  ['/fitgen603b', 'https://go.fitgeneration.es/tsd/?utm_source=embajador&utm_medium=MariaCasas&el=embajador-MariaCasas&utm_campaign=ytbjunio'],
  ['/cecotec', 'https://clk.tradedoubler.com/click?p=283907&a=3485811&url=https%3A%2F%2Fcecotec.es%2Fes%2Ffreidoras-sin-aceite%2Fcecofry-duolevel-10000-duosize-window'],

  // CORRECCIÓN 27-jul: estos NO eran enlaces a la landing, eran los Pretty
  // Links del formulario, uno por origen. Van al mismo slug en el dominio
  // nuevo, que ya redirige al formulario con su atribución (ver form-links.mjs).
  // Si fuesen a /programa se perdería de dónde viene la persona.
  ['/unete', '/unete'],      // ~6.883 clics/mes — bio de Instagram (María)
  ['/acceder', '/acceder'],  // bio de Instagram (Hamlet)
  ['/form', '/form'],        // ~2.169 clics/mes — YouTube (María)
  ['/forms', '/forms'],      // YouTube (Hamlet)
  ['/sform', '/sform'],      // ~951 clics/mes — stories (María)
  ['/hform', '/hform'],      // stories (Hamlet)
  ['/aplica', '/aplica'],    // TikTok (María)
  ['/aplicar', '/aplicar'],  // TikTok (Hamlet)
  ['/eform', '/eform'],      // ~316 clics/mes — emails
  ['/guia', '/guia'],        // guías

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
  MAP.map(([source, target, opts]) => ({
    source,
    has: [{ type: 'host', value: host }],
    // Los enlaces de afiliación ya traen su destino absoluto: anteponerles
    // nuestro dominio los rompería.
    destination: /^https?:\/\//.test(target) ? target : `${NEW}${target}`,
    // 301 salvo que la regla pida otra cosa (tercer elemento del par). Lo pide
    // /formulario, que es un enlace de marketing y no una URL de SEO.
    statusCode: opts?.statusCode ?? 301,
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
