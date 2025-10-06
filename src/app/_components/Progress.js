import Image from 'next/image'
import React from 'react'

export default function Progress() {
  return (
    <div className="px-32 w-full pt-44 flex flex-row items-center justify-between ">
      <div className="w-1/2 flex flex-col  justify-center">
     <h2 className="text-secondary max-w-[510px] text-6xl font-bold">Consigue un cambio para siempre </h2>
     <div className='flex flex-col gap-6 mt-8 max-w-[510px] '>
     <div className='bg-white shadow-2xl gap-6  max-w-[400px] rounded-2xl flex flex-row items-center p-6'>
<p className='text-primary text-5xl font-bold'>86%</p>
<p className='text-black text-xl '><span className='font-bold'>Logran resultados</span>  en los primeros 6 meses</p>
     </div>
     
<div className='bg-white shadow-2xl gap-6  max-w-[400px] rounded-2xl flex flex-row items-center p-6'>
<p className='text-primary text-5xl font-bold'>10x</p>
<p className='text-black text-xl '><span className='font-bold'>Mejor rendimiento</span>, salud física y mental</p>
     </div>
     <div className='bg-white shadow-2xl gap-6  max-w-[400px] rounded-2xl flex flex-row items-center p-6'>
<p className='text-primary text-5xl font-bold'>99%</p>
<p className='text-black text-xl '><span className='font-bold'>Disfrutan del proceso</span> mientras aprender</p>
     </div>
     </div>

      </div>
       <div className="w-1/2">
     <Image src="/Group31.png" 
     width={685} height={574} 
    
     alt="progress" />
    
      </div>
      </div>
  )
}
