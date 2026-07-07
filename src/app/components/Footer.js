'use client';

import React from 'react';
import Link from 'next/link';

const LINK_CLASS = 'text-[#FF690B] font-medium text-[13px] sm:text-base leading-snug sm:leading-relaxed hover:text-[#363C98] transition-colors';
const HEADING_CLASS = 'text-[#363C98] font-bold text-[15px] sm:text-lg leading-snug mb-4 sm:mb-6';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-16 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-12">
        {/* Logo: fila propia centrada en móvil, primera columna en escritorio */}
        <div className="flex justify-center lg:justify-start lg:w-1/4 mb-10 lg:mb-0">
          <Link href="/" className="inline-block">
            <div className="text-4xl lg:text-5xl font-black tracking-wider leading-none">
              <span className="text-[#363C98]">SQUAT</span>
              <span className="text-[#FF690B]">FIT</span>
            </div>
          </Link>
        </div>

        {/* Las 3 columnas de enlaces: también 3 en móvil, con aire entre ellas */}
        <div className="flex-1 grid grid-cols-3 gap-6 sm:gap-12 lg:gap-16 text-center sm:text-left">
          {/* Columna 1: Nuestros Cursos */}
          <div>
            <h4 className={HEADING_CLASS}>Nuestros cursos</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/cursos" className={LINK_CLASS}>Curso de la mujer</Link></li>
              <li><Link href="/cocina" className={LINK_CLASS}>Libros de Cocina</Link></li>
              <li><Link href="/cursos" className={LINK_CLASS}>Fuerte y Definid@</Link></li>
              <li><Link href="/cursos" className={LINK_CLASS}>Entrena en Casa</Link></li>
            </ul>
          </div>

          {/* Columna 2: Squat Fit */}
          <div>
            <h4 className={HEADING_CLASS}>Squat Fit</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/nosotros" className={LINK_CLASS}>Nosotros</Link></li>
              <li><Link href="/politicas" className={LINK_CLASS}>Políticas</Link></li>
              <li><Link href="/contacto" className={LINK_CLASS}>Contacto</Link></li>
            </ul>
          </div>

          {/* Columna 3: Otros */}
          <div>
            <h4 className={HEADING_CLASS}>Otros</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/profile-panel" className={LINK_CLASS}>Mi Cuenta</Link></li>
              <li><Link href="/login" className={LINK_CLASS}>Iniciar Sesión</Link></li>
              <li><Link href="/register" className={LINK_CLASS}>Registrarme</Link></li>
              <li><Link href="/cart" className={LINK_CLASS}>Carrito</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Squat Fit. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
