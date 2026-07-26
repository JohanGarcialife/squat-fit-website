'use client';

// Sonidos de los formularios: sutiles, sintetizados y sin descargar nada.
//
// Se generan con Web Audio (osciladores + envolvente), así que no hay archivos
// que cargar, pesan cero y se pueden afinar cambiando un número. Todos son
// tonos suaves y cortos, a volumen bajo: acompañan, no interrumpen.
//
// El navegador no deja sonar nada hasta que el usuario interactúa; por eso el
// contexto de audio se crea perezosamente en el primer toque.
//
// Silencio: preferencia propia guardada en el navegador (sqf-sound), y se
// respeta también «reducir movimiento» del sistema, que la gente que se marea
// con animaciones suele activar y agradece que implique menos estímulos.

const STORAGE_KEY = 'sqf-sound';
const VOL = { tick: 0.035, select: 0.06, advance: 0.075 };

let ctx = null;
let muted = null; // se resuelve en el primer uso (no tocar localStorage en SSR)

function sistemaPrefiereCalma() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export function isMuted() {
  if (muted !== null) return muted;
  if (typeof window === 'undefined') return true;
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado !== null) muted = guardado === 'off';
    else muted = sistemaPrefiereCalma();
  } catch {
    muted = false;
  }
  return muted;
}

export function toggleMute() {
  muted = !isMuted();
  try {
    localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on');
  } catch {}
  if (!muted) tono({ freq: 660, dur: 0.07, vol: VOL.select, tipo: 'sine' });
  return muted;
}

function audio() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// Un tono con ataque y caída suaves: sin el "clic" seco de cortar la onda.
function tono({ freq, dur = 0.09, vol = 0.05, tipo = 'sine', desliz = 0 }) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  if (desliz) osc.frequency.exponentialRampToValueAtTime(freq + desliz, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Tecleo: muy corto y agudo, con la frecuencia variando un poco para que no
// suene a metrónomo. No suena en cada letra (lo llama Typewriter cada N).
export function playTick() {
  if (isMuted()) return;
  const freq = 1150 + Math.round((Date.now() % 7) * 28);
  tono({ freq, dur: 0.035, vol: VOL.tick, tipo: 'triangle' });
}

// Elegir una opción: nota corta y limpia.
export function playSelect() {
  if (isMuted()) return;
  tono({ freq: 720, dur: 0.075, vol: VOL.select, tipo: 'sine' });
}

// Continuar: dos notas ascendentes (quinta justa), la sensación de "avanzo".
export function playAdvance() {
  if (isMuted()) return;
  tono({ freq: 588, dur: 0.085, vol: VOL.advance, tipo: 'sine' });
  setTimeout(() => tono({ freq: 880, dur: 0.11, vol: VOL.advance, tipo: 'sine' }), 70);
}

// Enviar el formulario: pequeño arpegio de cierre.
export function playFinish() {
  if (isMuted()) return;
  [523, 659, 784].forEach((f, i) =>
    setTimeout(() => tono({ freq: f, dur: 0.16, vol: VOL.advance, tipo: 'sine' }), i * 95)
  );
}
