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
const VOL = { select: 0.06, advance: 0.064 }; // avance: -15 % a petición de Hamlet

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

// Despierta el audio dentro de un gesto del usuario (el botón «Empezar»).
// Los navegadores no dejan sonar nada hasta que alguien toca algo, así que si
// la primera pantalla se escribiera sola, su tecleo se perdería. Llamando a
// esto en el clic, todo lo que venga después ya suena desde el primer carácter.
export function unlockAudio() {
  audio();
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

// ── Tecleo ────────────────────────────────────────────────────────────────
// No suena una vez por letra (eso sonaba a metralleta y ataba el ritmo del
// sonido a la velocidad del texto). Suena a CADENCIA FIJA mientras dura el
// mecanografiado, como quien teclea a ritmo constante.
//
// El golpe NO es un ruido seco (sonaba a «tac tac tac», desagradable a la
// larga): es una nota corta y redonda con ataque suave, tipo marimba. Se
// distingue el título del párrafo por tono, no por aspereza.
// El TÍTULO usa la nota redonda (gusta). El PÁRRAFO no: repetida cada pocos
// milisegundos, una nota se vuelve cargante. Ahí va un roce sordo —ruido muy
// filtrado, con ataque suave— que acompaña sin llamar la atención.
//
// Historia de la cadencia del párrafo: 185 ms sonaba a metralleta; 617 dejó de
// oírse entre golpe y golpe; 430 con volumen 0.010 se quedó tan apagado que
// María «casi no lo escuchaba». Se sube a 0.024 y se abre el filtro (520 → 700)
// para que se oiga de verdad, manteniendo el carácter de roce y no de clic.
const TECLEO = {
  title: { tipo: 'nota',  ms: 175, freq: 320, vol: 0.081, dur: 0.16 },
  body:  { tipo: 'roce',  ms: 430, corte: 700, vol: 0.024, dur: 0.075 },
};

let ruido = null;
function bufferRuido(ac) {
  if (ruido) return ruido;
  const n = Math.floor(ac.sampleRate * 0.05);
  ruido = ac.createBuffer(1, n, ac.sampleRate);
  const datos = ruido.getChannelData(0);
  for (let i = 0; i < n; i += 1) datos[i] = Math.random() * 2 - 1;
  return ruido;
}

// Nota corta y redonda: ataque de 10 ms (sin ataque suena a clic) y caída
// exponencial. Se le suma un armónico flojito para darle cuerpo de madera.
function golpeSuave({ freq, vol, dur }) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const f = freq * (0.97 + Math.random() * 0.06); // ni dos golpes idénticos
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  gain.connect(ac.destination);

  const base = ac.createOscillator();
  base.type = 'sine';
  base.frequency.setValueAtTime(f, t);
  base.connect(gain);
  base.start(t); base.stop(t + dur + 0.02);

  const cuerpo = ac.createOscillator();
  const gCuerpo = ac.createGain();
  cuerpo.type = 'triangle';
  cuerpo.frequency.setValueAtTime(f * 2.02, t);
  gCuerpo.gain.setValueAtTime(0.28, t);
  cuerpo.connect(gCuerpo).connect(gain);
  cuerpo.start(t); cuerpo.stop(t + dur * 0.6);
}

// Roce sordo para el párrafo: ruido pasado por un filtro grave, con rampa de
// entrada (sin rampa suena a «tac») y caída larga. Casi un susurro.
function roceSuave({ corte, vol, dur }) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = bufferRuido(ac);
  const filtro = ac.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(corte * (0.85 + Math.random() * 0.3), t);
  filtro.Q.value = 0.4;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol * (0.8 + Math.random() * 0.4), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filtro).connect(gain).connect(ac.destination);
  src.start(t);
  src.stop(t + dur + 0.01);
}

// Cierre del mecanografiado: una nota corta y AGUDA, la campanita del carro de
// la máquina de escribir al llegar al final de la línea. Cierra el párrafo en
// vez de dejar que el roce se corte en seco.
//
// Se llama SOLO al terminar de escribir de verdad, no cuando se para el sonido
// por desmontar la pantalla: si no, sonaría la campana al salirse a mitad.
export function playTypingEnd() {
  if (isMuted()) return;
  golpeSuave({ freq: 1320, vol: 0.055, dur: 0.3 });
}

// Arranca el tecleo a ritmo constante. Devuelve la función para pararlo.
export function startTyping(tipo = 'body') {
  if (isMuted()) return () => {};
  const cfg = TECLEO[tipo] || TECLEO.body;
  const golpe = () => (cfg.tipo === 'nota' ? golpeSuave(cfg) : roceSuave(cfg));
  golpe();
  const id = setInterval(golpe, cfg.ms);
  return () => clearInterval(id);
}

// ── Teclado del usuario: clic corto y brillante, al estilo del teclado del
// iPhone. Ahí sí funciona el ruido, pero filtrado en banda estrecha y muy
// corto: eso es lo que da el «tock» seco y limpio, no un pitido.
let ultimaTecla = 0;
export function playKeypress() {
  if (isMuted()) return;
  const ahora = Date.now();
  if (ahora - ultimaTecla < 40) return; // escribiendo rápido sonaría a estática
  ultimaTecla = ahora;

  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const dur = 0.026;

  const src = ac.createBufferSource();
  src.buffer = bufferRuido(ac);
  const banda = ac.createBiquadFilter();
  banda.type = 'bandpass';
  banda.frequency.setValueAtTime(2400 * (0.9 + Math.random() * 0.2), t);
  banda.Q.value = 1.6;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.05, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(banda).connect(gain).connect(ac.destination);
  src.start(t); src.stop(t + dur + 0.01);

  // Golpecito grave que le da el "cuerpo" del teclado del móvil.
  const cuerpo = ac.createOscillator();
  const gCuerpo = ac.createGain();
  cuerpo.type = 'sine';
  cuerpo.frequency.setValueAtTime(880, t);
  gCuerpo.gain.setValueAtTime(0.018, t);
  gCuerpo.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
  cuerpo.connect(gCuerpo).connect(ac.destination);
  cuerpo.start(t); cuerpo.stop(t + 0.03);
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
