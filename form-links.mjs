// Enlaces cortos al formulario de prellamada, uno por origen.
//
// Sustituyen a los Pretty Links del WordPress viejo (squatfit.es/unete, /form…).
// Todos llevan a la MISMA pantalla, `/empieza-tu-cambio`; lo que cambia es de
// dónde viene la persona, que viaja en la URL y acaba guardado con el lead.
//
// Por qué siguen existiendo enlaces distintos en vez de uno solo con UTM a mano:
// son los que van escritos en la bio de Instagram, en las descripciones de
// YouTube y en los correos. Tienen que ser cortos y decibles en voz alta.
//
// La redirección es TEMPORAL (307), no permanente, a propósito: son enlaces de
// marketing y en algún momento se querrá cambiar a dónde apuntan. Un 301 se
// queda cacheado en el navegador de la gente y ya no hay forma de moverlo.

const DESTINO = '/empieza-tu-cambio';

// slug → de dónde viene. `via` es el código corto que se guarda con el lead.
export const FORM_LINKS = [
  // YouTube (descripciones de los vídeos)
  { slug: 'form',    via: 'yt-maria',      source: 'youtube',   medium: 'descripcion', content: 'maria'  },
  { slug: 'forms',   via: 'yt-hamlet',     source: 'youtube',   medium: 'descripcion', content: 'hamlet' },
  // Instagram — stories
  { slug: 'sform',   via: 'ig-story-maria',  source: 'instagram', medium: 'stories',   content: 'maria'  },
  { slug: 'hform',   via: 'ig-story-hamlet', source: 'instagram', medium: 'stories',   content: 'hamlet' },
  // Instagram — enlace de la bio (el de más tráfico con diferencia)
  { slug: 'unete',   via: 'ig-bio-maria',  source: 'instagram', medium: 'bio',         content: 'maria'  },
  { slug: 'acceder', via: 'ig-bio-hamlet', source: 'instagram', medium: 'bio',         content: 'hamlet' },
  // TikTok
  { slug: 'aplica',  via: 'tt-maria',      source: 'tiktok',    medium: 'bio',         content: 'maria'  },
  { slug: 'aplicar', via: 'tt-hamlet',     source: 'tiktok',    medium: 'bio',         content: 'hamlet' },
  // De los dos
  { slug: 'eform',   via: 'email',         source: 'email',     medium: 'newsletter',  content: 'ambos'  },
  { slug: 'guia',    via: 'guia',          source: 'guia',      medium: 'lead-magnet', content: 'ambos'  },
  // Landing del sorteo del WordPress viejo. No es un enlace corto de bio: es una
  // URL que la gente ya tiene guardada y que se siguió compartiendo. En vez de
  // dejarla morir en la home, entra al formulario con su propio origen, así se
  // puede medir cuánta cola trae el sorteo después de cerrarse.
  { slug: 'sorteo-programa-tu-mejor-version', via: 'sorteo', source: 'sorteo', medium: 'landing', content: 'ambos' },
];

/** La URL completa a la que lleva un enlace corto, con su atribución. */
export function destinoDe({ via, source, medium, content }) {
  const p = new URLSearchParams({
    via,
    utm_source: source,
    utm_medium: medium,
    utm_campaign: 'prellamada',
    utm_content: content,
  });
  return `${DESTINO}?${p.toString()}`;
}

/** Las reglas para `redirects()` de Next. */
export const formLinkRedirects = FORM_LINKS.map((l) => ({
  source: `/${l.slug}`,
  destination: destinoDe(l),
  permanent: false,
}));

export default formLinkRedirects;
