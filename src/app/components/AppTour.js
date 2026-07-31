'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import useWindowSize from '@/hooks/UseWindowSize';
import HomeIcon from './icons/HomeIcon';
import StarIcon from './icons/StarIcon';
import BarbellIcon from './icons/BarbellIcon';
import AppleIcon from './icons/AppleIcon';
import SchoolIcon from './icons/SchoolIcon';
import SettingsIcon from './icons/SettingsIcon';

// ─── TOUR DE BIENVENIDA DEL PANEL ────────────────────────────────────────────
// Overlay con spotlight sobre los items del Sidebar (anclados por data-tour).
// Se muestra UNA vez a usuarios logados (flag en localStorage) y puede
// relanzarse desde Ajustes disparando el evento TOUR_EVENT.
//
// En escritorio (>= lg) señala directamente a los items del Sidebar, que
// están visibles. En móvil el Sidebar vive dentro de un cajón CERRADO, así
// que señalar a un elemento invisible no tiene sentido: ahí el tour se
// convierte en un carrusel a pantalla completa (ver MobileTourCarousel),
// con el mismo SVG que usa el Sidebar para cada sección (sin arte nuevo).

export const TOUR_DONE_KEY = 'sf-app-tour-done';
export const TOUR_EVENT = 'sf-app-tour-start';

// Pasos en el orden de la spec. `tour` = valor de data-tour en el Sidebar.
// `Icon` = MISMO componente que usa el Sidebar para esa sección (MENU_ITEMS),
// reutilizado tal cual para el carrusel móvil.
const STEPS = [
  {
    tour: 'inicio',
    label: 'Inicio',
    text: 'Tu punto de partida: un vistazo rápido a tus formaciones y novedades cada vez que entras.',
    Icon: HomeIcon,
  },
  {
    tour: 'mi-programa',
    label: 'Mi programa',
    text: 'Tu programa Tu Mejor Versión: plan, seguimiento con tu coach, progreso y recursos.',
    Icon: StarIcon,
  },
  {
    tour: 'mi-entreno',
    label: 'Mi entreno',
    text: 'Tu rutina de entrenamiento, con la técnica de cada ejercicio y tu rendimiento.',
    Icon: BarbellIcon,
  },
  {
    tour: 'mi-cocina',
    label: 'Mi cocina',
    text: 'Tu pauta de alimentación, recetas y alternativas para que comer bien sea fácil.',
    Icon: AppleIcon,
  },
  {
    tour: 'mis-cursos',
    label: 'Mis cursos',
    text: 'Todas tus formaciones: clases en vídeo, tests y tu progreso en cada curso.',
    Icon: SchoolIcon,
  },
  {
    tour: 'ajustes',
    label: 'Ajustes',
    text: 'Tu cuenta, facturación, notificaciones y más. Desde aquí puedes repetir este tour cuando quieras.',
    Icon: SettingsIcon,
  },
];

// ─── Carrusel a pantalla completa (solo móvil) ───────────────────────────────
// Swipe (touch) + botones anterior/siguiente + paginación por puntos +
// cierre explícito, para que funcione también sin gestos (accesibilidad).
function MobileTourCarousel({ steps, index, setIndex, close, next }) {
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const touchStartX = useRef(null);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, [setIndex]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const THRESHOLD = 40;
    if (dx < -THRESHOLD) next();
    else if (dx > THRESHOLD) prev();
  };

  const Icon = step.Icon;

  return (
    <div
      className="fixed inset-0 z-[130] bg-white flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Tour de bienvenida"
    >
      {/* Cerrar */}
      <div className="flex justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar tour"
          className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Slide: icono + nombre + descripción de la sección. El icono es el
          hueco pendiente de diseño: mismo SVG del menú, sin arte nuevo. */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-28 h-28 rounded-[32px] bg-[#FFF6F0] flex items-center justify-center mb-8">
          {Icon && <Icon filled width={48} height={48} />}
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF690B] mb-2">
          {index + 1} de {steps.length}
        </span>
        <h3 className="text-[#363C98] font-extrabold text-2xl mb-3">{step.label}</h3>
        <p className="text-slate-500 text-base leading-relaxed max-w-sm">{step.text}</p>
      </div>

      {/* Paginación por puntos, también pulsable */}
      <div className="flex items-center justify-center gap-2 pb-6" role="tablist" aria-label="Progreso del tour">
        {steps.map((s, i) => (
          <button
            key={s.tour}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir al paso ${i + 1}: ${s.label}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all cursor-pointer ${i === index ? 'w-6 bg-[#FF690B]' : 'w-2 bg-[#FF690B]/25'}`}
          />
        ))}
      </div>

      {/* Anterior / Saltar / Siguiente, para quien no use el swipe */}
      <div
        className="flex items-center justify-between gap-3 px-6"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          aria-label="Paso anterior"
          className="text-slate-400 hover:text-slate-600 disabled:opacity-0 disabled:pointer-events-none font-bold text-sm px-2 py-3 transition-colors cursor-pointer"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={close}
          className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-3 transition-colors cursor-pointer"
        >
          Saltar
        </button>
        <button
          type="button"
          onClick={next}
          className="bg-[#FF690B] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#e05b08] active:scale-95 transition-all cursor-pointer"
        >
          {isLast ? 'Terminar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}

const markDone = () => {
  try { localStorage.setItem(TOUR_DONE_KEY, '1'); } catch { /* sin storage */ }
};

// Elemento visible (el Sidebar renderiza el nav dos veces: escritorio y
// drawer móvil; en móvil ninguno es visible con el drawer cerrado).
function findVisibleAnchor(tour) {
  if (typeof document === 'undefined') return null;
  const nodes = document.querySelectorAll(`[data-tour="${tour}"]`);
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth) return el;
  }
  return null;
}

export default function AppTour() {
  const { token } = useAuthStore();
  const { width } = useWindowSize();
  // Mismo corte que el resto del panel (Header/Sidebar usan lg = 1024px).
  // Mientras `width` es undefined (primer render) se trata como móvil, igual
  // que hace Header.js, para no arrancar mostrando el spotlight de escritorio.
  const isMobile = !(width >= 1024);
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState(STEPS);
  const [index, setIndex] = useState(0);
  // rect del ancla del paso actual (solo escritorio); null → sin spotlight.
  const [rect, setRect] = useState(null);
  const startedRef = useRef(false);

  const start = useCallback(() => {
    // Solo los pasos cuya pestaña existe en el Sidebar (algunas se ocultan
    // según los accesos del usuario: Mi programa / Mi entreno).
    const available = STEPS.filter(
      (s) => document.querySelector(`[data-tour="${s.tour}"]`) !== null,
    );
    setSteps(available.length > 0 ? available : STEPS);
    setIndex(0);
    setActive(true);
  }, []);

  const close = useCallback(() => {
    markDone();
    setActive(false);
  }, []);

  // Arranque automático: una sola vez por usuario (flag en localStorage).
  // El pequeño retraso deja que useProgramAccess resuelva qué pestañas
  // se muestran antes de fotografiar el menú.
  useEffect(() => {
    if (!token || startedRef.current) return;
    let done = false;
    try { done = localStorage.getItem(TOUR_DONE_KEY) === '1'; } catch { done = true; }
    if (done) return;
    startedRef.current = true;
    const t = setTimeout(start, 1200);
    return () => clearTimeout(t);
  }, [token, start]);

  // Relanzamiento desde Ajustes.
  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [start]);

  // Mide el ancla del paso actual y sigue resize/scroll. Solo hace falta en
  // escritorio: en móvil el carrusel a pantalla completa no señala nada.
  useEffect(() => {
    if (!active || isMobile) return;
    const step = steps[index];
    if (!step) return;
    const measure = () => {
      const el = findVisibleAnchor(step.tour);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, index, steps]);

  // Bloquea el scroll de fondo mientras el tour está abierto.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  if (!active || steps.length === 0) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const next = () => (isLast ? close() : setIndex((i) => i + 1));

  // Móvil: carrusel a pantalla completa (decisión de Hamlet, opción b). En
  // escritorio sigue el spotlight de abajo, que ahí sí funciona.
  if (isMobile) {
    return (
      <MobileTourCarousel steps={steps} index={index} setIndex={setIndex} close={close} next={next} />
    );
  }

  // Padding del spotlight alrededor del item del menú.
  const PAD = 8;
  const spot = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  // Tooltip anclado a la derecha del item (el Sidebar vive a la izquierda),
  // con la vertical sujeta al viewport para que nunca se salga.
  const TOOLTIP_W = 300;
  let tooltipStyle = null;
  let arrowTop = null;
  if (spot) {
    const centerY = spot.top + spot.height / 2;
    const clampedY = Math.min(Math.max(centerY, 110), window.innerHeight - 110);
    tooltipStyle = {
      position: 'fixed',
      left: Math.min(spot.left + spot.width + 14, window.innerWidth - TOOLTIP_W - 16),
      top: clampedY,
      transform: 'translateY(-50%)',
      width: TOOLTIP_W,
    };
    // La flecha apunta al centro real del item aunque el tooltip se haya sujetado.
    arrowTop = `calc(50% + ${Math.round(centerY - clampedY)}px)`;
  }

  const card = (
    <div
      className="bg-white rounded-3xl shadow-2xl p-5 relative max-w-[calc(100vw-32px)]"
      style={tooltipStyle || { width: TOOLTIP_W }}
    >
      {spot && (
        <span
          aria-hidden="true"
          className="absolute -left-2 w-4 h-4 bg-white rotate-45 rounded-[3px]"
          style={{ top: arrowTop, transform: 'translateY(-50%) rotate(45deg)' }}
        />
      )}
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF690B]">
        {index + 1} de {steps.length}
      </span>
      <h3 className="text-[#363C98] font-extrabold text-lg mt-1 mb-1.5">{step.label}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{step.text}</p>
      <div className="flex items-center justify-between gap-3 mt-4">
        <button
          type="button"
          onClick={close}
          className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors cursor-pointer"
        >
          Saltar
        </button>
        <button
          type="button"
          onClick={next}
          className="bg-[#FF690B] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#e05b08] active:scale-95 transition-all cursor-pointer"
        >
          {isLast ? 'Terminar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[130]" role="dialog" aria-modal="true" aria-label="Tour de bienvenida">
      {spot ? (
        <>
          {/* Spotlight: el box-shadow gigante oscurece todo lo demás. */}
          <div
            className="fixed rounded-2xl pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)',
              border: '2px solid #FF690B',
            }}
          />
          {/* Capa que bloquea la interacción con el fondo. */}
          <div className="absolute inset-0" onClick={next} />
          {card}
        </>
      ) : (
        /* Salvavidas en escritorio: si por lo que sea no se encuentra el
           ancla del paso (p.ej. durante un resize), tooltip centrado en vez
           de señalar a la nada. El móvil ya no pasa por aquí (ver arriba). */
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-4" onClick={next}>
          <div onClick={(e) => e.stopPropagation()}>{card}</div>
        </div>
      )}
    </div>
  );
}
