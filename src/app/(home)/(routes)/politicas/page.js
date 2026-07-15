'use client'

import React, { useState } from 'react'
import { LEGAL_SECTIONS } from '@/app/components/LegalContent'

export default function Page() {
  const [activeTab, setActiveTab] = useState(LEGAL_SECTIONS[0].id)
  const Active = LEGAL_SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <main className="w-full px-4 sm:px-6 lg:px-16 py-10 font-sans">
      {/* Navegación tipo carpeta; scroll horizontal en móvil si no caben */}
      <nav className="flex items-end border-orange-500 w-full overflow-x-auto no-scrollbar mb-10">
        {LEGAL_SECTIONS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-6 py-3 text-base sm:text-lg font-medium transition-all duration-200 rounded-t-2xl
                ${isActive
                  ? 'text-orange-500 bg-white border-t-2 border-l-2 border-r-2 border-orange-500 -mb-[2px] z-10 font-bold'
                  : 'text-[#3B3B98] hover:text-blue-800 mb-0 border-b-2 w-full border-primary'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      <section className="text-gray-800 leading-relaxed min-h-[500px]">
        {Active && <Active />}
      </section>
    </main>
  )
}
