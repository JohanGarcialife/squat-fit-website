'use client';

// Botón flotante que aparece por la web cuando alguien dejó un formulario a
// medias. Es la contrapartida de dejarle salir: puede irse a mirar la web sin
// perder nada, y tiene siempre a mano cómo volver a terminarlo.
//
// Vive en el layout de la web pública, no dentro del formulario: justo aparece
// cuando NO estás en él.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';

import { progresoPendiente } from './formProgress';

const BLUE = '#363C98';
const ORANGE = '#FF690B';
const OCULTO_KEY = 'sqf-form-pendiente-oculto';

export default function FormularioPendiente() {
  const path = usePathname();
  const [pendiente, setPendiente] = useState(null);
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    // Se relee en cada cambio de página: si acaba de terminar el formulario,
    // el progreso ya no está y el botón desaparece solo.
    setPendiente(progresoPendiente());
    try {
      setOculto(sessionStorage.getItem(OCULTO_KEY) === '1');
    } catch {
      setOculto(false);
    }
  }, [path]);

  // Dentro del propio formulario no pinta nada.
  const enElFormulario = pendiente?.url && path?.startsWith(pendiente.url);
  if (!pendiente || oculto || enElFormulario) return null;

  const restantes = Math.max(0, (pendiente.total || 0) - (pendiente.indice || 0));

  return (
    <div className="fixed left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 z-[90] flex justify-center sm:justify-end">
      <div
        className="sf-flotante flex items-center gap-3 rounded-2xl bg-white pl-4 pr-2 py-2.5 shadow-xl ring-1 ring-[#E7E6F5] max-w-sm w-full sm:w-auto"
      >
        <Link href={pendiente.url} className="flex items-center gap-3 flex-1 min-w-0 group">
          <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full" style={{ backgroundColor: '#FFF1E7', color: ORANGE }}>
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </span>
          <span className="min-w-0">
            <span className="block font-extrabold text-sm truncate" style={{ color: BLUE }}>
              Termina tu formulario
            </span>
            <span className="block text-xs font-semibold text-[#8B87C9]">
              {restantes > 0 ? `Te quedan ${restantes} preguntas` : 'Lo tienes casi'}
            </span>
          </span>
        </Link>
        <button
          type="button"
          aria-label="Ocultar por ahora"
          onClick={() => {
            // Solo por esta sesión: al volver otro día vuelve a ofrecerse.
            try { sessionStorage.setItem(OCULTO_KEY, '1'); } catch {}
            setOculto(true);
          }}
          className="shrink-0 grid place-items-center w-8 h-8 rounded-full text-[#B4B1D6]
                     hover:bg-[#F3F2F9] hover:text-[#363C98] active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
