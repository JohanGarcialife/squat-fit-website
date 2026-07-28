// /r/<slug> — redirecciones cortas gestionadas desde el back office (13.7).
//
// CÓMO CONTESTA EL BACKEND (aquí estaba el fallo):
// GET {API}/api/v1/redirects/{slug} NO devuelve JSON. Suma el hit y responde con
// una redirección HTTP de verdad, `res.redirect(301, target)`, o con el 404 de
// Nest si el slug no existe o está inactivo. Este proxy llamaba a `fetch` sin
// tocar `redirect`, y el valor por omisión en Node es 'follow': fetch se comía
// el 301, iba a buscar el destino por su cuenta y nos entregaba el HTML de la
// página final. `res.json()` reventaba, caía al catch y quien pulsaba el enlace
// veía «Este enlace no existe (aún)». Ningún enlace corto redirigía nunca.
//
// El arreglo es `redirect: 'manual'` y leer la cabecera `Location`. El 301 del
// backend se queda como está: es una redirección real y cuenta el clic.
//
// ¿HACE FALTA ESTE PROXY? Sí. Un `rewrite` en next.config al backend sería más
// corto, pero perderíamos las cinco cosas que justifican el fichero:
//   1. la página 404 con nuestra marca (si no, quien pulsa un anuncio se come el
//      JSON de error de Nest);
//   2. una respuesta honesta cuando el backend está caído o lento, en vez de
//      dejar la pestaña colgada o mentir con un 404;
//   3. bajar el 301 del backend a 302 (ver abajo: es lo que mantiene vivo el
//      contador de clics y permite editar el destino);
//   4. el corta-bucles, para que un destino que apunte a otro /r/... no monte
//      una cadena de redirecciones;
//   5. arrastrar los parámetros de campaña (gclid, fbclid, utm_*) del enlace
//      corto al destino, que es de lo que vive la atribución de los anuncios.
//
// POR QUÉ 302 Y NO 301, AUNQUE EL BACKEND DIGA 301:
// El 301 del backend es correcto en su sitio: es una llamada servidor-a-servidor
// que ningún navegador cachea. Pero lo que sale de AQUÍ va al navegador de una
// persona, y un 301 se queda pegado en su caché indefinidamente. Eso rompería
// justo lo que hace útil a esta función:
//   · el back office permite cambiar el destino de un slug y desactivarlo; con un
//     301 cacheado, ni el cambio ni la desactivación llegan a quien ya pulsó una
//     vez, y no hay forma de arreglarlo desde el servidor;
//   · el backend cuenta los hits (`resolveAndCount`); con un 301 cacheado el
//     segundo clic no vuelve a pasar por nosotros y el contador se congela.
// Son enlaces de marketing, no una mudanza de dominio: 302 + `no-store`, el
// mismo criterio que ya se tomó en form-links.mjs con el 307. El traspaso de SEO
// squatfit.es→squadfit.es no depende de esto: lo hacen los redirects de
// next.config, que sí son permanentes a propósito.

// Dependemos de las semánticas de fetch de Node (`redirect: 'manual'` devolviendo
// la respuesta real con su Location, y `AbortSignal.timeout`). Comprobado en seco
// contra un backend de mentira; se deja explícito para que nadie lo lleve a edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REDIRECTS_API_READY = true; // encendido 20-jul-2026: /api/v1/redirects/:slug vivo en prod (lote 4)

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// Si el backend no contesta en este plazo, mejor enseñar una página que dejar la
// pestaña girando: estos enlaces se pulsan desde el móvil y con prisa. 4 s es de
// sobra para un endpoint que hace un UPDATE y devuelve un 301.
const TIMEOUT_MS = 4000;

// Hosts nuestros, para el corta-bucles. OJO: no se puede bloquear cualquier
// destino cuyo camino empiece por /r/ sin mirar el host, porque hay destinos
// legítimos así (reddit.com/r/fitness, por ejemplo).
const HOSTS_PROPIOS = new Set([
  'squatfit.es',
  'www.squatfit.es',
  'squadfit.es',
  'www.squadfit.es',
]);

// Nada de /r/ se cachea: el destino de un slug se edita desde el back office y
// tiene que cambiar en el acto, y cada clic debe llegar al backend para sumar al
// contador. Sin esto, un 302 sin Cache-Control puede quedarse cacheado por
// heurística en intermediarios y el enlace cambiado se queda pegado.
const SIN_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
};

// Envoltorio de las páginas de aviso (este route handler no puede usar JSX).
function pagina({ status, emoji, titulo, cuerpo, headers = {} }) {
  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${titulo} · Squad Fit</title>
  <style>
    body { margin: 0; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #F8F9FC;
           min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border-radius: 28px; box-shadow: 0 10px 40px rgba(54,60,152,.08);
            padding: 48px 40px; max-width: 420px; margin: 24px; text-align: center; }
    .emoji { font-size: 56px; margin-bottom: 12px; }
    h1 { color: #363C98; font-size: 26px; margin: 0 0 12px; }
    p { color: #64748B; line-height: 1.6; margin: 0 0 28px; }
    code { background: #F1F2FC; color: #363C98; border-radius: 8px; padding: 2px 8px; font-size: 14px; }
    a { display: inline-block; background: #FF690B; color: #fff; text-decoration: none; font-weight: 700;
        padding: 14px 32px; border-radius: 16px; }
    a:hover { background: #e05b08; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <h1>${titulo}</h1>
    <p>${cuerpo}</p>
    <a href="/">Ir a squatfit.es</a>
  </div>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...SIN_CACHE, ...headers },
  });
}

// Un slug con `<` en la URL no debe colarse tal cual en el HTML de la página.
function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** El slug no existe, está inactivo o viene mal escrito. Un 404 aquí es correcto. */
function noExiste(slug) {
  return pagina({
    status: 404,
    emoji: '🔗',
    titulo: 'Este enlace no existe (aún)',
    cuerpo: `No encontramos el enlace corto <code>/r/${escapar(slug)}</code>. Puede que esté mal
       escrito o que ya no esté activo.`,
  });
}

/**
 * El enlace puede existir perfectamente, pero no hemos podido resolverlo: el
 * backend está caído, lento o contestando algo que no esperábamos. NO se
 * responde 404 a propósito: sería engañar al usuario y decirle a Google que el
 * enlace ya no está. 503 + Retry-After es lo honesto y no lo desindexa.
 */
function noDisponible() {
  return pagina({
    status: 503,
    emoji: '⏳',
    titulo: 'No podemos abrir este enlace ahora',
    cuerpo: `El enlace existe, pero nuestro servidor no responde en este momento.
       Vuelve a intentarlo en unos segundos.`,
    headers: { 'Retry-After': '30' },
  });
}

/** El destino guardado en el back office no vale: no parsea, o encadena otro /r/. */
function malConfigurado() {
  return pagina({
    status: 500,
    emoji: '🛠️',
    titulo: 'Este enlace está mal configurado',
    cuerpo: `El enlace existe, pero su destino no es válido. Ya estamos avisados;
       si tienes prisa, escríbenos.`,
  });
}

export async function GET(request, { params }) {
  const { slug } = await params;
  const clean = String(slug || '').trim();

  if (!REDIRECTS_API_READY || !clean) return noExiste(clean || '');

  let res;
  try {
    res = await fetch(`${API}/api/v1/redirects/${encodeURIComponent(clean)}`, {
      cache: 'no-store',
      // LA CLAVE DEL ARREGLO: sin esto Node sigue el 301 del backend, se trae el
      // HTML del destino y nos deja sin la cabecera Location, que es lo único
      // que queríamos de la llamada.
      redirect: 'manual',
      // Ni un backend caído ni uno lento pueden dejar la pestaña colgada.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // Timeout, DNS, conexión rechazada… el enlace no tiene culpa: 503, no 404.
    console.error(`[/r/${clean}] backend inalcanzable:`, err?.name || err);
    return noDisponible();
  }

  // El 301 de Express trae un cuerpecillo HTML que no vamos a leer. Se cierra a
  // mano para no dejar sockets colgando en el pool de undici.
  res.body?.cancel?.().catch(() => {});

  // El 404 de Nest es el único 4xx esperado: slug inexistente o inactivo.
  if (res.status === 404) return noExiste(clean);

  const location = res.headers.get('location');
  const esRedireccion = res.status >= 300 && res.status <= 399;

  if (!esRedireccion || !location) {
    // Ni 3xx ni 404: el backend está roto o le han cambiado el contrato. No se
    // contesta 404 porque lo más probable es que el enlace sí exista.
    console.error(`[/r/${clean}] respuesta inesperada del backend: ${res.status}`);
    return noDisponible();
  }

  // `location` puede venir relativo (el script de importación mete filas sin
  // pasar por el DTO, que sí exige URL absoluta), así que se resuelve contra
  // nuestra propia URL. De paso esto valida el destino y normaliza los acentos a
  // percent-encoding sin volver a codificar lo que ya venía codificado.
  const aqui = new URL(request.url);
  let destino;
  try {
    destino = new URL(location.trim(), aqui);
  } catch {
    console.error(`[/r/${clean}] destino no parseable: ${location}`);
    return malConfigurado();
  }

  // Solo http(s): cierra la puerta a un `javascript:` o `data:` guardado a mano.
  if (destino.protocol !== 'http:' && destino.protocol !== 'https:') {
    console.error(`[/r/${clean}] esquema no permitido: ${destino.protocol}`);
    return malConfigurado();
  }

  // CORTA-BUCLES: si el destino vuelve a un /r/... nuestro, encadenaríamos
  // redirecciones, y si se apunta a sí mismo, hasta que el navegador se rinda.
  // Se corta en el primer salto en lugar de seguir la cadena: ningún enlace
  // legítimo del back office necesita apuntar a otro enlace corto.
  const esNuestro = destino.host === aqui.host || HOSTS_PROPIOS.has(destino.hostname);
  const apuntaAEnlaceCorto = destino.pathname === '/r' || destino.pathname.startsWith('/r/');
  if (esNuestro && apuntaAEnlaceCorto) {
    console.error(`[/r/${clean}] bucle: el destino apunta a ${destino.pathname}`);
    return malConfigurado();
  }

  // Atribución: los parámetros que traiga el enlace corto (gclid y fbclid, que
  // añaden Google Ads y Meta al vuelo, y cualquier utm_*) se pasan al destino.
  // Antes se perdían y las conversiones de los anuncios quedaban sin atribuir.
  // Lo que ya venga en el destino manda: es lo que se configuró a mano.
  const extra = [];
  for (const [clave, valor] of aqui.searchParams) {
    if (!destino.searchParams.has(clave)) {
      extra.push(`${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`);
    }
  }

  // Se pegan a mano en vez de con `destino.searchParams.append`, que reescribe
  // toda la query del destino en formato formulario y convertiría sus %20 en «+».
  // El destino se respeta byte a byte: puede llevar una firma o un parámetro de
  // un tercero al que no le siente bien que le cambiemos la codificación.
  let urlFinal = destino.href;
  if (extra.length) {
    const sinHash = urlFinal.slice(0, urlFinal.length - destino.hash.length);
    urlFinal = `${sinHash}${destino.search ? '&' : '?'}${extra.join('&')}${destino.hash}`;
  }

  // 302 en vez de 301, y sin caché: ver la explicación larga de arriba.
  return new Response(null, {
    status: 302,
    headers: { Location: urlFinal, ...SIN_CACHE },
  });
}
