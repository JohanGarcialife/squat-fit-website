'use client'
import Image from 'next/image'
import React from 'react'

export default function FourPillars() {
  return (
    <div className='relative w-screen lg:flex lg:flex-row flex-col justify-center px-4 lg:px-10 py-20 bg-[#FFF9F2]'>
      <div className='w-full max-w-7xl mx-auto'>
        <h2 className='text-primary text-4xl md:text-5xl font-bold text-center mb-16'>
          4 pilares de tu transformación
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 items-start'>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/nutrition.png" width={120} height={120} alt='Nutrición' className='mb-6' />
            <p className='text-secondary text-xl font-bold'>
              Dieta 100% a tu gusto, sin prohibiciones
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/running.png" width={120} height={120} alt='Entrenamiento' className='mb-6' />
            <p className='text-secondary text-xl font-bold'>
              Entreno adaptado a ti, a tu gimnasio o casa
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/speech.png" width={120} height={120} alt='Comunidad' className='mb-6' />
            <p className='text-secondary text-xl font-bold'>
              Una comunidad para compartir y aprender
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/human-brain.png" width={120} height={120} alt='Mentalidad' className='mb-6' />
            <p className='text-secondary text-xl font-bold'>
              Apoyo psicológico para afianzar hábitos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
