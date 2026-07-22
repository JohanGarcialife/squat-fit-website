// Aranceles de importación a Estados Unidos para pedidos con productos físicos.
// Solo se MUESTRAN en el resumen (Fase 15); el cobro real llega con la Fase 16.
// La tabla va por tramos de valor declarado (subtotal de los físicos, en EUR).

export const ARANCEL_COUNTRY = 'US';

const TRAMOS = [
  { hasta: 25, importe: 1.95 },
  { hasta: 50, importe: 2.35 },
  { hasta: 100, importe: 2.8 },
  { hasta: 200, importe: 4.3 },
  { hasta: 300, importe: 6.3 },
  { hasta: 400, importe: 8.3 },
  { hasta: 725, importe: 12.8 },
  { hasta: 1200, importe: 17.4 },
  { hasta: 1900, importe: 22.25 },
  { hasta: 2400, importe: 27.1 },
];

// Devuelve el arancel para un valor declarado dado (0 si no hay valor).
// Por encima del último tramo se aplica el importe máximo de la tabla.
export function arancelUSA(valor) {
  if (!valor || valor <= 0) return 0;
  const tramo = TRAMOS.find((t) => valor <= t.hasta);
  return tramo ? tramo.importe : TRAMOS[TRAMOS.length - 1].importe;
}

// Subtotal de los productos físicos del carrito (los digitales van con
// isDirectCheckout), que es el valor declarado en aduana.
export function subtotalFisicos(cart) {
  return (cart || [])
    .filter((item) => !item.isDirectCheckout)
    .reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
}

// Arancel a mostrar para un carrito y país de envío dados.
export function arancelParaCarrito(cart, country) {
  if (country !== ARANCEL_COUNTRY) return 0;
  return arancelUSA(subtotalFisicos(cart));
}
