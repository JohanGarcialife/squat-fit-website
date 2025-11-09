import Image from 'next/image'
import React from 'react'

export default function Benefits() {
  return (
    <div className='mx-10 mb-16 rounded-[80px] bg-secondary text-white grid grid-cols-3 py-12 px-24'>
<div className='w-full flex justify-center items-center '>

        <div className='w-full flex flex-col justify-center items-center max-w-[320px] text-center '>
            <Image src="/icons/muscle.png" width={95} height={95} alt='icon' className='mb-5'/>
            <p className='font-bold text-3xl'>Progreso asegurado
</p>
  <p className='text-2xl'>Aprende a perder grasa a la vez que ganas masa muscular.</p>
        </div>
</div>

<div className='w-full flex justify-center items-center '>

        <div className='w-full flex flex-col justify-center items-center max-w-[320px] text-center '>
            <Image src="/icons/weist.png" width={106} height={106} alt='icon' className='mb-2'/>
            <p className='font-bold text-3xl'>Sostenible
</p>
  <p className='text-2xl'>Mantente definido y con abdominales todo el año sin pasar hambre.</p>
        </div>
</div>

<div className='w-full flex justify-center items-center '>

        <div className='w-full flex flex-col justify-center items-center max-w-[320px] text-center '>
            <Image src="/icons/device.png" width={95} height={95} alt='icon' className='mb-5'/>
            <p className='font-bold text-3xl'>Práctico

</p>
  <p className='text-2xl'>Avanza a tu propia velocidad con +15 clases en vídeo</p>
        </div>
</div>
    </div>
  )
}
