import Image from 'next/image'
import React from 'react'

export default function HeroSection() {
  return (
    <div className='px-24 flex justify-center items-center py-24'>

        <div className='pl-14 w-1/2 '>
        <div className='bg-primary w-fit px-4 py-2 text-2xl rounded-full'>
            <p className='text-white font-bold'>Pack de Cursos</p>
        </div>
        <h2 className='font-bold text-secondary text-8xl my-8'>Fuerte y definid@</h2>
        <p className='text-black text-3xl  max-w-[520px] mb-8'>Transforma tu cuerpo y no solo llega al objetivo físico que siempre has querido sino a cómo mantenerlo de por vida</p>
        <p className='text-primary text-4xl max-w-[580px] font-bold'>180 €</p>
        <button className=' text-white px-8 py-4 rounded-2xl mt-8 font-bold text-xl bg-linear-to-r from-primary to-secondary cursor-pointer'>Añadir al carrito</button>
        </div>
        <div className="  w-1/2"><Image src="/CursosHero.png" width={625} height={625} alt='Coach'  /></div>
    </div>
  )
}
