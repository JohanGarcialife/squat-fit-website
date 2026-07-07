import React from 'react'
import TimelineStepper from './TimelineStepper'
import Image from 'next/image'

export default function Content() {
  return (
    <div className='px-3 md:px-32 flex flex-col-reverse md:flex-row items-center justify-center gap-16 py-20'>
        <div className='md:w-1/2 '>
         <TimelineStepper />
         </div>
        <div className='md:w-1/2 flex flex-col items-center gap-4'>
          <div className='flex items-center gap-4'>
            <span className='w-8 sm:w-20 h-[2px] bg-primary rounded-full'></span>
            <p className='font-bold text-primary tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap'>Contenido</p>
            <span className='w-8 sm:w-20 h-[2px] bg-primary rounded-full'></span>
          </div>
          <p className='font-bold text-primary text-center md:text-start text-6xl max-w-[300px] '>Échale un vistazo al temario</p>
          <Image src="/Group103.png" width={221} height={145} alt='icons'  />
        </div>
    </div>
  )
}
