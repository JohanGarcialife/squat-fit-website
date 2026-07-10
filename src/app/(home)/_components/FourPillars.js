'use client'
import Image from 'next/image'
import React from 'react'
import useInView from '@/hooks/useInView'

const PILLARS = [
  {
    src: '/icons/nutrition.png',
    alt: 'Nutrición',
    title: 'Dieta',
    text: 'Aprende a adaptar tu alimentación a tu día a día.',
  },
  {
    src: '/icons/running.png',
    alt: 'Entrenamiento',
    title: 'Entreno',
    text: 'Una estructura clara para progresar en tu casa o gimnasio',
  },
  {
    src: '/icons/speech.png',
    alt: 'Comunidad',
    title: 'Seguimiento',
    text: 'Mentoría y comunidad que te acompaña en el proceso',
  },
  {
    src: '/icons/human-brain.png',
    alt: 'Mentalidad',
    title: 'Mentalidad',
    text: 'Herramientas psicológicas para sostener el cambio',
  },
]

function PillarItem({ src, alt, title, text, index }) {
  const [ref, visible] = useInView()
  // Escalonado entre tarjetas (en móvil cada una entra al hacer scroll)
  const delay = index * 120

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${visible ? delay : 0}ms` }}
      className={`flex flex-col items-center text-center transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* 1º: icono con rebote */}
      <div
        style={{ transitionDelay: `${visible ? delay + 100 : 0}ms` }}
        className={`mb-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        <Image src={src} width={120} height={120} alt={alt} />
      </div>
      {/* 2º: título */}
      <p
        style={{ transitionDelay: `${visible ? delay + 250 : 0}ms` }}
        className={`text-[#FF690B] text-2xl font-bold mb-2 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {title}
      </p>
      {/* 3º: cuerpo */}
      <p
        style={{ transitionDelay: `${visible ? delay + 400 : 0}ms` }}
        className={`text-[#FF690B] text-lg font-medium max-w-[260px] mx-auto transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {text}
      </p>
    </div>
  )
}

export default function FourPillars() {
  return (
    <div className='relative w-screen lg:flex lg:flex-row flex-col justify-center px-8 lg:px-10 py-20 bg-[#FFF9F2]'>
      <div className='w-full max-w-7xl mx-auto'>
        <h2 className='text-[#FF690B] text-4xl md:text-5xl font-bold text-center mb-16'>
          Los 4 pilares del programa
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 items-start'>
          {PILLARS.map((pillar, i) => (
            <PillarItem key={pillar.title} {...pillar} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
