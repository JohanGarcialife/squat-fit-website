'use client'
import useWindowSize from '@/hooks/UseWindowSize';
import Image from 'next/image'
import React from 'react'
import LandingButton from '../../components/LandingButton';

export default function StartPlan() {
  const { width } = useWindowSize();
  return (
    <div className='bg-secondary flex flex-col items-center py-20 w-full'>
        <h2 className='text-4xl md:text-5xl lg:text-6xl text-white font-bold text-center  mb-4'>
            Tu transformación empieza hoy
        </h2>
        <p className='text-white text-xl text-center mb-10'>
            Plazas limitadas para un seguimiento personalizado
        </p>
        <LandingButton variant="orange-light" size="lg" autoShine>
            Reserva tu plaza
        </LandingButton>

        {/* <div className='lg:flex lg:flex-row lg:gap-16 px-7 lg:px-10  mt-40 lg:mt-44 mb-20 flex flex-row flex-wrap gap-10 items-center justify-center'>
<Image src="/partners/logo-trainologym.png" width={184} height={38} alt='Partner' />
           <Image src="/partners/logo-life-pro-nutrition.png" width={106} height={45} alt='Partner' />
           <Image src="/partners/logo-fitgeneration.png" width={170} height={36} alt='Partner' />
<Image src="/partners/logos_icns.png" width={127} height={32} alt='Partner' />
<Image src="/partners/logo-powerexplosive-azul.png" width={186} height={42} alt='Partner' />

        </div> */}
    </div>
  )
}
