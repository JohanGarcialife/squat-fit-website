'use client'
import React from 'react'
import ImageComparisonSlider from './ImageComparisionSlider'
import useWindowSize from '@/hooks/UseWindowSize';

export default function Comparision(props) {
  const { width } = useWindowSize();
    const {beforeSrc, afterSrc} = props;
  return (
   <div className="px-5 xl:px-32 w-full flex flex-col lg:flex-row items-center justify-between lg:pt-80 xl:pt-40 pt-[650px] ">
     
     {width < 1024 ? 
     <>
    
      <div className="lg:w-1/2 h-full flex flex-col items-start justify-center lg:max-w-[510px] mb-10">
        <p className="text-primary lg:text-start text-center font-bold text-5xl lg:text-7xl">Mejora tu físico y también tu estilo de vida</p>
        <p className="text-black lg:text-start text-center text-2xl mt-10">Aprende a mantenerte sano y en forma; evita el efecto rebote y continua progresando después de meses en incluso años.</p>
        <div className="w-full flex flex-col items-center justify-center ">

        <button className="mt-10 w-1/2 text-white px-6 py-3 rounded-2xl bg-linear-to-r from-primary to-secondary font-bold">Empieza hoy</button>
        <div className="flex items-center w-full  text-secondary mt-10 justify-center gap-3 cursor-pointer text-2xl">
        <p className="">Saber más</p>

       
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M15 16l4 -4" /><path d="M15 8l4 4" /></svg>
        </div>
        </div>
      </div> 
       <div className="lg:w-1/2 w-full">

      <ImageComparisonSlider beforeSrc={beforeSrc} afterSrc={afterSrc}/>
      </div>
     </>
      : 
      <div className="w-full flex flex-row items-center justify-between gap-10">
      <div className="lg:w-1/2 w-full">

      <ImageComparisonSlider beforeSrc={beforeSrc} afterSrc={afterSrc}/>
      </div>
      <div className="lg:w-1/2 h-full flex flex-col items-start justify-center lg:max-w-[510px] ">
        <p className="text-primary font-bold text-7xl">Mejora tu físico y también tu estilo de vida</p>
        <p className="text-black text-2xl mt-10">Aprende a mantenerte sano y en forma; evita el efecto rebote y continua progresando después de meses en incluso años.</p>
        <div className="w-full flex items-center justify-start gap-10">

        <button className="mt-10  text-white px-6 py-3 rounded-2xl bg-linear-to-r from-primary to-secondary font-bold">Empieza hoy</button>
        <div className="flex items-center text-secondary mt-10 justify-center gap-3 cursor-pointer text-2xl">
        <p className="">Saber más</p>

       
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M15 16l4 -4" /><path d="M15 8l4 4" /></svg>
        </div>
        </div>
      </div>
      </div>
      }

     </div>
  )
}
