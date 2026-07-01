'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Columna Logo */}
        <div className="flex flex-col space-y-4">
          <Link href="/" className="inline-block">
            <div className="text-4xl lg:text-5xl font-black tracking-wider leading-none">
              <span className="text-[#363C98]">SQUAT</span>
              <span className="text-[#FF690B]">FIT</span>
            </div>
          </Link>
        </div>

        {/* Columna 1: Nuestros Cursos */}
        <div>
          <h4 className="text-[#363C98] font-bold text-lg mb-6">Nuestros cursos</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/cursos" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Curso de la mujer
              </Link>
            </li>
            <li>
              <Link href="/cocina" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Libros de Cocina
              </Link>
            </li>
            <li>
              <Link href="/cursos" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Fuerte y Definid@
              </Link>
            </li>
            <li>
              <Link href="/cursos" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Entrena en Casa
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 2: Squat Fit */}
        <div>
          <h4 className="text-[#363C98] font-bold text-lg mb-6">Squat Fit</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/nosotros" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/politicas" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Políticas
              </Link>
            </li>
            <li>
              <Link href="/panel-contacto" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Otros */}
        <div>
          <h4 className="text-[#363C98] font-bold text-lg mb-6">Otros</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/profile-panel" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Mi Cuenta
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Iniciar Sesión
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Registrarme
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-[#FF690B] font-medium text-base hover:text-[#363C98] transition-colors">
                Carrito
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Squat Fit. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
