'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * Piezas compartidas de las zonas del programa del panel del cliente
 * (Mi programa, Mi entreno y la sección Mi pauta de Mi cocina).
 * Antes vivían solo en mi-programa/page.js; al repartir el contenido en
 * varias pestañas se extraen aquí para mantener un único estilo.
 */

export const CARD = 'bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm'

// Encabezado de cada sub-sección dentro de una pestaña.
export function SectionCard({ Icon, title, children }) {
  return (
    <section className={CARD + ' space-y-4'}>
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><Icon className="w-6 h-6" /></div>
        <h3 className="text-[#363C98] font-extrabold text-xl">{title}</h3>
      </div>
      {children}
    </section>
  )
}

// Estado vacío honesto para las áreas cuyo backend aún no existe: cuando el
// coach publique el contenido real, se sustituye por los datos; mientras
// tanto NO se muestra nada inventado.
export function EmptyState({ text, hint }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1 mb-3">
        En preparación
      </span>
      <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
      {hint && <p className="text-slate-400 text-xs leading-relaxed mt-2">{hint}</p>}
    </div>
  )
}

// Fila-enlace reutilizable (a formularios, Mi entreno, Mi cocina, contacto…).
export function LinkRow({ href, Icon, title, desc }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:border-[#FF690B]/40 transition-all group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-2 bg-[#FFF6F0] rounded-xl shrink-0">
          <Icon className="text-[#FF690B] w-6 h-6" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-[#363C98] truncate">{title}</h4>
          {desc && <p className="text-slate-400 text-sm truncate">{desc}</p>}
        </div>
      </div>
      <ChevronRight className="text-slate-300 w-5 h-5 shrink-0 group-hover:text-[#FF690B] transition-colors" />
    </Link>
  )
}
