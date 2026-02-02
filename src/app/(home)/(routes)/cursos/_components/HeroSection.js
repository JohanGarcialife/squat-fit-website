
import Image from 'next/image'
import React from 'react'

export default function HeroSection() {
    
  return (
    <div className='px-7 md:px-24 md:flex flex flex-col md:flex-row justify-center items-center py-24'>

        <div className='md:pl-14 md:w-1/2 mb-16 md:mb-0 flex flex-col items-center md:items-start '>
        <div className='bg-primary w-fit px-4 py-2 text-2xl rounded-full'>
            <p className='text-white font-bold'>Formación</p>
        </div>

        <h2 className='font-bold text-secondary text-center md:text-start text-6xl md:text-8xl my-8'>Fuerte y definid@</h2>
        <p className='text-black text-2xl md:text-start text-center md:text-3xl  max-w-[520px] md:mb-8'>Transforma tu cuerpo y no solo llega al objetivo físico que siempre has querido sino a cómo mantenerlo de por vida</p>
        <p className='text-primary text-4xl max-w-[580px] font-bold'>180 €</p>
        <button className=' text-white px-8 py-4 rounded-2xl mt-8 font-bold text-xl bg-linear-to-r from-primary to-secondary cursor-pointer'>Añadir al carrito</button>
        </div> 

        
        <div className="  md:w-1/2">
        
       <Image src="/cursosheronew.png" width={625} height={625} alt='Coach'  />
        </div>
    </div>
  )
}
