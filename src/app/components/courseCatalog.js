// Catálogo de cursos con tramos (15.1): agrupa los 3 productos de cada curso
// («Nombre (mensual)» / «(anual)» / «(permanente)») en una sola entrada con
// selector. Mensual = suscripción; anual y permanente = PAGO ÚNICO (anual da
// 12 meses de acceso vía access_months; permanente, acceso para siempre).
//
// DATOS: la fuente de verdad es la tabla `products` del backend (con
// billing_period y access_months). El catálogo público es el GET /api/v1/catalog
// de la Fase 9 (backend). Si el endpoint aún no está desplegado (404) o no
// responde, se usa el ESPEJO LOCAL con las mismas filas y precios reales que
// dejó el seed 15.1 en la BD de producción — la tienda nunca se queda en blanco.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

export const PRODUCTS_ENDPOINT = `${API_BASE}/api/v1/catalog`;

// Checkout de tramos (Fase 9): debe devolver una Stripe Checkout Session (url)
// o, en su defecto, un clientSecret de PaymentIntent. La ruta exacta la decide
// la Fase 9, que corre en paralelo: se prueban candidatas en orden y un 404 en
// todas significa «aún no desplegado» → el paso de pago mantiene el aviso
// honesto de «disponible muy pronto». Añadid aquí la ruta real si difiere.
export const TIER_CHECKOUT_ENDPOINTS = [
  `${API_BASE}/api/v1/catalog/checkout`,
  `${API_BASE}/api/v1/checkout/catalog`,
  `${API_BASE}/api/v1/checkout/create-checkout-session`,
  `${API_BASE}/api/v1/products/checkout`,
];
// Compat con items de carrito ya persistidos que guardan `endpoint`.
export const TIER_CHECKOUT_ENDPOINT = TIER_CHECKOUT_ENDPOINTS[0];

// Metadatos de cada tramo, con la copy validada (anual y permanente son pago
// único, no suscripción).
export const TIER_META = {
  mensual: {
    label: 'Mensual',
    priceSuffix: '€/mes',
    note: 'Suscripción · cancela cuando quieras',
  },
  anual: {
    label: 'Anual',
    priceSuffix: '€',
    note: 'Pago único · 12 meses de acceso',
  },
  permanente: {
    label: 'De por vida',
    priceSuffix: '€',
    note: 'Pago único · acceso para siempre',
  },
};

export const TIER_ORDER = ['mensual', 'anual', 'permanente'];

// Espejo del catálogo real 15.1 (área cursos) tal y como está en la tabla
// products de producción: mismos nombres (con sufijo) y mismos precios.
// Sin UUID porque no hay endpoint público que los dé (id: null).
const CURSOS_15_1 = [
  ['Pérdida de Grasa', 14.5, 107.99, 186],
  ['Ganar Músculo', 14.5, 107.99, 186],
  ['Fuerte y Definid@', 27.5, 187.99, 346],
  ['Entrena en casa', 16.5, 46.99, 76],
  ['La Mujer - Parte 1', 21.5, 201.99, 343],
  ['La Mujer - Parte 2', 17.5, 107.99, 181],
  ['La Mujer - Parte 1 + 2', 37.5, 374.99, 635],
];

export const LOCAL_CATALOG = CURSOS_15_1.flatMap(([name, mensual, anual, permanente]) => [
  { id: null, name: `${name} (mensual)`, price: mensual, currency: 'eur', type: 'subscription', billing_period: 'monthly', access_months: null, area: 'cursos', active: true },
  { id: null, name: `${name} (anual)`, price: anual, currency: 'eur', type: 'product', billing_period: 'one_time', access_months: 12, area: 'cursos', active: true },
  { id: null, name: `${name} (permanente)`, price: permanente, currency: 'eur', type: 'product', billing_period: 'one_time', access_months: null, area: 'cursos', active: true },
]);

const SUFFIX_RE = /\s*\((mensual|anual|permanente)\)\s*$/i;

// Agrupa filas de `products` por nombre base + sufijo de tramo. Las filas sin
// sufijo (libros, consultas…) se ignoran: no son productos con tramos.
export function groupTieredProducts(rows) {
  const groups = new Map();
  (rows || []).forEach((row) => {
    const match = SUFFIX_RE.exec(row.name || '');
    if (!match || row.active === false) return;
    const tier = match[1].toLowerCase();
    const baseName = row.name.replace(SUFFIX_RE, '').trim();
    if (!groups.has(baseName)) groups.set(baseName, { baseName, area: row.area, tiers: {} });
    groups.get(baseName).tiers[tier] = {
      id: row.id ?? null,
      name: row.name,
      price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
      billing_period: row.billing_period || (tier === 'mensual' ? 'monthly' : 'one_time'),
      access_months: row.access_months ?? (tier === 'anual' ? 12 : null),
      stripe_price_id: row.stripe_price_id ?? null,
    };
  });
  // Solo grupos con los 3 tramos completos (evita tarjetas a medias).
  return [...groups.values()].filter((g) => TIER_ORDER.every((t) => g.tiers[t]));
}

// Portadas locales por título (mismo criterio que el Top ventas del panel).
const COVERS = [
  { match: /fuerte|definid/i, src: '/mockup_fuerte_definido.png' },
  { match: /cocina/i, src: '/mockup_cocina.png' },
];

export function coverForCourse(baseName) {
  return COVERS.find((c) => c.match.test(baseName))?.src || '/cursosheronew.png';
}

// El shape exacto de la respuesta del catálogo lo decide la Fase 9: se acepta
// tanto un array directo como los envoltorios habituales.
function extractRows(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const key of ['products', 'catalog', 'items', 'rows', 'data']) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return null;
}

// Catálogo de cursos agrupado: del endpoint público cuando responda; espejo
// local 15.1 mientras tanto (404 del endpoint, red caída o shape inesperado).
export async function fetchTieredCourses() {
  if (PRODUCTS_ENDPOINT) {
    try {
      const res = await fetch(PRODUCTS_ENDPOINT);
      if (res.ok) {
        const rows = extractRows(await res.json());
        const groups = groupTieredProducts(rows).filter((g) => g.area === 'cursos');
        // Solo se acepta el catálogo remoto si trae grupos completos con
        // precios sanos; si no, el espejo local sigue mandando.
        const sane = groups.every((g) => TIER_ORDER.every((t) => g.tiers[t].price > 0));
        if (groups.length > 0 && sane) return groups;
      }
    } catch {
      // Backend caído: caemos al espejo local
    }
  }
  return groupTieredProducts(LOCAL_CATALOG);
}

export function formatEuros(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
}

// Item de carrito (compra directa) para un curso + tramo. Lleva toda la info
// del grupo para poder cambiar de tramo desde el propio carrito.
export function buildTierCartItem(group, tierKey) {
  const tier = group.tiers[tierKey];
  const meta = TIER_META[tierKey];
  return {
    id: tier.id || `curso-${group.baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tierKey}`,
    name: `${group.baseName} — ${meta.label}`,
    price: tier.price,
    image: coverForCourse(group.baseName),
    description: meta.note,
    // Datos del selector de tramo en el carrito:
    tier: tierKey,
    tierGroup: group,
    // '/mes' activa el desglose de pagos recurrentes del resumen del pedido.
    period: tierKey === 'mensual' ? '/mes' : undefined,
    // Cobro: el paso de pago usa createTierCheckout() (detección en vivo), no
    // este campo; se mantiene por compat con carritos ya guardados.
    // product_name es la clave estable en la BD.
    endpoint: TIER_CHECKOUT_ENDPOINT,
    payload: {
      product_id: tier.id,
      product_name: tier.name,
      billing_period: tier.billing_period,
    },
  };
}

// Intenta crear el cobro de un curso con tramo contra el checkout de la Fase 9.
// Devuelve:
//   { status: 'redirect', url }          → Stripe Checkout Session: redirigir
//   { status: 'client_secret', clientSecret } → PaymentIntent: Payment Element
//   { status: 'unavailable' }            → endpoint sin desplegar (404 en todas
//                                          las rutas candidatas): aviso honesto
// Lanza Error con mensaje del servidor en errores reales (400/401/500…).
export async function createTierCheckout(item, { token } = {}) {
  let origin;
  try { origin = localStorage.getItem('sf_origin') || undefined; } catch { origin = undefined; }

  const payload = {
    items: [{ ...item.payload, quantity: 1 }],
    // Contrato de vuelta: éxito → pantalla de gracias de /cart; cancelar → carrito.
    success_url: `${window.location.origin}/cart?success=true`,
    cancel_url: `${window.location.origin}/cart`,
    origin,
  };

  for (const endpoint of TIER_CHECKOUT_ENDPOINTS) {
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Red caída: no es un 404 de ruta; tratar como no disponible.
      return { status: 'unavailable' };
    }

    // 404 de NestJS («Cannot POST …») = la ruta no existe todavía: probar la
    // siguiente candidata. Cualquier otra respuesta viene del endpoint real.
    if (res.status === 404) continue;

    let data = {};
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok) {
      const msg = data?.message || data?.error;
      throw new Error(
        typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join('. ') : 'No se pudo iniciar el pago',
      );
    }

    const url = data.url || data.checkout_url || data.session_url || data.sessionUrl || data?.session?.url;
    if (url) return { status: 'redirect', url };

    const clientSecret = data.clientSecret || data.client_secret;
    if (clientSecret) return { status: 'client_secret', clientSecret };

    // Respuesta 2xx sin nada accionable: mejor el aviso honesto que colgarse.
    return { status: 'unavailable' };
  }

  return { status: 'unavailable' };
}
