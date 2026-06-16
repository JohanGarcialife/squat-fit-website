'use client'
import Image from 'next/image'
import React from 'react'

export default function FourPillars() {
  return (
    <div className='relative w-screen lg:flex lg:flex-row flex-col justify-center px-4 lg:px-10 py-20 bg-[#FFF9F2]'>
      <div className='w-full max-w-7xl mx-auto'>
        <h2 className='text-[#FF690B] text-4xl md:text-5xl font-bold text-center mb-16'>
          Los 4 pilares del programa
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 items-start'>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/nutrition.png" width={120} height={120} alt='Nutrición' className='mb-6' />
            <p className='text-[#FF690B] text-2xl font-bold mb-2'>
              Dieta
            </p>
            <p className='text-[#FF690B] text-lg font-medium'>
              Aprende a adaptar tu alimentación a tu día a día.
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/running.png" width={120} height={120} alt='Entrenamiento' className='mb-6' />
            <p className='text-[#FF690B] text-2xl font-bold mb-2'>
              Entreno
            </p>
            <p className='text-[#FF690B] text-lg font-medium'>
              Una estructura clara para progresar en tu casa o gimnasio
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/speech.png" width={120} height={120} alt='Comunidad' className='mb-6' />
            <p className='text-[#FF690B] text-2xl font-bold mb-2'>
              Seguimiento
            </p>
            <p className='text-[#FF690B] text-lg font-medium'>
              Mentoría y comunidad que te acompaña en el proceso
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <Image src="/icons/human-brain.png" width={120} height={120} alt='Mentalidad' className='mb-6' />
            <p className='text-[#FF690B] text-2xl font-bold mb-2'>
              Mentalidad
            </p>
            <p className='text-[#FF690B] text-lg font-medium'>
              Herramientas psicológicas para sostener el cambio
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
