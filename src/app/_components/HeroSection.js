import Image from 'next/image'
import React from 'react'

export default function HeroSection() {
  return (
    <>
    
    <div className='flex  w-full '>
      {/* Right */}
      <div className='pl-36  w-full pt-12'>
        <div >

<p className='text-secondary xl:max-w-[510px] font-bold text-8xl leading-28 '>Transforma tu cuerpo hoy</p>
<p className='text-black max-w-[510px] text-2xl mt-4'>Entra y consigue las herramientas que te ayudarán a lograr tu mejor versión</p>
<button className=' text-white px-8 py-4 rounded-2xl mt-8 font-bold text-xl bg-linear-to-r from-primary to-secondary'>Únete Ahora</button>

<div className='flex flex-row items-start justify-between mt-10 gap-20 w-full'>
<div className='flex flex-col items-center justify-center text-center'>
  <p className='text-5xl font-bold text-secondary'>+1700</p>
  <p className='text-secondary text-lg'>Vidas cambiadas</p>
</div>
<div className='flex flex-col items-center justify-center text-center'>
  <p className='text-5xl font-bold text-secondary'>+1M</p>
  <p className='text-secondary text-lg'>Seguidores en redes</p>
</div>
<div className='flex flex-col items-center justify-center text-center'>
  <p className='text-5xl font-bold text-secondary'>+250</p>
  <p className='text-secondary text-lg'>Alumnos aprendiendo</p>
</div>
</div>
        </div>
      </div>
      {/* Left */}
      <div className=' w-full h-[900px] relative overflow-hidden'>
        <Image src="/IMG-Maria-Hamlet-.png" width={874} height={847} alt='Coach'  className='absolute z-20 right-0'/>
        <div className="h-[630px] w-[630px] bg-primary absolute z-10  -right-44 bottom-0 rounded-full" />
      </div>
      
    </div>
    {/* Bottom */}
    <div className='relative w-screen flex justify-center px-10'>
      
  <div className='bg-[rgb(255,247,242)] px-32 py-14 z-30 rounded-2xl absolute xl:-top-44 -top-14 w-[95%]'>
    <div className='flex flex-row justify-between items-center'>
      <div className='flex flex-col items-center text-center '>
        <Image src="/icons/nutrition.png" width={120} height={120} alt='Icon' />
      <p className='text-secondary text-2xl font-bold'>Agenda para contar tus macros y calorías</p>
      </div>
<div className='flex flex-col items-center text-center '>
        <Image src="/icons/running.png" width={120} height={120} alt='Icon' />
      <p className='text-secondary text-2xl font-bold'>Herramienta que sigue tus pasos diarios</p>
      </div>
      <div className='flex flex-col items-center text-center '>
        <Image src="/icons/speech.png" width={120} height={120} alt='Icon' />
      <p className='text-secondary text-2xl font-bold'>Una comunidad para compartir y aprender</p>
      </div>
      
    </div>
  </div>
</div>
    
    </>
  )
}
