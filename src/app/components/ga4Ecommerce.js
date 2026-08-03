'use client';

/**
 * Medición de comercio electrónico en GA4.
 *
 * Hallazgo del 2-ago (pasada honda sobre Analytics): **squadfit.es no emitía ni
 * un solo evento de comercio**. Los únicos `purchase` y `add_to_cart` de la
 * propiedad venían del WordPress viejo de squatfit.es, que sigue siendo un
 * flujo aparte. Desde el cambio de dominio, GA4 no ha registrado ni una venta
 * de la tienda actual — y `purchase` es, además, el ÚNICO evento marcado como
 * evento clave en la propiedad. De ahí el «Eventos clave: 0» y «Compras: 0»
 * del panel de inicio.
 *
 * Tres cosas que hay que respetar aquí:
 *
 * 1. **Consentimiento.** `GoogleAnalytics.js` solo inserta gtag si el visitante
 *    aceptó la categoría de analítica. Quien la rechazó no se mide, y punto: no
 *    se encola ni se guarda para después.
 * 2. **Pero «gtag todavía no está» NO es «dijo que no».** Corregido el 3-ago:
 *    la puerta original era `typeof window.gtag !== 'function'`, que confunde
 *    las dos cosas. Y justo en el caso que más importa —`purchase`— son
 *    distintas: la pantalla de gracias es una carga de página LIMPIA después de
 *    volver de stripe.com, y ahí gtag no existe hasta que React monta,
 *    `GoogleAnalytics` lee el consentimiento en su efecto, re-renderiza, y Next
 *    inserta el `<Script afterInteractive>`. El efecto de /cart que emite la
 *    compra corre en esa misma tanda: si gana la carrera, la venta se descarta
 *    en silencio y no hay segunda oportunidad. Los demás eventos no lo sufren
 *    porque salen de un clic, con la página ya caliente — que es exactamente el
 *    patrón «llegan miles de eventos y cero compras».
 *    Así que ahora se pregunta por el consentimiento de verdad
 *    (`analyticsAllowed`) y, si lo hay pero el script aún no está, se espera.
 * 3. **No duplicar.** La pantalla de gracias es una URL con `session_id` que el
 *    cliente puede recargar, compartir o volver a abrir desde el historial.
 *    Sin protección, cada recarga sumaría una venta falsa. Se recuerdan los
 *    identificadores ya enviados en localStorage.
 */

import { analyticsAllowed } from './cookieConsent';

const CLAVE_ENVIADOS = 'sqf-ga4-purchases';
// Suficiente para que una recarga o una vuelta atrás no cuele, sin dejar
// crecer la clave sin límite en el navegador de un cliente recurrente.
const MAX_RECORDADOS = 50;

function leerEnviados() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CLAVE_ENVIADOS) || '[]');
    return Array.isArray(bruto) ? bruto : [];
  } catch {
    // Almacenamiento bloqueado (modo privado estricto). Se sigue adelante: es
    // preferible arriesgar un duplicado en un caso raro que perder la medición
    // de todas las compras de ese navegador.
    return [];
  }
}

function marcarEnviado(id) {
  try {
    const previos = leerEnviados().filter((x) => x !== id);
    previos.push(id);
    localStorage.setItem(
      CLAVE_ENVIADOS,
      JSON.stringify(previos.slice(-MAX_RECORDADOS)),
    );
  } catch {
    // Ver arriba.
  }
}

/** Los items del carrito en el formato que espera GA4. */
export function itemsDesdeCarrito(cart) {
  return (cart || []).map((p) => ({
    item_id: String(p.id ?? ''),
    item_name: p.title || p.name || 'Producto',
    price: Number(p.price) || 0,
    quantity: Number(p.quantity) || 1,
  }));
}

/**
 * Importe de la compra a partir del carrito.
 *
 * OJO, y está medido: esto es el subtotal de los productos. **No incluye el
 * envío**, porque su importe se calcula con una consulta en vivo
 * (`useShippingQuote`) y no se persiste en ningún store, así que al volver de
 * Stripe ya no está disponible. Tampoco refleja cupones aplicados dentro de
 * Stripe. Para la cifra exacta hace falta que el backend devuelva el
 * `amount_total` de la sesión en `catalog/checkout/session-status`, que hoy
 * solo devuelve `{ paid, status }` aunque tenga el objeto entero de Stripe
 * delante. Queda anotado como siguiente paso: hasta entonces GA4 declara de
 * menos, nunca de más.
 */
export function valorDesdeCarrito(cart) {
  const total = (cart || []).reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1),
    0,
  );
  return Number(total.toFixed(2));
}

// Tope de espera a que gtag aparezca. 8 s cubre de sobra una descarga de
// googletagmanager.com en 3G malo; pasado eso se abandona, porque un evento que
// sale un minuto tarde ya no lo cuadra nadie con el pedido.
const ESPERA_GTAG_MS = 8000;
const REINTENTO_MS = 150;

/**
 * Ejecuta `accion(gtag)` en cuanto haya gtag, o nunca si no hay consentimiento.
 *
 * Devuelve true cuando el evento ha salido o queda comprometido a salir, y
 * false cuando se descarta por consentimiento — que es la única razón legítima
 * para no medir.
 */
function conGtag(accion) {
  if (typeof window === 'undefined') return false;
  if (typeof window.gtag === 'function') {
    accion(window.gtag);
    return true;
  }
  // Sin gtag: hay que distinguir «no quiso» de «aún no ha cargado».
  if (!analyticsAllowed()) return false;

  let esperado = 0;
  const reloj = setInterval(() => {
    if (typeof window.gtag === 'function') {
      clearInterval(reloj);
      accion(window.gtag);
      return;
    }
    esperado += REINTENTO_MS;
    if (esperado >= ESPERA_GTAG_MS) clearInterval(reloj);
  }, REINTENTO_MS);
  return true;
}

/** Emisión genérica, con la misma puerta de consentimiento que `purchase`. */
function emitir(nombre, datos) {
  return conGtag((gtag) => gtag('event', nombre, datos));
}

/**
 * `add_to_cart` — un producto entra en el carrito.
 *
 * No se deduplica a propósito: añadir dos veces el mismo producto son dos
 * intenciones distintas y GA4 espera verlas. Lo que sí importa es no inventarse
 * el importe, así que si el producto no trae precio se manda 0 y no se estima.
 */
export function enviarAddToCart(producto, cantidad = 1) {
  if (!producto) return false;
  const precio = Number(producto.price) || 0;
  return emitir('add_to_cart', {
    currency: 'EUR',
    value: Number((precio * cantidad).toFixed(2)),
    items: itemsDesdeCarrito([{ ...producto, quantity: cantidad }]),
  });
}

/**
 * `begin_checkout` — el cliente pasa del carrito a los datos de envío.
 *
 * Es el paso que faltaba para poder leer el embudo: hasta ahora solo se veía
 * el final (`purchase`), así que un abandono en el paso de pago era
 * indistinguible de una visita que nunca quiso comprar.
 */
export function enviarBeginCheckout(cart) {
  const items = itemsDesdeCarrito(cart);
  if (items.length === 0) return false;
  return emitir('begin_checkout', {
    currency: 'EUR',
    value: valorDesdeCarrito(cart),
    items,
  });
}

/**
 * Emite `purchase`. Devuelve true solo si el evento ha salido de verdad, para
 * que quien llame pueda distinguir «no había consentimiento» de «ya estaba
 * enviado» en una depuración.
 */
// Compras comprometidas en ESTA carga de página pero todavía sin salir, porque
// se está esperando a gtag. `marcarEnviado` ya no es inmediato, así que sin esto
// dos montajes seguidos del carrito pasarían los dos el filtro de localStorage y
// contarían la venta dos veces. Deliberadamente en memoria y no en localStorage:
// si la espera expira y el evento no llega a salir, una recarga de la pantalla
// de gracias debe poder reintentarlo.
const enVuelo = new Set();

export function enviarPurchase({ transactionId, items, value, currency = 'EUR' }) {
  if (typeof window === 'undefined') return false;
  if (!transactionId) return false; // sin id no hay forma de evitar duplicados
  if (enVuelo.has(transactionId)) return false;
  if (leerEnviados().includes(transactionId)) return false;

  enVuelo.add(transactionId);
  return conGtag((gtag) => {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
    marcarEnviado(transactionId);
  });
}
