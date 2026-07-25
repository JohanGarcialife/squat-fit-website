'use client';

import React from 'react';

// Semáforo de longitud bajo los campos de párrafo: guía al usuario mientras
// escribe para que su respuesta sea útil al coach sin convertirse en un ensayo.
//
// El objetivo en caracteres se fija PREGUNTA A PREGUNTA (`targetChars` en la
// definición del paso), calculado según lo que sería una buena respuesta a esa
// pregunta concreta. Umbrales: verde al llegar al objetivo, ámbar desde el 45 %
// de ese objetivo, rojo por debajo. Con el campo vacío no se enciende nada y la
// línea se aprovecha para recordar que Enter no envía.

export const DEFAULT_TARGET_CHARS = 120;
const AMBER_RATIO = 0.45;

const LEVELS = {
  low: { color: '#E2626B', label: 'Escribe un poco más' },
  mid: { color: '#E8A33D', label: 'Casi está' },
  ok: { color: '#3CA06A', label: '¡Perfecto!' },
};
const ORDER = ['low', 'mid', 'ok'];

export function textMeterLevel(value, targetChars) {
  const len = String(value || '').trim().length;
  if (len === 0) return 'empty';
  const goal = Math.max(20, targetChars || DEFAULT_TARGET_CHARS);
  if (len < Math.round(goal * AMBER_RATIO)) return 'low';
  if (len < goal) return 'mid';
  return 'ok';
}

export default function TextareaMeter({ value, targetChars }) {
  const level = textMeterLevel(value, targetChars);
  const isEmpty = level === 'empty';

  return (
    <div className="mt-1.5 flex items-center justify-between gap-3 select-none">
      <p
        className="text-xs font-semibold transition-colors"
        style={{ color: isEmpty ? '#B4B1D6' : LEVELS[level].color }}
      >
        {isEmpty ? 'Enter añade una línea · pulsa Continuar para seguir' : LEVELS[level].label}
      </p>
      <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
        {ORDER.map((k) => (
          <span
            key={k}
            className="h-2.5 w-2.5 rounded-full transition-all duration-200"
            style={{
              backgroundColor: LEVELS[k].color,
              opacity: k === level ? 1 : 0.22,
              transform: k === level ? 'scale(1.2)' : 'none',
            }}
          />
        ))}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {isEmpty ? '' : LEVELS[level].label}
      </span>
    </div>
  );
}
