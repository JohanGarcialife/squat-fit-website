// Catálogo de cursos con tramos (15.1): agrupa los 3 productos de cada curso
// («Nombre (mensual)» / «(anual)» / «(permanente)») en una sola entrada con
// selector. Mensual = suscripción; anual y permanente = PAGO ÚNICO (anual da
// 12 meses de acceso vía access_months; permanente, acceso para siempre).
//
// DATOS: la fuente de verdad es la tabla `products` del backend (con
// billing_period y access_months), pero hoy el único endpoint que la lista es
// GET /api/v1/admin-panel/products, protegido para staff: NO existe todavía un
// endpoint público de catálogo (verificado en el backend desplegado y en el
// repo, 20 jul 2026). Mientras llega, ESPEJO LOCAL con las mismas filas y
// precios reales que dejó el seed 15.1 en la BD de producción. Cuando el
// backend exponga el catálogo, poned la URL en PRODUCTS_ENDPOINT y estas
// mismas funciones agruparán las filas reales (con sus UUID y stripe_price_id).
export const PRODUCTS_ENDPOINT = null; // p. ej. `${API}/api/v1/products/catalog`

// Checkout de estos productos: el checkout actual del backend solo acepta
// version/pack/course/calculator, así que los tramos del catálogo aún no se
// pueden cobrar online. Cuando exista el endpoint (Fase 6), poner aquí la ruta
// (p. ej. '/api/v1/checkout/create-payment-intent') y el shape del payload en
// buildTierCartItem. Con null, el paso de pago muestra un aviso honesto de
// «disponible muy pronto» en lugar de un error críptico de Stripe.
export const TIER_CHECKOUT_ENDPOINT = null;

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

// Catálogo de cursos agrupado: del endpoint público cuando exista; espejo
// local 15.1 mientras tanto.
export async function fetchTieredCourses() {
  if (PRODUCTS_ENDPOINT) {
    try {
      const res = await fetch(PRODUCTS_ENDPOINT);
      if (res.ok) {
        const rows = await res.json();
        const groups = groupTieredProducts(rows).filter((g) => g.area === 'cursos');
        if (groups.length > 0) return groups;
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
    // Cobro: preparado tras TIER_CHECKOUT_ENDPOINT (null hoy → aviso honesto
    // en el paso de pago). product_name es la clave estable en la BD.
    endpoint: TIER_CHECKOUT_ENDPOINT,
    payload: {
      product_id: tier.id,
      product_name: tier.name,
      billing_period: tier.billing_period,
    },
  };
}
