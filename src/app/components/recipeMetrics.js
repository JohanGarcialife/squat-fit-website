'use client';

// Medición propia de uso de recetas (Mi cocina) — TODO va a nuestro backend,
// nunca a un tercero (nada de Google Analytics ni píxeles aquí). Sirve para
// construir el ranking de qué recetas se usan de verdad y así decidir, con
// datos, cuáles pasar a muestra gratuita (encargo de Hamlet, 31-jul).
//
// El endpoint de ingesta lo está construyendo otro carril EN PARALELO y no
// estaba desplegado al escribir esto. Forma acordada a falta de que el
// backend confirme lo contrario:
//
//   POST {NEXT_PUBLIC_API_URL}/api/v1/recipe-metrics/events
//   Authorization: Bearer <token>  (si hay sesión)
//   Content-Type: application/json
//   { "events": [
//       {
//         "type": "click" | "open" | "read_time" | "search",
//         "session_id": "uuid por pestaña",
//         "ts": "2026-07-31T21:00:00.000Z",   // reloj del cliente
//         "path": "/panel-cocina",             // window.location.pathname
//         // click / open / read_time:
//         "book_id": "...", "version_id": "...", "is_free_sample": true|false,
//         "duration_ms": 12345,                // solo en read_time
//         // search:
//         "book_id": "...", "version_id": "...",
//         "query": "pollo", "results_count": 3
//       }
//   ] }
//
// Nada de esto debe poder romper la interfaz ni bloquear un clic: todas las
// funciones son "fire and forget", envueltas en try/catch, y no hacen NADA
// (ni encolan, ni gastan memoria) mientras el interruptor esté apagado.

import { analyticsAllowed } from './cookieConsent';
import { useAuthStore } from '@/stores/auth.store';

// ─── Interruptor ─────────────────────────────────────────────────────────────
// Apagado a propósito: el endpoint de ingesta aún no está desplegado. Encender
// a `true` cuando el otro carril confirme que /recipe-metrics/events responde
// en producción (mismo patrón que REDIRECTS_API_READY en src/app/r/[slug]/route.js).
export const RECIPE_METRICS_READY = false;

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';
const ENDPOINT = `${API}/api/v1/recipe-metrics/events`;

// Agrupar en vez de una petición por micro-evento: se manda cuando se junten
// MAX_BATCH eventos, o FLUSH_DEBOUNCE_MS después del último si no se llega,
// y siempre al abandonar la página (pagehide / pestaña oculta).
const MAX_BATCH = 20;
const FLUSH_DEBOUNCE_MS = 3000;

// Techo de cordura para el tiempo de lectura: nunca por encima de esto,
// aunque `performance.now()` o el reloj hagan algo raro. No es lo que evita
// contar una pestaña olvidada (eso lo hace el corte por visibilitychange de
// ReadingTimer) — es solo un segundo cinturón.
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
 * Encola un evento de uso de recetas. No hace nada (ni siquiera gasta
 * memoria) si RECIPE_METRICS_READY está apagado, y no hace nada si el
 * visitante no aceptó la categoría "Analítica" del banner de cookies — misma
 * regla que ya se aplica a Google Analytics (cookieConsent.js): es medición
 * de comportamiento, no algo "necessary".
 */
export function trackRecipeEvent(type, payload = {}) {
  if (!RECIPE_METRICS_READY) return;
  try {
    if (!analyticsAllowed()) return;
    queue.push({
      type,
      session_id: getSessionId(),
      ts: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ...payload,
    });
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

// Red de seguridad global: si por lo que sea nadie llamó a flushRecipeMetrics
// al desmontar (navegación fuera de la SPA, cerrar pestaña…), esto vacía la
// cola de todas formas. No sustituye al flush explícito del lector — el de
// aquí solo se dispara al ocultarse/cerrarse TODA la pestaña, no al salir de
// una receta para ir a otra pantalla del panel.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => flushRecipeMetrics());
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
