'use client';

// Trustpilot: invitación de reseña del pedido recién pagado.
//
// El snippet base (TrustpilotInvitations, en el <head> de los 7 layouts) solo
// registra la cuenta y deja `window.tp` disponible. Esta pieza es la que manda
// la invitación concreta: se monta DENTRO de la pantalla de gracias
// (PaymentSuccess), así que solo existe cuando la compra ya está confirmada.
//
// Manda reseña de SERVICIO (la tienda) y, si el pedido trae líneas, también de
// PRODUCTO (`products` + `productSkus`).
//
// Consentimiento de cookies (F2): no hace falta comprobarlo aquí — el
// snippet hermano del <head> (TrustpilotInvitations) ya no se carga si el
// visitante no aceptó la categoría "Marketing", así que `window.tp` no
// existe y el guard de más abajo ("Si el snippet del <head> no llegó a
// cargar...") ya evita mandar nada sin consentimiento.

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCheckoutStore } from '@/stores/checkout.store';

// Referencia del pedido que el paso de pago deja escrita cuando Stripe
// confirma SIN redirigir (`redirect: 'if_required'`, el caso normal con
// tarjeta): en esa ruta la pantalla de gracias no recibe ni `session_id` ni
// `payment_intent` en la URL, así que no habría con qué identificar el pedido.
// Por pestaña (sessionStorage): es un dato de la compra en curso.
export const ORDER_REF_KEY = 'sqf-last-order-ref';

// Líneas del pedido, ya mapeadas al shape que quiere Trustpilot. Hay que
// fotografiarlas ANTES de pagar porque la pantalla de gracias vacía el carrito
// antes de montarse (clearCart en /cart y en PaymentSuccess), así que cuando
// esta invitación se dispara el carrito ya está a cero.
export const ORDER_ITEMS_KEY = 'sqf-last-order-items';

// Marca de «este pedido ya tiene invitación». En localStorage y con una clave
// por pedido: recargar la pantalla, volver atrás o reabrir la pestaña no puede
// mandar una segunda invitación del mismo pedido, y una compra posterior
// (referencia distinta) sí manda la suya.
const SENT_PREFIX = 'sqf-tp-invited:';

// URL pública del sitio. Fija y no `window.location.origin`: las reseñas de
// producto de Trustpilot tienen que apuntar al dominio real, no al de un
// preview de Vercel ni al de un build de revisión en la LAN. Mismo criterio
// (y mismo valor) que el BASE del sitemap.
const SITE_URL = 'https://squadfit.es';

// Respaldo en memoria por si localStorage no está disponible (Safari en modo
// privado antiguo, cookies de terceros bloqueadas…). Peor que localStorage
// —no sobrevive a una recarga— pero evita el doble disparo del montaje doble
// de React 18 en desarrollo.
const invitadosEnMemoria = new Set();

function yaInvitado(ref) {
  if (invitadosEnMemoria.has(ref)) return true;
  try {
    return localStorage.getItem(SENT_PREFIX + ref) === '1';
  } catch {
    return false;
  }
}

function marcarInvitado(ref) {
  invitadosEnMemoria.add(ref);
  try {
    localStorage.setItem(SENT_PREFIX + ref, '1');
  } catch {
    // Sin almacenamiento: queda la marca en memoria y el ref del componente.
  }
}

// ---------------------------------------------------------------------------
// Líneas del pedido → `products` de Trustpilot
// ---------------------------------------------------------------------------

// No hay ficha pública por producto: los productos se venden en las dos
// páginas de catálogo del sitio. `productUrl` apunta a la que corresponde.
function productUrlFor(item) {
  const area = item?.tierGroup?.area;
  if (area === 'cursos') return `${SITE_URL}/cursos`;
  if (area === 'cocina') return `${SITE_URL}/cocina`;
  // Curso con tramo sin área declarada: los cursos viven en /cursos.
  if (item?.tierGroup || item?.tier) return `${SITE_URL}/cursos`;
  // Resto (libros y packs físicos, el carrito global): tienda de cocina.
  return `${SITE_URL}/cocina`;
}

// La portada puede venir absoluta (catálogo del backend) o como ruta local
// del /public. Si no hay ninguna, se devuelve '' y el campo se OMITE: hay una
// tarea abierta de portadas que faltan en el catálogo, y Trustpilot pintaría
// un hueco roto con una cadena vacía.
function imageUrlFor(item) {
  const src = typeof item?.image === 'string' ? item.image.trim() : '';
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${SITE_URL}${src}`;
  return '';
}

// `sku`: el MISMO identificador que viaja al backend en el checkout y con el
// que la línea aterriza en Pedidos del back office — `product_id` para los
// cursos/biblioteca con tramo y `pack_id`/`version_id` para libros y packs.
// En el carrito los tres son `item.id`, así que ese es el sku.
export function buildProducts(items) {
  const vistos = new Set();
  const products = [];

  (Array.isArray(items) ? items : []).forEach((item) => {
    const sku = item?.id === 0 || item?.id ? String(item.id).trim() : '';
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    // Sin sku o sin nombre la línea no es reseñable: mejor dejarla fuera que
    // mandar a Trustpilot un producto que no sabrá agrupar.
    if (!sku || !name || vistos.has(sku)) return;
    vistos.add(sku);

    const product = { sku, name, productUrl: productUrlFor(item) };
    const imageUrl = imageUrlFor(item);
    if (imageUrl) product.imageUrl = imageUrl;
    products.push(product);
  });

  return products;
}

// Foto de las líneas del pedido, tomada por el paso de pago antes de cobrar.
export function saveOrderItems(cart) {
  const products = buildProducts(cart);
  if (products.length === 0) return;
  try {
    sessionStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(products));
  } catch {
    // Sin almacenamiento: la invitación saldrá solo con reseña de servicio.
  }
}

function readOrderItems() {
  try {
    const raw = sessionStorage.getItem(ORDER_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Identidad del pedido y del comprador
// ---------------------------------------------------------------------------

// Identificador del pedido, en el mismo orden en que Stripe nos lo puede dar:
//   1. session_id     → vuelta del checkout incrustado / Checkout Session
//   2. payment_intent → vuelta con redirección del Payment Element
//   3. sessionStorage → confirmación sin redirección (lo deja Payment.js)
export function resolveOrderReference() {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('session_id') || params.get('payment_intent') || '';
  // `{CHECKOUT_SESSION_ID}` sin sustituir = la vuelta no trae sesión real.
  if (fromUrl && !fromUrl.includes('{')) return fromUrl.trim();

  try {
    return (sessionStorage.getItem(ORDER_REF_KEY) || '').trim();
  } catch {
    return '';
  }
}

function esEmail(valor) {
  return typeof valor === 'string' && /.+@.+\..+/.test(valor.trim());
}

// El email de la cuenta manda (es el que cobra Stripe y el que la propia
// pantalla enseña como destino del recibo); si el JWT no lo trae, el que
// escribió en el formulario de datos.
function resolveEmail(user, formEmail) {
  const candidatos = [user?.email, formEmail, user?.username];
  const encontrado = candidatos.find(esEmail);
  return encontrado ? encontrado.trim().toLowerCase() : '';
}

// Trustpilot escribe «Hola, {recipientName}», así que quiere el nombre de
// pila. Si solo hay nombre completo nos quedamos con el primer token.
function resolveNombre(user, formFirstName, email) {
  const candidatos = [formFirstName, user?.firstName, user?.name, user?.username];

  for (const candidato of candidatos) {
    if (typeof candidato !== 'string') continue;
    const token = candidato.trim().split(/\s+/)[0] || '';
    // `username` es muchas veces el propio email: no sirve como nombre.
    if (token && !token.includes('@')) return token;
  }

  // Último recurso antes de mandar la invitación sin nombre: la parte local
  // del email, limpia de separadores. Preferimos «Juan» a un saludo vacío.
  const local = email.split('@')[0] || '';
  const trozo = local.split(/[._\-+0-9]+/).filter(Boolean)[0] || '';
  return trozo ? trozo.charAt(0).toUpperCase() + trozo.slice(1) : '';
}

export default function TrustpilotInvitation() {
  const user = useAuthStore((s) => s.user);
  const formEmail = useCheckoutStore((s) => s.formData?.email);
  const formFirstName = useCheckoutStore((s) => s.formData?.firstName);

  // Los stores son `persist`: en el primer render del cliente vienen vacíos y
  // se rellenan al rehidratar. Por eso el efecto depende de ellos y el ref
  // impide que ese segundo pase mande una invitación duplicada.
  const yaDisparado = useRef(false);

  useEffect(() => {
    if (yaDisparado.current) return;

    const referenceId = resolveOrderReference();
    const recipientEmail = resolveEmail(user, formEmail);

    // Sin email o sin pedido no hay invitación que mandar: una invitación sin
    // referencia se le duplicaría al cliente en cada compra.
    if (!recipientEmail || !referenceId) return;

    if (yaInvitado(referenceId)) {
      yaDisparado.current = true;
      return;
    }

    // Si el snippet del <head> no llegó a cargar (bloqueador, red caída), no
    // pasa nada: la pantalla de gracias sigue funcionando igual.
    const tp = typeof window !== 'undefined' ? window.tp : undefined;
    if (typeof tp !== 'function') return;

    yaDisparado.current = true;
    marcarInvitado(referenceId);

    const invitation = {
      recipientEmail,
      recipientName: resolveNombre(user, formFirstName, recipientEmail),
      referenceId,
      source: 'InvitationScript',
    };

    // Reseña de producto: solo si el pedido trae líneas resueltas. Nunca
    // arrays vacíos — Trustpilot los toma por un pedido sin productos.
    const products = readOrderItems();
    if (products.length > 0) {
      invitation.productSkus = products.map((p) => p.sku);
      invitation.products = products;
    }

    tp('createInvitation', invitation);
  }, [user, formEmail, formFirstName]);

  return null;
}
