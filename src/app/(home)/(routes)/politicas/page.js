'use client'

import React, { useState, useEffect } from 'react'
import { LEGAL_SECTIONS } from '@/app/components/LegalContent'
import BrandTabs from '@/app/components/BrandTabs'
import { Sheet } from '../../_components/aboutStyles'

export default function Page() {
  const [activeTab, setActiveTab] = useState(LEGAL_SECTIONS[0].id)

  // Enlace directo a un apartado: /politicas?tab=cookies (también #cookies)
  useEffect(() => {
    const wanted =
      new URLSearchParams(window.location.search).get('tab') ||
      window.location.hash.replace('#', '')
    if (wanted && LEGAL_SECTIONS.some((s) => s.id === wanted)) setActiveTab(wanted)
  }, [])
  const Active = LEGAL_SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <Sheet>
      {/* Barra de navegación de los apartados legales, arriba del todo */}
      <BrandTabs
        tabs={LEGAL_SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />
      <section className="text-gray-800 leading-relaxed min-h-[400px]">
        {Active && <Active />}
      </section>
    </Sheet>
  )
}
