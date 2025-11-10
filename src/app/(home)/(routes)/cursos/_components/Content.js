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
          <div className='bg-primary rounded-full py-2 px-10 w-fit'>

          <p className='font-bold text-white text-2xl'>Contenido</p>
          </div>
          <p className='font-bold text-primary text-center md:text-start text-6xl max-w-[300px] '>Échale un vistazo al temario</p>
          <Image src="/Group103.png" width={221} height={145} alt='icons'  />
        </div>
    </div>
  )
}
