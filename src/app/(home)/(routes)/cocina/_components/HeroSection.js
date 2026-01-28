
import Image from 'next/image'
import React from 'react'

export default function HeroSection() {
    
  return (
    <div className='px-7 md:px-24 md:flex flex flex-col md:flex-row justify-center items-center py-24'>

        <div className='md:pl-14 md:w-1/2 mb-16 md:mb-0 flex flex-col items-center md:items-start '>
        <div className='bg-primary w-fit px-4 py-2 text-2xl rounded-full'>
            <p className='text-white font-bold'>Colección completa</p>
        </div>

        <h2 className='font-bold text-secondary text-center md:text-start text-6xl md:text-8xl my-8'>La Cocina Squat Fit 1 y 2</h2>
        <p className='text-primary text-4xl max-w-[580px] font-bold mb-8'>Recetas fit con sabor real</p>
        <p className='text-black text-2xl md:text-start text-center md:text-3xl max-w-[520px] md:mb-8'>Un sistema de recetas fáciles, saciantes y deliciosas para mejorar tu alimentación sin vivir en restricción.</p>
<div className='flex flex-col md:flex-row items-center md:items-start gap-4'>
<div className='text-center max-w-[150px]   '>
  <p className='text-secondary font-bold text-4xl'>+150</p>
  <p className='text-secondary'>Recetas para repetir</p>
</div>
<div className='text-center max-w-[150px]'>
  <p className='text-secondary font-bold text-4xl'>2</p>
  <p className='text-secondary'>Volumenes en la colección</p>
</div>
<div className='text-center max-w-[150px]'>
  <p className='text-secondary font-bold text-4xl'>100% </p>
  <p className='text-secondary'>Con sus macros incluidos</p> 
</div>
</div>
      </div>

        
        <div className="  md:w-1/2">
        
       <Image src="/cocinaHero.png" width={700} height={700} alt='Cooking book'  />
        </div>
    </div>
  )
}
