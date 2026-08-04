'use client';

/**
 * `form_submit` — enviado desde nuestro código, porque GA4 no puede verlo.
 *
 * QUÉ PASABA. La medición mejorada de GA4 trae `form_start` y `form_submit` de
 * serie, y en la propiedad se veían **77 `form_start` y CERO `form_submit`** en
 * siete días. Parecía un fallo de configuración y no lo era.
 *
 * CÓMO SE COMPROBÓ, el 4-ago-2026, para no dejarlo en hipótesis:
 *
 *  1. En local, con escuchas de `submit` en las dos fases del documento: el
 *     evento nativo SÍ se dispara y llega a `document`. Llega sin prevenir en
 *     fase de captura y ya prevenido en burbuja — o sea que el manejador llama
 *     a `preventDefault` por el camino, pero el evento viaja igual. Así que la
 *     explicación fácil («son formularios de JS y por eso no se ve») es falsa.
 *  2. En producción, con el consentimiento aceptado y leyendo la capa de red:
 *     al cargar sale `en=page_view`, al tocar el campo sale `en=form_start`, y
 *     al enviar NO sale ninguna petición con `en=form_submit`.
 *
 * CONCLUSIÓN: GA4 solo cuenta `form_submit` cuando el envío **no** está
 * prevenido, es decir cuando la página navega de verdad. Ninguno de nuestros
 * formularios navega: los dos del embudo hacen `onSubmit={(e) =>
 * e.preventDefault()}` explícito y el resto van por Formik, que lo previene
 * dentro. No se arregla configurando GA4; hay que emitirlo nosotros.
 *
 * POR QUÉ SE REUSA EL NOMBRE `form_submit` en vez de inventar uno: como GA4 no
 * lo emite nunca en este sitio, no hay riesgo de contarlo dos veces —revisados
 * los 12 `<form>` del repo, todos tienen manejador y ninguno envía de forma
 * nativa—, y así el dato encaja con el vocabulario estándar y con el
 * `form_start` que sí llega solo.
 *
 * Los parámetros son los que GA4 usa para este evento (`form_id`, `form_name`,
 * `form_destination`, `form_submit_text`), para que se lean igual en los
 * informes.
 */

import { emitir } from './ga4Ecommerce';

/**
 * @param {object} datos
 * @param {string} datos.id           identificador estable del formulario
 * @param {string} datos.nombre       nombre legible, el que verá quien mire el informe
 * @param {string} [datos.destino]    a dónde lleva al terminar
 * @param {string} [datos.textoBoton] texto del botón de envío
 * @param {boolean} [datos.registrado] si el POST al backend llegó a confirmarse
 * @returns {boolean} true si el evento salió (o se dejó esperando a gtag)
 */
export function enviarFormSubmit({ id, nombre, destino, textoBoton, registrado }) {
  if (!id) return false;
  return emitir('form_submit', {
    form_id: id,
    form_name: nombre || id,
    ...(destino ? { form_destination: destino } : {}),
    ...(textoBoton ? { form_submit_text: textoBoton } : {}),
    // Propio, no del vocabulario de GA4: distingue «el cliente terminó el
    // formulario» de «además se registró en el backend». El evento se emite en
    // los dos casos porque desde el lado del cliente la acción es la misma, y
    // que nuestro POST falle es problema nuestro, no un comportamiento distinto
    // del visitante. Pero conviene poder separarlos en el informe.
    ...(registrado === undefined ? {} : { registrado_en_backend: Boolean(registrado) }),
  });
}
