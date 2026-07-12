'use client';

import React, { useState } from 'react'
import TimelineStepper from './TimelineStepper'
import Image from 'next/image'

// Foto de cada bloque del temario (mismo patrón que el Temario de Cocina:
// al abrir una categoría cambia la imagen de al lado). Se reutilizan los
// mockups que ya había en /public/courses y el hero de cursos.
const stepImages = {
  1: '/cursosheronew.png', // Conceptos básicos: la formación con certificado
  2: '/courses/1.png',     // Nutrición: Curso 1 - Pérdida de grasa
  3: '/courses/2.png',     // Entrenamiento: Curso 2 - Ganar Músculo
  4: '/courses/5.png',     // Resultados: chat de seguimiento del curso
}
const defaultImage = '/cursosheronew.png'

export default function Content() {
  // Estado elevado desde TimelineStepper para poder cambiar la foto
  const [openStep, setOpenStep] = useState(1)
  const handleToggle = (stepNumber) => {
    setOpenStep(openStep === stepNumber ? null : stepNumber)
  }

  const image = stepImages[openStep] || defaultImage

  return (
    <div className='px-3 md:px-32 flex flex-col-reverse md:flex-row items-center justify-center gap-16 py-20'>
        <div className='md:w-1/2 '>
         <TimelineStepper openStep={openStep} onToggle={handleToggle} />
         </div>
        <div className='md:w-1/2 flex flex-col items-center gap-4'>
          <div className='flex items-center gap-4'>
            <span className='w-8 sm:w-20 h-[2px] bg-primary rounded-full'></span>
            <p className='font-bold text-primary tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap'>Contenido</p>
            <span className='w-8 sm:w-20 h-[2px] bg-primary rounded-full'></span>
          </div>
          <p className='font-bold text-primary text-center md:text-start text-6xl max-w-[300px] '>Échale un vistazo al temario</p>
          {/* key = src para re-montar la imagen al cambiar de bloque, como en cocina */}
          <Image key={image} src={image} width={340} height={575} alt='Contenido del temario' className='object-contain rounded-3xl transition-opacity duration-300 w-full max-w-[300px] md:max-w-[340px] h-auto' />
        </div>
    </div>
  )
}
