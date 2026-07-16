'use client'

import React from 'react'

/**
 * SUBMENÚ DE MARCA — el único formato de submenú de Squad Fit.
 *
 * Pestañas ligeras con indicador inferior: la activa en naranja con su barra
 * debajo, el resto en azul. Sustituye a los formatos que había sueltos
 * (pestañas tipo "carpeta" en Nosotros/Políticas y píldoras en el panel).
 *
 * En móvil las pestañas van más juntas (menos espacio horizontal) y con scroll
 * lateral si no caben.
 *
 * Uso:
 *   <BrandTabs
 *     tabs={[{ id: 'a', label: 'La empresa' }, ...]}
 *     active={activeTab}
 *     onChange={setActiveTab}
 *   />
 *
 * Las clases visuales viven también en globals.css (.sf-tab / .sf-tab-active)
 * para poder replicar el mismo submenú fuera de React (p. ej. el back office).
 */
export default function BrandTabs({ tabs, active, onChange, className = '' }) {
  return (
    <nav className={`w-full border-b border-slate-200 ${className}`} aria-label="Submenú">
      {/* -mb-px: la barra de la pestaña activa se come la línea inferior.
          En móvil van pegadas y con letra menor para que quepan sin scroll. */}
      <div className="flex gap-0 sm:gap-6 overflow-x-auto no-scrollbar -mb-px">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`whitespace-nowrap px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-base transition-colors cursor-pointer border-b-[3px] ${
                isActive
                  ? 'text-[#FF690B] border-[#FF690B] font-bold'
                  : 'text-[#3932C0] border-transparent font-semibold hover:text-[#FF690B]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
