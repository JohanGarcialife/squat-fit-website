/**
 * ¿Hay algo en este carrito que haya que meter en una caja?
 *
 * UNA SOLA REGLA PARA LAS DOS PREGUNTAS. Este criterio ya existía —lo usaba
 * `OrderSummary` para decidir si se cobra envío— pero el formulario no lo
 * miraba, así que la dirección de envío se pedía SIEMPRE. Comprando un curso,
 * que no se envía a ninguna parte y por el que no se cobra ni un céntimo de
 * porte, el cliente se encontraba con una dirección de envío que rellenar.
 * Fricción gratis en la única pantalla donde se pierde dinero de verdad.
 *
 * Que la regla viva aquí y no repetida en cada sitio es lo que impide que un
 * día se cobre envío sin haber pedido dirección, o al revés.
 *
 * EL CRITERIO. `isDirectCheckout` marca las compras de un solo clic que no
 * pasan por la tienda física: suscripciones, cursos, packs digitales. Lo que no
 * lleva esa marca viene del catálogo de libros impresos, que sí viaja. No es
 * una comprobación de «producto físico» en el catálogo —eso sería mejor y hoy
 * el carrito no lo trae—, pero es EXACTAMENTE el mismo criterio con el que se
 * cobra el envío, y esa coherencia es lo que importa: no puede pasar que se
 * cobre porte sin dirección.
 */
export function hayQueEnviar(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return false;
  return cart.some((item) => !item?.isDirectCheckout);
}
