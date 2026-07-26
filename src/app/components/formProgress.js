'use client';

// Progreso de los formularios guardado en el propio navegador.
//
// Por qué en el navegador y no en el servidor: para guardar en servidor haría
// falta crear el lead a medias, con respuestas incompletas, y eso ensucia el
// CRM. Aquí no se manda nada a ningún sitio hasta que la persona termina y le
// da a enviar. El precio es que el progreso NO viaja entre dispositivos: si
// empieza en el móvil y sigue en el ordenador, allí no hay nada.
//
// Caduca a los 7 días: pasado ese tiempo, retomar un formulario a medias es más
// confuso que empezarlo de nuevo, porque ya no recuerdas lo que contestaste.

const CLAVE = 'sqf-forms-progreso';
const VIGENCIA_MS = 7 * 24 * 60 * 60 * 1000;
const VERSION = 1;

function leerTodo() {
  if (typeof window === 'undefined') return {};
  try {
    const bruto = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    if (bruto.v !== VERSION) return {};
    const ahora = Date.now();
    const vivos = {};
    Object.entries(bruto.forms || {}).forEach(([id, p]) => {
      if (ahora - (p.ts || 0) < VIGENCIA_MS) vivos[id] = p;
    });
    return vivos;
  } catch {
    return {};
  }
}

function escribirTodo(forms) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION, forms }));
  } catch {
    // Navegador con el almacenamiento bloqueado (modo privado estricto): el
    // formulario tiene que seguir funcionando, solo que sin recordar nada.
  }
}

/**
 * Guarda dónde se quedó. `meta` es lo que necesita el botón flotante para
 * ofrecer volver: título, url y por qué pregunta iba.
 */
export function guardarProgreso(id, { respuestas, indice, total, titulo, url }) {
  const forms = leerTodo();
  forms[id] = { respuestas, indice, total, titulo, url, ts: Date.now() };
  escribirTodo(forms);
}

export function leerProgreso(id) {
  return leerTodo()[id] || null;
}

export function borrarProgreso(id) {
  const forms = leerTodo();
  delete forms[id];
  escribirTodo(forms);
}

/** El formulario a medias más reciente, para el botón flotante de la web. */
export function progresoPendiente() {
  const forms = leerTodo();
  const lista = Object.entries(forms)
    .map(([id, p]) => ({ id, ...p }))
    .filter((p) => p.indice > 0) // empezado de verdad, no solo abierto
    .sort((a, b) => b.ts - a.ts);
  return lista[0] || null;
}
