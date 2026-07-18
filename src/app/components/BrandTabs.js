'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

/**
 * SUBMENÚ DE MARCA — el único formato de submenú de Squad Fit.
 *
 * Pestañas ligeras con indicador inferior: la activa en naranja con su barra
 * debajo, el resto en azul.
 *
 * Si no caben todas, el submenú se desliza (con el táctil o arrastrando con el
 * ratón) y aparece un fade a blanco con una flecha gris a la derecha para avisar
 * de que hay más pestañas ocultas. Al deslizar, el fade salta al lado contrario.
 *
 * Las clases visuales viven también en globals.css (.sf-tab / .sf-tab-active).
 */
export default function BrandTabs({ tabs, active, onChange, className = '' }) {
  const scrollerRef = useRef(null)
  const [overflowRight, setOverflowRight] = useState(false)
  const [overflowLeft, setOverflowLeft] = useState(false)
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false })

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setOverflowRight(el.scrollLeft < max - 2)
    setOverflowLeft(el.scrollLeft > 2)
  }, [])

  useEffect(() => {
    update()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update, tabs])

  // Arrastrar con el ratón para deslizar el submenú (el táctil ya se desliza solo).
  const onMouseDown = (e) => {
    const el = scrollerRef.current
    if (!el) return
    drag.current = { down: true, startX: e.pageX, startScroll: el.scrollLeft, moved: false }
  }
  const onMouseMove = (e) => {
    const el = scrollerRef.current
    if (!el || !drag.current.down) return
    const dx = e.pageX - drag.current.startX
    if (Math.abs(dx) > 3) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
  }
  const endDrag = () => { drag.current.down = false }
  // Si el gesto fue un arrastre, no dispares el cambio de pestaña.
  const handleTab = (id) => () => {
    if (drag.current.moved) { drag.current.moved = false; return }
    onChange(id)
  }

  return (
    <nav className={`relative w-full border-b border-slate-200 ${className}`} aria-label="Submenú">
      <div
        ref={scrollerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="flex gap-0 sm:gap-6 overflow-x-auto no-scrollbar -mb-px select-none cursor-grab active:cursor-grabbing"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={handleTab(tab.id)}
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

      {/* Fade a blanco + flecha gris: avisa de que hay más pestañas a la derecha */}
      {overflowRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-[1px] flex items-center pl-10 pr-1 bg-gradient-to-l from-white via-white to-transparent">
          <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      )}
      {/* Al deslizar, un fade suave a la izquierda */}
      {overflowLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-[1px] w-8 bg-gradient-to-r from-white to-transparent" />
      )}
    </nav>
  )
}
