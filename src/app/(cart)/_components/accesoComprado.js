'use client';

// Qué acaba de comprar el cliente → a dónde le llevamos en la pantalla de
// gracias.
//
// La pantalla de gracias ofrecía dos tarjetas FIJAS («Biblioteca Digital» y
// «Cursos en Video»): quien compraba solo un curso acababa en una biblioteca
// vacía (y al revés). Aquí se guarda, ANTES de cobrar, una foto de lo comprado
// con su destino real, y la pantalla de gracias pinta una entrada por producto.
//
// Por qué una foto en sessionStorage y no el carrito: la pantalla de gracias
// vacía el carrito antes de montarse (clearCart en /cart y en PaymentSuccess),
// y en el checkout incrustado la vuelta de Stripe recarga la página. Mismo
// motivo y mismo momento que la foto de las líneas para Trustpilot
// (saveOrderItems), que se toma en el paso de pago.
//
// Por qué NO se reutiliza esa foto de Trustpilot: solo lleva sku, nombre y la
// URL del CATÁLOGO público (/cursos o /cocina), que no distingue la biblioteca
// digital de un libro en papel ni sabe nada de los paneles. Se usa como
// respaldo (ver readOrderAccess) para pedidos que ya estuvieran en vuelo.

import { ORDER_ITEMS_KEY } from './TrustpilotInvitation';

export const ORDER_ACCESS_KEY = 'sqf-last-order-access';

// Tipo de producto comprado, deducido de los campos que el carrito SÍ tiene:
//  · tramos (cursos y biblioteca digital) → `tier` + `tierGroup.area`
//    (buildTierCartItem en courseCatalog.js)
//  · suscripción digital legada del selector del carrito → id `digital-*`
//    con `type: 'digital'` (Summary.js)
//  · resto (libros y packs en papel) → `type: 'pack'` o versión de libro
export function tipoDeCompra(item) {
  const area = item?.tierGroup?.area;
  const esTramo = !!(item?.tier || item?.tierGroup);

  if (esTramo) {
    if (area === 'cursos') return 'curso';
    if (area === 'cocina') return 'biblioteca';
    // Tramo sin área declarada (catálogo antiguo): el único tramo de cocina es
    // la Biblioteca digital y se llama así; los demás tramos son cursos.
    return /bibliotec/i.test(String(item?.name || '')) ? 'biblioteca' : 'curso';
  }

  if (item?.type === 'digital' || /^digital-/.test(String(item?.id || ''))) {
    return 'biblioteca';
  }

  return 'libro';
}

// Destino de cada tipo dentro del panel:
//  · curso      → Mis cursos. NO se enlaza el curso concreto: el enlace hondo
//                 (/panel-cursos?id=…) quiere el id del CURSO y el carrito solo
//                 tiene el id del producto/tramo del catálogo. Inventarlo
//                 llevaría otra vez a una pantalla vacía.
//  · biblioteca → Mi cocina, que es donde vive la biblioteca de recetas.
//  · libro      → SIN destino: un libro en papel no se lee en el panel, se
//                 envía. /panel-cocina enseñaría «Aún no tienes acceso a la
//                 biblioteca», que es exactamente el problema que se arregla.
function destinoDe(tipo) {
  if (tipo === 'curso') return '/panel-cursos';
  if (tipo === 'biblioteca') return '/panel-cocina';
  return null;
}

function entradaDeItem(item) {
  const tipo = tipoDeCompra(item);
  const nombre = String(item?.name || '').trim();

  const titulo =
    tipo === 'curso'
      ? (item?.tierGroup?.baseName || nombre || 'Tu curso')
      : tipo === 'biblioteca'
        ? 'Biblioteca digital'
        : (nombre || 'Tu pedido');

  return {
    id: item?.id === 0 || item?.id ? String(item.id) : titulo,
    tipo,
    titulo,
    href: destinoDe(tipo),
  };
}

// Foto de lo comprado, tomada por el paso de pago justo antes de cobrar.
export function saveOrderAccess(cart) {
  const entradas = (Array.isArray(cart) ? cart : []).map(entradaDeItem);
  if (entradas.length === 0) return;
  try {
    sessionStorage.setItem(ORDER_ACCESS_KEY, JSON.stringify(entradas));
  } catch {
    // Sin almacenamiento: la pantalla de gracias ofrecerá solo el panel.
  }
}

// Respaldo con la foto de Trustpilot (pedidos que ya estaban en vuelo cuando
// se desplegó esto): de ahí solo sale la URL del catálogo, así que el tipo se
// afina por el nombre. Nunca inventa destino: lo que no se sabe va sin enlace.
function entradasDesdeTrustpilot() {
  let productos = [];
  try {
    const raw = sessionStorage.getItem(ORDER_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    productos = Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }

  return productos.map((p) => {
    const nombre = String(p?.name || '').trim();
    const esCurso = /\/cursos$/.test(String(p?.productUrl || ''));
    const esBiblioteca = !esCurso && /bibliotec/i.test(nombre);
    const tipo = esCurso ? 'curso' : esBiblioteca ? 'biblioteca' : 'libro';
    return {
      id: p?.sku ? String(p.sku) : nombre,
      tipo,
      titulo: tipo === 'biblioteca' ? 'Biblioteca digital' : nombre || 'Tu pedido',
      href: destinoDe(tipo),
    };
  });
}

export function readOrderAccess() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(ORDER_ACCESS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Cae al respaldo.
  }
  return entradasDesdeTrustpilot();
}
