'use client'

import React, { useState } from 'react'
import { LEGAL_SECTIONS } from '@/app/components/LegalContent'
import BrandTabs from '@/app/components/BrandTabs'

export default function Page() {
  const [activeTab, setActiveTab] = useState(LEGAL_SECTIONS[0].id)
  const Active = LEGAL_SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <main className="w-full px-4 sm:px-6 lg:px-16 py-10 font-sans">
      {/* Submenú de marca (mismo formato en toda la web y el panel) */}
      <BrandTabs
        tabs={LEGAL_SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-10"
      />

      <section className="text-gray-800 leading-relaxed min-h-[500px]">
        {Active && <Active />}
      </section>
    </main>
  )
}
