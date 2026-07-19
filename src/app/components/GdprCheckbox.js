'use client';

import React from 'react';
import Link from 'next/link';

// Checkbox RGPD obligatorio para todos los formularios de la web y el panel.
// El formulario que lo use debe deshabilitar su botón de enviar si !checked.
// `light`: variante para fondos oscuros (texto blanco).
export default function GdprCheckbox({ checked, onChange, id = 'gdpr', className = '', light = false }) {
  return (
    <label htmlFor={id} className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-1 h-5 w-5 shrink-0 rounded accent-[#FF690B] cursor-pointer"
      />
      <span className={`text-sm leading-snug ${light ? 'text-white/90' : 'text-[#363C98]/80'}`}>
        He leído y acepto la{' '}
        <Link
          href="/politicas?tab=privacidad"
          target="_blank"
          className={`underline font-semibold ${light ? 'text-white hover:text-[#FFEDE0]' : 'text-[#FF690B] hover:text-[#e05b08]'}`}
          onClick={(e) => e.stopPropagation()}
        >
          Política de Privacidad
        </Link>
      </span>
    </label>
  );
}
