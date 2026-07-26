'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, ChevronLeft, ListChecks, Volume2, VolumeX } from 'lucide-react';
import { isMuted, toggleMute } from './formSounds';

const BLUE = '#3932C0';
const ORANGE = '#FF690B';

// Piezas de chrome compartidas por los formularios (prellamada, onboarding y los
// del panel): salir, volver, lista de fases y el panel lateral de móvil.

/* ── Salir: botón circular, en vez del carácter ✕ suelto ── */
export function ExitButton({ href, onClick, label = 'Salir' }) {
  const clases =
    'shrink-0 grid place-items-center w-9 h-9 rounded-full text-[#8B87C9] ' +
    'bg-[#F3F2F9] hover:bg-[#E7E5F4] hover:text-[#3932C0] active:scale-95 ' +
    'transition-all cursor-pointer';
  const icono = <X className="w-[18px] h-[18px]" strokeWidth={2.5} />;
  return href ? (
    <Link href={href} aria-label={label} className={clases}>{icono}</Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={clases}>{icono}</button>
  );
}

/* ── Pausa entre preguntas ───────────────────────────────────────────────
   No sale en todas las respuestas (cansaría y delataría que es automático):
   aparece cada 3-5, con la frase elegida al azar y sin repetir la anterior,
   para que parezca alguien reaccionando a lo que cuentas.

   Ocupa la PANTALLA ENTERA y tapa la pregunta siguiente hasta que se va. Ese
   es su trabajo: cortar la inercia de ir encadenando preguntas a toda prisa y
   dar un respiro antes de la siguiente. */
const FRASES = [
  'Perfecto, voy anotando todo',
  'Genial, seguimos',
  'Anotado. Continuamos',
  'Gracias, ya lo tengo',
  'Vamos muy bien',
  'Estupendo, sigo apuntando',
  'Buen dato, seguimos',
  'Recibido, continuamos',
];
const sorteo = (n) => Math.floor(Math.random() * n);

// Cuánto dura la pausa entera, de que entra a que ha terminado de irse. Tiene
// que cuadrar con la animación `.sf-pausa` de form-motion.css.
export const PAUSA_MS = 1520;

export function useMicroFeedback() {
  const cuenta = React.useRef(0);
  const objetivo = React.useRef(3);
  const anterior = React.useRef('');

  React.useEffect(() => {
    objetivo.current = 3 + sorteo(3); // 3, 4 o 5
  }, []);

  // Devuelve la frase que toca mostrar, o null si a esta respuesta no le toca.
  const marcar = React.useCallback(() => {
    cuenta.current += 1;
    if (cuenta.current < objetivo.current) return null;
    cuenta.current = 0;
    objetivo.current = 3 + sorteo(3);
    let frase = anterior.current;
    while (frase === anterior.current) frase = FRASES[sorteo(FRASES.length)];
    anterior.current = frase;
    return frase;
  }, []);

  return { marcar };
}

export function PausaPantalla({ texto }) {
  if (!texto) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center px-8 text-center bg-white"
      role="status"
      aria-live="polite"
    >
      <div className="sf-pausa flex flex-col items-center">
        <span
          className="grid place-items-center w-20 h-20 rounded-full mb-7"
          style={{ backgroundColor: '#FFF1E7', color: ORANGE }}
        >
          <Check className="w-10 h-10" strokeWidth={3} />
        </span>
        <p
          className="font-extrabold leading-tight max-w-lg"
          style={{ color: BLUE, fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)' }}
        >
          {texto}
        </p>
      </div>
    </div>
  );
}

/* ── Campo hijo: cuelga de la opción elegida con un corchete naranja, como en
      el diseño de «Alergias o intolerancias». Se usa para las preguntas cuya
      respuesta abre otra: «Europa» → ¿de qué país? ── */
export function ChildField({ children }) {
  return (
    <div className="flex items-stretch gap-2 sf-child">
      <span
        aria-hidden
        className="shrink-0 w-3.5 -mt-2 mb-2 rounded-l-xl border-l-2 border-t-2 border-b-2"
        style={{ borderColor: ORANGE }}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ── Silenciar/activar los sonidos del formulario ── */
export function SoundButton() {
  const [mute, setMute] = React.useState(true);
  // En el primer render del servidor no hay localStorage: se lee al montar.
  // Se lee al montar (en el servidor no hay localStorage). Blindado: si el
  // navegador bloquea el almacenamiento, el formulario debe seguir funcionando.
  useEffect(() => {
    try { setMute(isMuted()); } catch { /* sin sonido, sin romper nada */ }
  }, []);
  return (
    <button
      type="button"
      onClick={() => setMute(toggleMute())}
      aria-label={mute ? 'Activar sonido' : 'Silenciar'}
      title={mute ? 'Activar sonido' : 'Silenciar'}
      className="shrink-0 grid place-items-center w-9 h-9 rounded-full text-[#8B87C9]
                 hover:bg-[#F3F2F9] hover:text-[#3932C0] active:scale-95
                 transition-all cursor-pointer"
    >
      {mute ? <VolumeX className="w-[18px] h-[18px]" strokeWidth={2.2} />
            : <Volume2 className="w-[18px] h-[18px]" strokeWidth={2.2} />}
    </button>
  );
}

/* ── Volver: pastilla visible, no un texto que se pierde ── */
export function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 pl-2 pr-3.5 py-2 rounded-full font-bold text-sm
                 text-[#6B6BA8] bg-[#F3F2F9] hover:bg-[#E7E5F4] hover:text-[#3932C0]
                 active:scale-95 transition-all cursor-pointer"
    >
      <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      Atrás
    </button>
  );
}

/* ── Contador: en móvil abre el panel de pasos ── */
export function StepCounter({ index, total, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Ver los pasos del formulario"
      className="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-full font-bold text-sm
                 text-[#8B87C9] hover:bg-[#F3F2F9] hover:text-[#3932C0] active:scale-95
                 transition-all cursor-pointer"
    >
      {index + 1}/{total}
      <ListChecks className="w-4 h-4 lg:hidden" strokeWidth={2.5} />
    </button>
  );
}

/* ── Lista de fases con hitos: hecha / actual / pendiente.
      Las ya visitadas son clicables para volver a repasarlas. ── */
export function PhasesList({ phases = [], currentPhase, onGoTo, compact = false }) {
  const actual = phases.indexOf(currentPhase);
  if (!phases.length) return null;
  return (
    <ol className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'} w-full`}>
      {phases.map((p, i) => {
        const hecha = actual > -1 && i < actual;
        const activa = i === actual;
        const navegable = hecha && typeof onGoTo === 'function';
        const Fila = navegable ? 'button' : 'div';
        return (
          <li key={p}>
          <Fila
            type={navegable ? 'button' : undefined}
            onClick={navegable ? () => onGoTo(p) : undefined}
            title={navegable ? `Volver a «${p}»` : undefined}
            className={`w-full flex items-center gap-3 rounded-xl px-2 -mx-2 text-left transition-colors ${
              navegable ? 'cursor-pointer hover:bg-[#E7E5F4]' : ''
            }`}
          >
            <span
              className="shrink-0 grid place-items-center rounded-full transition-all"
              style={{
                width: activa ? 22 : 18,
                height: activa ? 22 : 18,
                backgroundColor: hecha ? BLUE : activa ? ORANGE : '#DEDCF5',
                color: '#fff',
              }}
            >
              {hecha && <Check className="w-3 h-3" strokeWidth={3.5} />}
              {activa && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span
              className={`py-1.5 transition-colors ${activa ? 'font-extrabold' : 'font-semibold'}`}
              style={{
                color: activa ? BLUE : hecha ? '#6B6BA8' : '#A9A6CE',
                fontSize: activa ? 16 : 15,
              }}
            >
              {p}
            </span>
          </Fila>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Columna lateral de escritorio ── */
export function FormAside({ title, subtitle, phases, currentPhase, onGoTo }) {
  return (
    <aside className="hidden lg:flex w-[34%] max-w-md flex-col items-center bg-[#F3F2F9] px-10 py-12">
      <Image src="/LogotipoSquatfit.png" width={88} height={88} alt="Squad Fit" className="mb-10" />
      {title && <p className="text-[#8B87C9] font-bold mb-2 text-center">{title}</p>}
      {subtitle && <p className="text-[#A9A6CE] text-sm font-semibold mb-8 text-center">{subtitle}</p>}
      <div className="w-full max-w-[240px] mt-2">
        <PhasesList phases={phases} currentPhase={currentPhase} onGoTo={onGoTo} />
      </div>
    </aside>
  );
}

/* ── Panel lateral de móvil: mismo gesto que el carrito ── */
export function StepsDrawer({ open, onClose, title, subtitle, phases, currentPhase, index, total, onGoTo }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Pasos del formulario">
      <div className="absolute inset-0 bg-[#171A57]/40 backdrop-blur-[2px] sf-backdrop" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-[86%] max-w-sm bg-white shadow-2xl sf-drawer flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <p className="font-extrabold text-lg" style={{ color: BLUE }}>{title || 'Tus pasos'}</p>
            <p className="text-[#8B87C9] text-sm font-semibold mt-0.5">
              {subtitle || `Pregunta ${index + 1} de ${total}`}
            </p>
          </div>
          <ExitButton onClick={onClose} label="Cerrar" />
        </div>
        <div className="px-6 pb-8 overflow-y-auto">
          <PhasesList
            phases={phases}
            currentPhase={currentPhase}
            onGoTo={onGoTo ? (p) => { onGoTo(p); onClose(); } : undefined}
          />
          {typeof onGoTo === 'function' && (
            <p className="text-[#B4B1D6] text-xs font-semibold mt-6">
              Toca una sección ya completada para volver a ella.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
