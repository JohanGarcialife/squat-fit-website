'use client';

// Medición propia de uso de recetas — TODO va a nuestro backend, nunca a un
// tercero (nada de Google Analytics ni píxeles aquí). Sirve para construir
// el ranking de qué recetas se usan de verdad y decidir, con datos, cuáles
// pasar a muestra gratuita.
//
// Contrato CONFIRMADO contra el backend real (rama feat/muestras-gratis-y-
// ranking-recetas del repo SquatFit, mergeada en el PR #90 y YA DESPLEGADA;
// reverificado contra producción el 3-ago, ver el interruptor más abajo):
//
//   POST {NEXT_PUBLIC_API_URL}/api/v1/content-events
//   Authorization: Bearer <token>   (opcional: el endpoint es público; si
//     hay un token válido, el evento queda atribuido al usuario, pero la
//     falta de sesión nunca hace que se rechace)
//   Content-Type: application/json
//   { "events": [
//       {
//         "content_type": "recipe",          // fijo: este módulo solo mide recetas
//         "content_id": "<uuid de recipe.id>", // obligatorio salvo en "search"
//         "event_type": "click" | "open" | "read_time" | "search",
//         "duration_seconds": 123,             // SOLO "read_time" (0–86400; el
//                                                servidor lo recorta a 900s = 15 min)
//         "search_term": "pollo",              // SOLO "search" (máx. 200 caracteres)
//         "session_id": "uuid-por-pestaña"      // opcional, máx. 64 caracteres
//       }
//   ] }                                        // máximo 20 eventos por lote
//
// Respuesta 201: { accepted, rejected }. Un evento con forma correcta pero
// sin sentido (p.ej. "open" sin content_id) se descarta EN EL SERVIDOR sin
// tirar el resto del lote — por eso este módulo ni se molesta en mandar un
// "click"/"open"/"read_time" sin id de receta: el servidor lo tiraría igual.
//
// Nada de esto debe poder romper la interfaz ni bloquear un clic: todas las
// funciones son "fire and forget", envueltas en try/catch, y no hacen NADA
// (ni encolan, ni gastan memoria) mientras el interruptor esté apagado.

import { analyticsAllowed } from './cookieConsent';
import { useAuthStore } from '@/stores/auth.store';

// ─── Interruptor ─────────────────────────────────────────────────────────────
// ENCENDIDO el 3-ago: la rama del backend (feat/muestras-gratis-y-ranking-
// recetas) se mergeó en el PR #90 y está desplegada. Comprobado contra
// producción antes de encender, sin escribir ni una fila:
//   · POST /api/v1/content-events con `{}`            → 400 (existe y valida)
//   · un evento de forma válida pero sin sentido
//     ("open" sin content_id)                          → 201 {accepted:0,rejected:1}
//   · un event_type inexistente                        → 400 (validación de forma dura)
// Es decir: la respuesta {accepted, rejected} y el 400 de forma son
// exactamente los que documenta la cabecera de este fichero.
// Mismo patrón que REDIRECTS_API_READY en src/app/r/[slug]/route.js.
export const RECIPE_METRICS_READY = true;

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.squadfit.es';
const ENDPOINT = `${API}/api/v1/content-events`;

// Agrupar en vez de una petición por micro-evento: se manda cuando se junten
// MAX_BATCH eventos (tope real del backend: un lote mayor se rechaza entero
// con 400), o FLUSH_DEBOUNCE_MS después del último si no se llega, y siempre
// al abandonar la página (pagehide / pestaña oculta).
const MAX_BATCH = 20;
const FLUSH_DEBOUNCE_MS = 3000;

// Techo de cordura propio para el tiempo de lectura, en milisegundos (se
// manda en segundos). El servidor YA recorta a 900s por su cuenta —esto es
// solo un segundo cinturón, no lo que evita contar una pestaña olvidada: eso
// lo hace el corte por visibilitychange de ReadingTimer, más abajo.
export const MAX_READ_MS = 2 * 60 * 60 * 1000; // 2 horas

let queue = [];
let flushTimer = null;
let cachedSessionId = null;

function getSessionId() {
  if (cachedSessionId) return cachedSessionId;
  try {
    const KEY = 'sqf-recipe-metrics-session';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(KEY, id);
    }
    cachedSessionId = id;
  } catch {
    cachedSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return cachedSessionId;
}

function send(events, preferBeacon) {
  if (!events.length) return;
  const body = JSON.stringify({ events });

  // sendBeacon: sobrevive a que la pestaña se cierre justo después (por eso
  // se prefiere al salir de una receta o de la página). Si no está disponible
  // o falla, cae a un fetch con keepalive — nunca a un await que bloquee nada.
  try {
    if (preferBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
  } catch {
    /* cae al fetch de abajo */
  }

  try {
    const token = useAuthStore.getState().token;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      keepalive: true,
    }).catch(() => {
      /* si la ingesta falla o da 500, el usuario no se entera de nada */
    });
  } catch {
    /* medir nunca puede romper la interfaz */
  }
}

function flushNow(preferBeacon) {
  if (!queue.length) return;
  const events = queue;
  queue = [];
  send(events, preferBeacon);
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushNow(false);
  }, FLUSH_DEBOUNCE_MS);
}

/**
 * Encola un evento de uso de UNA receta.
 *
 * @param {'click'|'open'|'read_time'|'search'} eventType
 * @param {{ recipeId?: string, durationSeconds?: number, searchTerm?: string }} opts
 *   `recipeId` es obligatorio salvo para "search" (el backend lo descarta
 *   igual sin él, así que ni se manda). `durationSeconds` solo cuenta en
 *   "read_time"; `searchTerm` solo en "search".
 *
 * No hace nada (ni encola, ni gasta memoria) si RECIPE_METRICS_READY está
 * apagado, ni si el visitante no aceptó la categoría "Analítica" del banner
 * de cookies — misma regla que ya se aplica a Google Analytics
 * (cookieConsent.js): es medición de comportamiento, no algo "necessary".
 */
export function trackRecipeEvent(eventType, { recipeId, durationSeconds, searchTerm } = {}) {
  if (!RECIPE_METRICS_READY) return;
  try {
    if (!analyticsAllowed()) return;
    if (eventType !== 'search' && !recipeId) return; // el backend lo tiraría igual

    const event = {
      content_type: 'recipe',
      event_type: eventType,
      session_id: getSessionId(),
    };
    if (recipeId) event.content_id = recipeId;
    if (eventType === 'read_time' && durationSeconds != null) {
      event.duration_seconds = Math.max(0, Math.round(durationSeconds));
    }
    if (eventType === 'search' && searchTerm) {
      event.search_term = searchTerm.slice(0, 200);
    }

    queue.push(event);
    if (queue.length >= MAX_BATCH) flushNow(false);
    else scheduleFlush();
  } catch {
    /* medir nunca puede romper la interfaz */
  }
}

/** Vacía la cola YA, preferiblemente con sendBeacon (salir de una receta, salir de la página). */
export function flushRecipeMetrics() {
  if (!RECIPE_METRICS_READY) return;
  try {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flushNow(true);
  } catch {
    /* no-op */
  }
}

// ─── Lectura activa (para cuando se cierra la pestaña sin "salir" de la
// receta por la SPA) ─────────────────────────────────────────────────────
//
// El read_time normal lo manda la ficha de receta al desmontarse (navegar a
// otra pantalla del panel). Pero si el cliente cierra la pestaña o la
// ventana entera mientras lee, React no desmonta nada — el runtime se
// destruye sin más — así que ese read_time nunca se generaría. Por eso la
// ficha "registra" su cronómetro aquí; si `pagehide` salta con una lectura
// todavía registrada, se calcula su duración EN ESE MOMENTO y se encola
// antes de vaciar, para no perder la medición de una sesión cerrada de golpe.
let activeReading = null; // { recipeId, timer }

/** Llamar al abrir una receta (una vez que hay ReadingTimer en marcha). */
export function registerActiveReading(recipeId, timer) {
  activeReading = { recipeId, timer };
}

/** Llamar al desmontar la ficha (ya se manda el read_time real aparte). */
export function unregisterActiveReading(timer) {
  if (activeReading && activeReading.timer === timer) activeReading = null;
}

function finalizeActiveReadingIfAny() {
  if (!activeReading) return;
  const { recipeId, timer } = activeReading;
  trackRecipeEvent('read_time', { recipeId, durationSeconds: timer.elapsedMs() / 1000 });
}

// Red de seguridad global:
//  - `pagehide` (cerrar/recargar la pestaña): si hay una lectura activa que
//    nadie ha podido cerrar de forma ordenada, se finaliza aquí; luego se
//    vacía la cola entera con sendBeacon.
//  - `visibilitychange` a "hidden": SOLO vacía lo que ya estuviera en cola.
//    No finaliza la lectura activa — cambiar de pestaña no es "salir" de la
//    receta (el propio ReadingTimer ya pausa su conteo mientras tanto); si
//    finalizáramos aquí, cada cambio de pestaña duplicaría el evento.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    finalizeActiveReadingIfAny();
    flushRecipeMetrics();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushRecipeMetrics();
  });
}

/**
 * Cronómetro de lectura consciente de la pestaña: solo cuenta mientras
 * `document.visibilityState === 'visible'`. Cambiar de pestaña o minimizar
 * pausa el conteo; volver lo reanuda. Así una receta abierta y olvidada en
 * segundo plano toda la noche no infla el tiempo de lectura.
 */
export class ReadingTimer {
  constructor() {
    this.accumulated = 0;
    this.active = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    this.segmentStart = this.active ? now() : null;
    this._onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (!this.active) {
          this.active = true;
          this.segmentStart = now();
        }
      } else {
        this._closeSegment();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibility);
    }
  }

  _closeSegment() {
    if (this.active && this.segmentStart != null) {
      this.accumulated += now() - this.segmentStart;
    }
    this.active = false;
    this.segmentStart = null;
  }

  /** Milisegundos activos hasta ahora, sin dejar de contar. */
  elapsedMs() {
    let total = this.accumulated;
    if (this.active && this.segmentStart != null) total += now() - this.segmentStart;
    return Math.min(Math.round(total), MAX_READ_MS);
  }

  /** Cierra el cronómetro (deja de escuchar) y devuelve el total final. */
  stop() {
    this._closeSegment();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVisibility);
    }
    return this.elapsedMs();
  }
}

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
