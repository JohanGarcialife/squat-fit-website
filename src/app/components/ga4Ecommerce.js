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
 * Dos cosas que hay que respetar aquí:
 *
 * 1. **Consentimiento.** `GoogleAnalytics.js` solo inserta gtag si el visitante
 *    aceptó la categoría de analítica, así que `window.gtag` no existe cuando
 *    no la aceptó. Se comprueba antes de llamar y no se hace nada más: no se
 *    encola ni se guarda para después, porque eso sería medir a quien dijo que
 *    no.
 * 2. **No duplicar.** La pantalla de gracias es una URL con `session_id` que el
 *    cliente puede recargar, compartir o volver a abrir desde el historial.
 *    Sin protección, cada recarga sumaría una venta falsa. Se recuerdan los
 *    identificadores ya enviados en localStorage.
 */

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

/** Emisión genérica, con la misma puerta de consentimiento que `purchase`. */
function emitir(nombre, datos) {
  if (typeof window === 'undefined') return false;
  if (typeof window.gtag !== 'function') return false; // sin consentimiento
  window.gtag('event', nombre, datos);
  return true;
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
export function enviarPurchase({ transactionId, items, value, currency = 'EUR' }) {
  if (typeof window === 'undefined') return false;
  if (typeof window.gtag !== 'function') return false; // sin consentimiento
  if (!transactionId) return false; // sin id no hay forma de evitar duplicados
  if (leerEnviados().includes(transactionId)) return false;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
  marcarEnviado(transactionId);
  return true;
}
