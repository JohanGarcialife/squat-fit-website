/**
 * ¿Hay algo en este carrito que haya que meter en una caja?
 *
 * PRODUCTOS FÍSICOS HAY SEIS, Y SON ESTOS:
 *   · Libro impreso — volumen 1
 *   · Libro impreso — volumen 2
 *   · Libro impreso — vol. 1 + vol. 2
 *   · La Cocina Squad Fit (el bundle de todo)
 *   · Copia extra impresa — volumen 1
 *   · Copia extra impresa — volumen 2
 *
 * Todo lo demás del catálogo —cursos, programas, biblioteca, recetarios
 * digitales— se entrega abriendo el panel.
 *
 * CÓMO SE SABE. Por una marca puesta al añadirlo (`esFisico`), no por descarte.
 * La primera versión de esto preguntaba «¿no es compra directa?», y por descarte
 * acababa siendo físico cualquier cosa que no fuera una suscripción: un curso
 * comprado desde su ficha entraba como envío y al cliente le salía una
 * dirección de envío que rellenar. La marca la pone `addPhysical` en Shop.js,
 * que es la única puerta por la que un libro impreso llega al carrito.
 *
 * EL RESPALDO POR NOMBRE es para los carritos que ya estaban guardados en el
 * navegador antes de existir la marca: se quedarían sin `esFisico` y su libro
 * dejaría de pedir dirección. Reconoce los seis por cómo se llaman en el
 * carrito («Impreso Volumen 1», «La Cocina Squad Fit», «Libro Físico - …»).
 * Se puede quitar dentro de unas semanas, cuando ya no queden carritos viejos.
 */

const NOMBRES_DE_LO_QUE_SE_ENVIA = /(impres|libro f[íi]sico|cocina squad ?fit|copia extra)/i;

function esFisico(item) {
  if (!item) return false;
  if (item.esFisico === true) return true;
  return NOMBRES_DE_LO_QUE_SE_ENVIA.test(String(item.name || ''));
}

export function hayQueEnviar(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return false;
  return cart.some(esFisico);
}
