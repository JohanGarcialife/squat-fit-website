'use client'
import useWindowSize from '@/hooks/UseWindowSize';
import Image from 'next/image'
import React from 'react'

export default function StartPlan() {
  const { width } = useWindowSize();
  return (
    <div className='flex flex-col items-center  lg:pt-32'>
        <h2 className='text-5xl lg:text-6xl text-primary font-bold text-center lg:max-w-[670px] '>
            Comienza tu verdadera transformación hoy
        </h2>
        <div className="w-full flex items-center justify-center gap-10">

        <button className="mt-10  text-white px-6 py-3 rounded-2xl bg-linear-to-r from-primary to-secondary font-bold">Comienza hoy</button>
        <div className="flex items-center text-secondary mt-10 justify-center gap-3 cursor-pointer text-2xl">
        <p className="">Saber más</p>

       
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M15 16l4 -4" /><path d="M15 8l4 4" /></svg>
        </div>
        </div>
        <div className='lg:flex lg:flex-row lg:gap-16 px-7 lg:px-10  mt-20 lg:mt-44 mb-20 flex flex-row flex-wrap gap-10 items-center justify-center'>
<Image src="/partners/logo-trainologym.png" width={184} height={38} alt='Partner' />
           <Image src="/partners/logo-life-pro-nutrition.png" width={106} height={45} alt='Partner' />
           <Image src="/partners/logo-fitgeneration.png" width={170} height={36} alt='Partner' />
<Image src="/partners/logos_icns.png" width={127} height={32} alt='Partner' />
<Image src="/partners/logo-powerexplosive-azul.png" width={186} height={42} alt='Partner' />

        </div>
    </div>
  )
}
