'use client'
import Image from 'next/image'
import React from 'react'
import CountUp from '../../../../components/CountUp'

export default function HeroSection() {

  return (
    <div className='px-6 md:px-24 flex flex-col md:flex-row justify-center items-center py-12 md:py-24 gap-10 md:gap-0'>

        <div className='md:pl-14 md:w-1/2 flex flex-col items-center md:items-start'>
        <div className='flex items-center gap-4'>
            <span className='w-8 sm:w-20 h-[2px] bg-primary rounded-full'></span>
            <p className='text-primary font-bold tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap text-center'>Colección completa</p>
            <span className='w-8 sm:w-20 h-[2px] bg-primary rounded-full'></span>
        </div>

        <h2 className='font-bold text-secondary text-center md:text-start text-4xl sm:text-6xl md:text-8xl my-6 md:my-8 leading-tight'>La Cocina Squad Fit 1 y 2</h2>
        <p className='text-primary text-2xl sm:text-3xl md:text-4xl max-w-[580px] font-bold mb-4 md:mb-8 text-center md:text-start'>Recetas fit con sabor real</p>
        <p className='text-black text-lg sm:text-xl md:text-3xl md:text-start text-center max-w-[520px] mb-4 leading-relaxed'>Una biblioteca <span className='text-primary font-bold'>en constante crecimiento</span> con más de 155 recetas fáciles, saciantes y deliciosas para comer sano sin restricciones.</p>
        <p className='text-black text-base sm:text-lg md:text-xl md:text-start text-center max-w-[520px] mb-8 font-medium'>Incluye los volúmenes 1 y 2, con el volumen 3 ya en camino y mucho más contenido por venir.</p>

        {/* Cifras: siempre en fila de 3, como en el hero de la home */}
        <div className='flex flex-row items-start justify-center md:justify-start gap-6 sm:gap-10 w-full'>
          <div className='text-center max-w-[110px] sm:max-w-[150px]'>
            <CountUp value={150} step={5} format={(v) => `+${Math.round(v)}`} className='text-secondary font-bold text-3xl sm:text-4xl' />
            <p className='text-secondary text-sm sm:text-base'>Recetas para repetir</p>
          </div>
          <div className='text-center max-w-[110px] sm:max-w-[150px]'>
            <CountUp value={2} popSteps popStepMs={700} className='text-secondary font-bold text-3xl sm:text-4xl' />
            <p className='text-secondary text-sm sm:text-base'>Volúmenes (y sumando)</p>
          </div>
          <div className='text-center max-w-[110px] sm:max-w-[150px]'>
            <CountUp value={100} step={5} format={(v) => `${Math.round(v)}%`} className='text-secondary font-bold text-3xl sm:text-4xl' />
            <p className='text-secondary text-sm sm:text-base'>Con sus macros incluidos</p>
          </div>
        </div>
      </div>

        <div className="md:w-1/2 w-full flex justify-center">
          <Image src="/cocinaHero.png" width={700} height={700} alt='Cooking book' priority className='w-full max-w-[420px] md:max-w-none h-auto' />
        </div>
    </div>
  )
}
