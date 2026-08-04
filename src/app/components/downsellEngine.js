// Motor del downsell — sustituye al "Generador Downsell Squad Fit.xlsx" y a los
// 45 Pretty Links del WordPress viejo.
//
// Cómo funciona el sistema (flujo Downsell Latam):
//  · El lead puntúa 4 áreas de 0 a 10; 8 o más = la necesita. Eso produce una
//    clave binaria en orden a-b-c-d (p. ej. "1100" = Recetas + Nutrición).
//  · Con la clave + el objetivo (PG perder grasa / GM ganar músculo) se busca la
//    combinación: 15 claves × 2 objetivos = 30 combos con su copy aprobado.
//  · Hilo 1 = un producto · Hilo 2 = principal + combinado · Hilo 3 = curso +
//    biblioteca (la elección de 3-4 necesidades se consolida en curso + recetas).
//
// El copy de downsellData.json se extrajo VERBATIM de la hoja de María (no se
// redactó a mano): cualquier cambio de copy debe hacerse ahí, no aquí.
//
// En vez de 45 enlaces cortos por vendedor, la URL del resultado lleva la
// configuración: /recomendador?c=1100&o=GM&via=karl — cero slugs que mantener.

import data from './downsellData.js';

export const COMBOS = data.combos;

export const UMBRAL = 8; // puntuación mínima para contar una necesidad

// Las 4 áreas, en el orden de la clave binaria (a, b, c, d).
// `pregunta` = como se pregunta en el chat (doc "1 Flujo Downsell Latam");
// `frase` = como se expresa esa necesidad dentro del copy generado.
export const AREAS = [
  {
    key: 'recetas',
    letra: 'a',
    nombre: 'Recetas',
    pregunta: 'Recetas, variedad y sabor en tu comida',
    frase: 'recetas prácticas y variedad en tu alimentación',
  },
  {
    key: 'nutricion',
    letra: 'b',
    nombre: 'Nutrición',
    pregunta: 'Nutrición: estructurar tus dietas y menús',
    frase: 'estructurar tu alimentación y nutrición',
  },
  {
    key: 'entreno',
    letra: 'c',
    nombre: 'Entreno',
    pregunta: 'Entrenamiento y planificación',
    frase: 'enfocarte en entrenamiento y progresión',
  },
  {
    key: 'guia',
    letra: 'd',
    nombre: 'Guía',
    pregunta: 'Una consulta o sesión diagnóstica personalizada',
    frase: 'una orientación más personalizada',
  },
];

// Copy exacto con el que el equipo abre el downsell en el chat (por si la IA o
// un setter lo quiere pegar tal cual antes de mandar el enlace del quiz).
export const INTRO_CHAT =
  'Para decirte qué te encaja mejor, te voy a dejar una lista para que me digas ' +
  'del 0 al 10 en cuáles de estos te hace falta profundizar más ahora, siendo 0 ' +
  'que no te hace falta y 10 que lo necesitas muchísimo…';

export const OBJETIVOS = {
  PG: { key: 'PG', label: 'Perder grasa' },
  GM: { key: 'GM', label: 'Ganar músculo' },
};

// Quién envía el enlace. El valor viaja como utm_source para que GA4 atribuya
// la venta sin crear enlaces cortos por persona. Añadir aquí a alguien nuevo
// es una línea (no hay nada más que tocar).
export const VENDEDORES = [
  { key: 'karl', label: 'Karl' },
  { key: 'zerochats', label: 'ZeroChats' },
];

// A DÓNDE MANDA EL BOTÓN DE LAS VIDEOCONSULTAS (4-ago-2026)
// -----------------------------------------------------------------------------
// Antes iba a `/contacto`, con un TODO de «enlazar la reserva TidyCal de pago
// cuando exista». Medido: son 10 de los 30 combos —los del lead que pide
// «Guía»—, y en 2 la videoconsulta es la única salida. Y `/contacto`, sin sesión
// iniciada, no enseña formulario: responde «necesitas iniciar sesión» (deja una
// vía de WhatsApp, así que no incomunica, pero a quien acaba de pulsar
// «reservar» se le contesta otra cosa).
//
// Reserva de pago sigue sin haber: la cuenta de TidyCal tiene UNA sola agenda,
// «Sesión diagnóstica» de 59 minutos y gratuita.
//
// PRIMERO SE RESERVA, DESPUÉS SE RELLENA. Esto se cambió el mismo día: la
// primera versión mandaba a `/empieza-tu-cambio` para que nadie llegara al
// calendario sin pasar antes por el formulario. Hamlet lo corrigió, y con
// razón — «formulario siempre antes de reservar» es una regla de `/programa`,
// no una ley del sitio, y yo la apliqué donde no tocaba:
//
//   · Si la llamada es DE PAGO, quien ya ha pagado tiene más holgura para
//     rellenar el formulario después, no menos.
//   · Y aunque sea gratuita, a un lead que está comprometido conviene dejarle
//     hacer primero la acción que lo compromete —coger hora— y enseñarle el
//     formulario al terminar la reserva.
//
// Lo que NO cambia: la sección de agenda de `/programa` sigue sin calendario a
// propósito, y ahí el formulario sí va delante. Son dos embudos distintos.
//
// PENDIENTE, y no es código: que el formulario aparezca al TERMINAR la reserva
// depende del «redirect tras reservar» de TidyCal, que se configura en su panel.
const RESERVA_LLAMADA = 'https://agenda.squadfit.es/sesion-diagnostica';

// Ficha de cada producto recomendable.
//  · catalogBase enlaza con el catálogo real (courseCatalog.js) para mostrar
//    SIEMPRE el precio vigente — nada de precios congelados de la hoja vieja.
//  · Las videoconsultas no están en el catálogo de tramos: precio fijo según
//    "Precios y Cupones web.xlsx" (17-jul-2026).
// `articulo`, `nombreCorto` y `beneficioCorto` alimentan el resumen animado del
// resultado (condensan la "propuesta + beneficio" del copy largo de María).
export const PRODUCTOS = {
  biblioteca: {
    nombre: 'Biblioteca de recetas',
    href: '/cocina',
    cta: 'Ver la Biblioteca',
    catalogBase: 'Biblioteca digital',
    articulo: 'la',
    nombreCorto: 'Biblioteca de recetas',
    beneficioCorto: 'cubrir tu proteína diaria sin complicarte ni tener que pensar qué comer',
  },
  fyd: {
    nombre: 'Curso Fuerte y Definid@',
    href: '/cursos',
    cta: 'Ver el curso',
    catalogBase: 'Fuerte y Definid@',
    articulo: 'mi',
    nombreCorto: 'curso Fuerte y Definid@',
    beneficioCorto: 'estructurar tu dieta y tus entrenos por tu cuenta',
  },
  cursoPG: {
    nombre: 'Curso de Pérdida de Grasa',
    href: '/cursos',
    cta: 'Ver el curso',
    catalogBase: 'Pérdida de Grasa',
    articulo: 'mi',
    nombreCorto: 'Curso de Pérdida de Grasa',
    beneficioCorto: 'estructurar tu dieta para perder grasa de forma sostenible',
  },
  cursoGM: {
    nombre: 'Curso de Ganar Músculo',
    href: '/cursos',
    cta: 'Ver el curso',
    catalogBase: 'Ganar Músculo',
    articulo: 'mi',
    nombreCorto: 'Curso de Ganar Músculo',
    beneficioCorto: 'organizar tu dieta para ganar músculo sin exceso de grasa',
  },
  vc_avanzada: {
    nombre: 'Videoconsulta avanzada · 1 hora',
    href: RESERVA_LLAMADA,
    cta: 'Reservar la videoconsulta',
    precio: 99.97,
    precioAntes: 160,
    nota: 'Sesión única de 1 hora',
    articulo: 'una',
    nombreCorto: 'videoconsulta avanzada',
    beneficioCorto: 'analizar tu caso a fondo y resolver tus dudas clave',
  },
  vc_estrategica: {
    nombre: 'Videoconsulta estratégica · 30 min',
    href: RESERVA_LLAMADA,
    cta: 'Reservar la videoconsulta',
    precio: 79.99,
    nota: 'Sesión única de 30 minutos',
    articulo: 'una',
    nombreCorto: 'videoconsulta estratégica',
    beneficioCorto: 'mirar tu caso concreto en una llamada y empezar con claridad',
  },
};

// Resumen corto del resultado para la animación de escritura. El copy completo
// de la hoja sigue intacto en los bloques (lo usa el chat); esto es la versión
// condensada que pide la landing: una o dos frases, no cuatro párrafos.
export function resumenCorto(combo) {
  if (!combo) return '';
  const objetivo = OBJETIVOS[combo.objetivo]?.label.toLowerCase() || '';
  const [p1, p2] = combo.productos.map((id) => PRODUCTOS[id]);
  if (!p1) return '';
  let frase =
    `Con tu objetivo de ${objetivo}, lo más coherente sería ` +
    `${p1.articulo} ${p1.nombreCorto} para ${p1.beneficioCorto}.`;
  if (p2) {
    frase += ` Y tiene mucho sentido combinarlo con ${p2.articulo} ${p2.nombreCorto} para ${p2.beneficioCorto}.`;
  }
  return frase;
}

// scores = { recetas, nutricion, entreno, guia } con valores 0-10.
export function claveFromScores(scores) {
  return AREAS.map((a) => (Number(scores[a.key]) >= UMBRAL ? '1' : '0')).join('');
}

export function findCombo(clave, objetivo) {
  return COMBOS.find((c) => c.clave === clave && c.objetivo === objetivo) || null;
}

// Resuelve puntuaciones → combinación. Si ninguna área llega a 8 (la hoja no
// tiene fila "0000"), usamos la de mayor puntuación como única necesidad para
// no dejar al lead sin recomendación; `fallback: true` lo delata por si la UI
// quiere suavizar el texto.
export function resolve(scores, objetivo) {
  let clave = claveFromScores(scores);
  let fallback = false;
  if (clave === '0000') {
    const top = [...AREAS].sort(
      (a, b) => Number(scores[b.key] ?? 0) - Number(scores[a.key] ?? 0),
    )[0];
    clave = AREAS.map((a) => (a.key === top.key ? '1' : '0')).join('');
    fallback = true;
  }
  const combo = findCombo(clave, objetivo);
  return combo ? { ...combo, fallback } : null;
}

// URL canónica de un resultado. `via` (karl / zerochats) se propaga también
// como utm_source para la atribución en GA4; el pedido queda ligado a la
// sesión que GA capturó con esa fuente.
export function buildResultUrl({ clave, objetivo, via, origin = 'https://squadfit.es' }) {
  const p = new URLSearchParams({ c: clave, o: objetivo });
  if (via) {
    p.set('via', via);
    p.set('utm_source', via);
    p.set('utm_medium', 'chat');
    p.set('utm_campaign', 'downsell');
  }
  return `${origin}/recomendador?${p.toString()}`;
}

// Párrafo completo para pegar en el chat (uso interno): los bloques del copy
// separados por línea en blanco, igual que los generaba la hoja.
export function parrafoChat(combo) {
  return (combo?.bloques || []).join('\n\n');
}
