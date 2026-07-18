'use client'

import React from 'react'
import Link from 'next/link'
import { FaLock } from 'react-icons/fa'

/**
 * Aviso de zona con acceso: se muestra EN LUGAR de la página cuando una ruta
 * de cuenta (onboarding, panel del cliente…) se abre sin sesión. Sustituye a
 * la redirección seca a /login, que desconcertaba ("entro y no sale nada").
 *
 * `redirect` es la ruta a la que volver tras iniciar sesión o registrarse
 * (login y register ya arrastran ?redirect entre ellos).
 */
export default function AccessNotice({ redirect = '/panel-control' }) {
  const qs = `?redirect=${encodeURIComponent(redirect)}`
  return (
    <main className="min-h-screen w-full bg-[#F8F9FC] flex items-center justify-center px-5 py-16 font-sans">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-slate-100 shadow-[0_12px_45px_rgba(54,60,152,0.08)] p-8 sm:p-10 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#F1F2FC] flex items-center justify-center">
          <FaLock className="w-7 h-7 text-[#363C98]" aria-hidden="true" />
        </div>
        <h1 className="text-[#363C98] font-bold text-2xl sm:text-[28px] leading-tight mb-3">
          Esta zona requiere acceso
        </h1>
        <p className="text-slate-600 leading-relaxed mb-8">
          Estás a punto de entrar a una parte que requiere acceso. Inicia sesión
          con tu cuenta o créala en un minuto, y te traemos de vuelta aquí.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/login${qs}`}
            className="w-full bg-[#FF690B] hover:bg-[#e55e09] text-white font-bold py-3.5 rounded-2xl transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href={`/register${qs}`}
            className="w-full bg-white border-2 border-[#363C98] text-[#363C98] hover:bg-[#F1F2FC] font-bold py-3.5 rounded-2xl transition-colors"
          >
            Crear mi cuenta
          </Link>
        </div>
        <Link href="/" className="inline-block mt-6 text-sm text-slate-400 hover:text-[#363C98] transition-colors">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
