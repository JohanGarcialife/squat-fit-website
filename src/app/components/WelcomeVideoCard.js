'use client';

import React, { useState, useEffect } from 'react';
import { PlaySquare, X, RotateCcw } from 'lucide-react';

// ─── VÍDEO DE BIENVENIDA DEL PROGRAMA ────────────────────────────────────────
// Pegar aquí la URL de Bunny (iframe.mediadelivery.net/embed/... o /play/...);
// si está vacía la tarjeta muestra un placeholder elegante de «próximamente»
// SIN romper nada.
const WELCOME_VIDEO_URL = '';

// Igual que en Mis cursos: normaliza la URL de Bunny para el iframe
// (endpoint /embed/ + responsive=true).
const addBunnyParams = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('responsive')) u.searchParams.set('responsive', 'true');
    if (u.pathname.includes('/play/')) u.pathname = u.pathname.replace('/play/', '/embed/');
    return u.toString();
  } catch {
    return url;
  }
};

const DISMISS_KEY = 'sf-welcome-video-dismissed';

/**
 * Saludo en el género de quien mira. Aquí ponía «Bienvenido/a», que es la
 * solución de formulario administrativo: nadie habla así, y en la primera
 * pantalla del programa que acabas de comprar chirría.
 *
 * Sin dato conocido se usa el masculino genérico — decidido así a propósito:
 * es lo que menos ruido hace mientras no tengamos el sexo de todos los
 * clientes antiguos.
 */
export function saludoDeBienvenida(gender) {
  return String(gender ?? '').toLowerCase() === 'female' ? 'Bienvenida' : 'Bienvenido';
}

/**
 * Tarjeta de bienvenida al programa (solo se monta con programa activo).
 * Descartable: guarda el flag en localStorage y deja un enlace pequeño
 * «Ver de nuevo» para recuperarla.
 */
export default function WelcomeVideoCard({ gender } = {}) {
  // null = aún sin leer localStorage (evita el desajuste SSR/cliente).
  const [dismissed, setDismissed] = useState(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed === null) return null;

  if (dismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            try { localStorage.removeItem(DISMISS_KEY); } catch { /* sin storage */ }
            setDismissed(false);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FF690B] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ver de nuevo el vídeo de bienvenida
        </button>
      </div>
    );
  }

  const src = addBunnyParams(WELCOME_VIDEO_URL);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B] shrink-0">
            <PlaySquare className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[#363C98] font-extrabold text-lg sm:text-xl leading-tight">
              {saludoDeBienvenida(gender)} a tu programa 👋
            </h2>
            <p className="text-slate-400 text-sm">
              Empieza por aquí: cómo sacar el máximo partido a tu programa.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* sin storage */ }
            setDismissed(true);
          }}
          aria-label="Ocultar el vídeo de bienvenida"
          className="shrink-0 p-1.5 rounded-full text-slate-300 hover:text-[#FF690B] hover:bg-[#FFF6F0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {src ? (
        <div className="w-full aspect-video rounded-[20px] overflow-hidden shadow-lg">
          <iframe
            src={src}
            className="w-full h-full block"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title="Vídeo de bienvenida a tu programa"
            style={{ border: 'none' }}
          />
        </div>
      ) : (
        /* Placeholder «próximamente» mientras no haya URL de Bunny. */
        <div className="w-full aspect-video rounded-[20px] bg-gradient-to-br from-[#363C98] to-[#363C98] flex flex-col items-center justify-center text-center px-6 gap-3">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF690B" aria-hidden="true">
              <polygon points="6 3 21 12 6 21 6 3" />
            </svg>
          </div>
          <p className="text-white font-extrabold text-base sm:text-lg">
            Tu vídeo de bienvenida estará disponible muy pronto
          </p>
          <p className="text-white/60 text-sm max-w-sm">
            Mientras tanto, explora tu plan, tu progreso y tus recursos aquí abajo.
          </p>
        </div>
      )}
    </div>
  );
}
