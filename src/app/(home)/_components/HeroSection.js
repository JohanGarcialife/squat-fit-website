'use client'
import useWindowSize from '@/hooks/UseWindowSize';
import Image from 'next/image'
import React from 'react'
import LandingButton from '../../components/LandingButton';

export default function HeroSection() {
  const { width } = useWindowSize();
  return (
    <>
    
    <div className='flex flex-col md:flex-row w-full '>
      {/* Left */}
      <div className='xl:pl-36 px-5  w-full pt-12 max-w-screen'>
        <div >

<p className='text-secondary text-center lg:text-start xl:max-w-[510px] max-w-screen font-bold text-5xl lg:text-6xl xl:text-7xl lg:leading-28 '>Logra tu mejor versión</p>
<p className='text-black lg:max-w-[510px] text-center lg:text-start text-2xl mt-4'>El programa de dieta, entreno y mentalidad para un cambio físico real y duradero</p>
<div className='flex flex-row w-full items-center lg:items-start lg:justify-center'>
<div className='flex flex-row items-center justify-center lg:justify-start w-full'>

<LandingButton variant="blue" size="lg" autoShine className='mt-8'>Reserva tu plaza</LandingButton>
</div>
</div>


<div className='flex flex-row items-start justify-between mt-10 lg:gap-20 gap-2 w-full'>
<div className='flex flex-col items-center justify-center text-center'>
  <p className='text-3xl lg:text-5xl font-bold text-secondary'>+1700</p>
  <p className='text-secondary  lg:text-lg'>Vidas cambiadas</p>
</div>
<div className='flex flex-col items-center justify-center text-center'>
  <p className='text-3xl lg:text-5xl font-bold text-secondary'>+1M</p>
  <p className='text-secondary  lg:text-lg'>Seguidores en redes</p>
</div>
<div className='flex flex-col items-center justify-center text-center'>
  <p className='text-3xl lg:text-5xl font-bold text-secondary'>+250</p>
  <p className='text-secondary  lg:text-lg'>Alumnos aprendiendo</p>
</div>
</div>
        </div>
      </div>

      {/* Right */}
      <div className=' w-full h-[530px] lg:h-[650px] xl:h-[900px] relative overflow-hidden'>
        {width < 425 && <Image src="/mobileCoach.png" width={330} height={214} alt='Coach'  className='absolute z-20 left-5 bottom-0'/>  }
        {width < 768 && width > 425 && <Image src="/mobileCoach.png" width={530} height={514} alt='Coach'  className='absolute z-20 left-0 bottom-0'/>  }
        {width >= 768 && width < 1024 && <Image src="/IMG-Maria-Hamlet-.png" width={530} height={530} alt='Coach'  className='absolute z-20 right-0 bottom-0'/>  }
        {width >= 1024 && width < 1200 && <Image src="/IMG-Maria-Hamlet-.png" width={874} height={847} alt='Coach'  className='absolute z-20 bottom-0 right-0'/>  }
        {width > 1200 && <Image src="/IMG-Maria-Hamlet-.png" width={874} height={847} alt='Coach'  className='absolute z-20 bottom-0 right-0'/>  }

{width < 425 && <div className="h-[282px] w-[282px] bg-primary absolute z-10 left-7 -bottom-10 rounded-full" />  }
        {width < 768 && width > 425 && <div className="h-[382px] w-[382px] bg-primary absolute z-10 left-7 -bottom-10 rounded-full" />  }
        {width >= 768 && <div className="h-[430px] w-[430px] bg-primary absolute z-10  -right-44 bottom-0 rounded-full" />  }
        {width>= 1024 && <div className="h-[630px] w-[630px] bg-primary absolute z-10  -right-44 bottom-0 rounded-full" />  }
      </div>
      
    </div>


    {/* Bottom section moved to FourPillars component */}
    
    </>
  )
}
