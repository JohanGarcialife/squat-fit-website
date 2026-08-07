'use client'

import React, { useState } from 'react'
import { LEGAL_SECTIONS } from '@/app/components/LegalContent'
import BrandTabs from '@/app/components/BrandTabs'
import usePestanasEnUrl from '@/app/components/pestanasEnUrl'
import { Sheet } from '../../_components/aboutStyles'

const TABS = LEGAL_SECTIONS.map((s) => ({ id: s.id, label: s.label }))

export default function Page() {
  const [activeTab, setActiveTab] = useState(LEGAL_SECTIONS[0].id)

  // Enlace directo a un apartado: /politicas#privacidad (y el ?tab=cookies de
  // siempre, que el ayudante sigue entendiendo).
  const cambiarPestana = usePestanasEnUrl(TABS, setActiveTab)
  const Active = LEGAL_SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <Sheet>
      {/* Barra de navegación de los apartados legales, arriba del todo */}
      <BrandTabs
        tabs={TABS}
        active={activeTab}
        onChange={cambiarPestana}
        className="mb-8"
      />
      <section className="text-gray-800 leading-relaxed min-h-[400px]">
        {Active && <Active />}
      </section>
    </Sheet>
  )
}
