'use client'
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() { 
  return (
    <div className='bg-gray-100 text-gray-700 py-8 px-4 sm:px-8 md:px-12 lg:px-20 flex flex-col items-center text-center space-y-4 lg:flex-row lg:justify-between lg:space-y-0'>
        {/* Logo */}
        <Link href="/">
            <Image
                src="/Logo-horizontal.png"
                width={200}
                height={40}
                alt="Logo Squat Fit"
                className='object-contain'
            />
        </Link>

        {/* Enlaces del Footer */}
        <div className='flex flex-col space-y-2 lg:flex-row lg:space-x-8 lg:space-y-0'>
            <Link href="/politicas">
                <p className='text-sm hover:text-primary transition-colors'>Políticas de Privacidad</p>
            </Link>
            <Link href="/nosotros">
                <p className='text-sm hover:text-primary transition-colors'>Sobre Nosotros</p>
            </Link>
            {/* Se puede añadir más enlaces o información aquí */}
        </div>

        {/* Derechos de Autor o Redes Sociales */}
        <div className='text-xs text-gray-500'>
            © {new Date().getFullYear()} Squat Fit. Todos los derechos reservados.
        </div>
    </div>
  )
}
