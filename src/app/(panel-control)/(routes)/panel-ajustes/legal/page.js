'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { LEGAL_SECTIONS } from '@/app/components/LegalContent'
import BrandTabs from '@/app/components/BrandTabs'

// «Legal» vive dentro de Ajustes (spec programas TMV). Usa el módulo legal
// compartido con la web pública /politicas para mostrar exactamente lo mismo.
// Acepta ?seccion=<id> para abrir directamente una pestaña (p. ej. privacidad).
function LegalPageContent() {
  const seccion = useSearchParams().get('seccion')
  const [activeTab, setActiveTab] = useState(
    LEGAL_SECTIONS.some((s) => s.id === seccion) ? seccion : LEGAL_SECTIONS[0]?.id
  )
  const tabs = LEGAL_SECTIONS.map((s) => ({ id: s.id, label: s.label }))
  const Active = LEGAL_SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/panel-ajustes"
          className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#FF690B] transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Ajustes
        </Link>
        <h1 className="text-3xl font-extrabold text-[#363C98] mb-6">Legal</h1>

        <BrandTabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-8" />

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 text-gray-800 leading-relaxed min-h-[500px]">
          {Active && <Active />}
        </section>
      </div>
    </div>
  )
}

export default function LegalPage() {
  return (
    <Suspense fallback={null}>
      <LegalPageContent />
    </Suspense>
  )
}
