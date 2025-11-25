import Image from 'next/image'
import React from 'react'

export default function Benefits() {
  return (
    <div className='mx-3 md:mx-10 mb-16 rounded-[80px] bg-secondary text-white grid grid-cols-1 md:grid-cols-3 py-12 px-4 md:px-24 gap-20 md:gap-0'>
<div className='w-full flex justify-center items-center '>

        <div className='w-full flex flex-col justify-center items-center max-w-[320px] text-center '>
            <Image src="/benefits/image.png" width={95} height={95} alt='icon' className='mb-5'/>
            <p className='font-bold text-3xl'>Pierde grasa
</p>
  <p className='text-2xl'>
Come bien mientras logras tus objetivos y disfrutas de tus platos favoritos.</p>
        </div>
</div>

<div className='w-full flex justify-center items-center '>

        <div className='w-full flex flex-col justify-center items-center max-w-[320px] text-center '>
            <Image src="/benefits/image2.png" width={106} height={106} alt='icon' className='mb-2'/>
            <p className='font-bold text-3xl'>Súper simple
</p>
  <p className='text-2xl'>
Recetas fáciles y rápidas de hacer y se adaptan a tu estilo de vida.</p>
        </div>
</div>

<div className='w-full flex justify-center items-center '>

        <div className='w-full flex flex-col justify-center items-center max-w-[320px] text-center '>
            <Image src="/benefits/image3.png" width={95} height={95} alt='icon' className='mb-5'/>
            <p className='font-bold text-3xl'>Recetas de muerte

</p>
  <p className='text-2xl'>
Olvídate de comer siempre la misma dieta insípida y aburrida</p>
        </div>
</div>
    </div>
  )
}
