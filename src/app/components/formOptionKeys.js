'use client';

// Teclado de las preguntas de opciones (briefing nº 12, pedido 26-jul):
// las flechas ↑/↓ mueven el foco entre las opciones y Enter confirma la
// resaltada, como un menú.
//
// Se apoya en el FOCO REAL del navegador en vez de en un índice guardado en
// React. Así el resaltado, el anillo de foco y la activación con Enter/Espacio
// son los nativos del <button>, no una imitación, y funcionan igual en los dos
// formularios (FormRunner y la prellamada) sin duplicar estado.
//
// Contrato con el marcado, para que esto no dependa de las clases de estilo:
//   · el contenedor de las opciones lleva  data-opciones
//   · cada opción lleva                     data-opcion
//   · la que está elegida lleva además      data-elegida="true"

export const SEL_GRUPO = '[data-opciones]';
export const SEL_OPCION = '[data-opcion]';

// Mientras hay algo por encima de la pregunta —el diálogo de salida, el cajón
// de pasos o la pausa a pantalla completa— las opciones siguen montadas debajo,
// solo que tapadas. Sin esta puerta, las flechas moverían el foco a una opción
// que no se ve y el siguiente Enter cambiaría la respuesta a ciegas.
let hayAlgoDelante = false;
export function bloquearTeclasDeOpciones(bloquear) {
  hayAlgoDelante = !!bloquear;
}

// Botones de opción visibles del paso actual.
function opcionesVisibles() {
  if (hayAlgoDelante) return [];
  const grupo = document.querySelector(SEL_GRUPO);
  if (!grupo) return [];
  return Array.from(grupo.querySelectorAll(SEL_OPCION)).filter(
    (el) => !el.disabled && el.offsetParent !== null,
  );
}

/**
 * Mueve el foco a la opción anterior/siguiente. Si todavía no hay ninguna
 * enfocada, entra por la que ya está elegida (o por la primera).
 * @param {1|-1} paso
 * @returns {boolean} true si movió el foco (para hacer preventDefault fuera)
 */
export function moverFocoOpciones(paso) {
  const opciones = opcionesVisibles();
  if (opciones.length === 0) return false;

  const enfocada = opciones.indexOf(document.activeElement);
  let destino;
  if (enfocada === -1) {
    // Primera flecha: entramos por la elegida si la hay; si no, por la primera
    // bajando y por la última subiendo.
    const elegida = opciones.findIndex((el) => el.dataset.elegida === 'true');
    destino = elegida !== -1 ? elegida : (paso === 1 ? 0 : opciones.length - 1);
  } else {
    // Da la vuelta al llegar a los extremos, como un menú.
    destino = (enfocada + paso + opciones.length) % opciones.length;
  }

  const el = opciones[destino];
  el.focus();
  el.scrollIntoView({ block: 'nearest' });
  return true;
}

/**
 * Enter con el foco puesto en una opción.
 *  · Si AÚN NO está elegida, la elige y devuelve true (Enter no avanza).
 *  · Si ya lo está, o el foco no está en una opción, devuelve false y Enter
 *    hace lo de siempre: avanzar.
 * Así se resalta con las flechas, se confirma con Enter y se sigue con otro
 * Enter, sin tocar el ratón.
 *
 * La pulsamos nosotros con .click() en vez de dejar que el navegador active el
 * botón por su cuenta: es la misma acción, pero explícita y comprobable, y no
 * depende de acertar con el preventDefault. Espacio sigue marcando sin avanzar
 * por la vía nativa, que es lo cómodo en las preguntas de varias respuestas.
 */
export function elegirOpcionEnfocada(target) {
  if (hayAlgoDelante) return false;
  const opcion = target?.closest?.(SEL_OPCION);
  if (!opcion || opcion.dataset.elegida === 'true') return false;
  opcion.click();
  return true;
}

/** ¿El foco está en un campo donde las flechas significan otra cosa? */
export function escribiendoEnCampo(target) {
  if (!target || !target.tagName) return false;
  const t = target.tagName;
  return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || target.isContentEditable;
}
