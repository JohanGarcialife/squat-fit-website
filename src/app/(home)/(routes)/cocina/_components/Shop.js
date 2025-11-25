'use client'
import Image from 'next/image'
import React, { useState } from 'react'

export default function Shop() {
  const [presentacion, setPresentacion] = useState(null)
  return (
    <div className='px-48 py-24 flex flex-col justify-center items-center gap-6'>
      <h2 className='text-black font-bold text-4xl'>Compra tu libro aquí:</h2>
      {/* Presentacion */}
      <div className='flex items-center justify-center gap-6 w-full my-6'>
        <p className='text-black font-bold text-2xl'>Presentación</p>

        <div className={presentacion === "digital" ? 'flex items-center bg-amber-400 rounded-2xl border-2 border-amber-500 text-white  px-6 py-4' : 'flex items-center bg-gray-200 rounded-2xl border-2 text-black  border-gray-300 px-6 py-4'}>
          <input
            type='radio'
            id='presentacion-digital'
            name='presentacion'
            value='digital'
            checked={presentacion === 'digital'}
            onChange={() => setPresentacion('digital')}
          />
          <label htmlFor='presentacion-digital' className='ml-2 font-bold text-xl'>
            App Digital
          </label>
        </div>

        <div className={presentacion === "libro" ? 'flex items-center bg-amber-400 rounded-2xl border-2 border-amber-500 text-white  px-6 py-4' : 'flex items-center bg-gray-200 rounded-2xl border-2 text-black  border-gray-300 px-6 py-4'}>
          <input
            type='radio'
            id='presentacion-libro'
            name='presentacion'
            value='libro'
            checked={presentacion === 'libro'}
            onChange={() => setPresentacion('libro')}
          />
          <label htmlFor='presentacion-libro' className='ml-2  font-bold text-xl'>
            Libro Impreso
          </label>
        </div>

        <div className={presentacion === "pack" ? 'flex items-center bg-amber-400 rounded-2xl border-2 border-amber-500 text-white  px-6 py-4' : 'flex items-center bg-gray-200 rounded-2xl border-2 text-black  border-gray-300 px-6 py-4'}>
          <input
            type='radio'
            id='presentacion-pack'
            name='presentacion'
            value='pack'
            checked={presentacion === 'pack'}
            onChange={() => setPresentacion('pack')}
          />
          <label htmlFor='presentacion-pack' className='ml-2 font-bold text-xl'>
            Pack (Libro + App)
          </label>
        </div>

      </div>
      {/* Libro */}
      <div className='grid grid-cols-3 gap-2 w-full text-black'>
        <div className="w-full border-2 border-gray-300 rounded-lg px-2 py-6 flex flex-col items-center justify-between space-y-10">
          <p className='font-bold text-xl text-secondary'>Volumen 1</p>
          <Image
                              src="/libroCocina.png"
                              alt='Libro de Cocina Squat Fit'
                              width={100}
                              height={50}
                              className="object-contain relative"
                              quality={75}
                              priority
                            />
                            
          <p className='font-bold text-4xl text-secondary'>€34.99</p>
       <div className='space-y-3'>

          <p className='text-xl text-black'>
            <span className='text-primary'>✓</span> 1 aplicación para instalar en Android, iPhone o Tablet


          </p>
          <p className='text-xl text-black'>
            <span className='text-primary'>✓</span> 70+ recetas fit (del Vol 1)


          </p>
          <p className='text-xl text-black'>
       

<span className='text-primary'>✓</span> Guía de contar calorías, preparación semanal y utensilios esenciales
          </p>
       </div>

<div className='bg-secondary rounded-lg w-fit py-3 px-6 text-white font-bold'>Añadir al carrito</div>
        </div>
        <div className="w-full border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-between space-y-10">
            <p className='font-bold text-xl text-secondary'>Volumen 2</p>
          <Image
                              src="/libroCocina.png"
                              alt='Libro de Cocina Squat Fit'
                              width={100}
                              height={50}
                              className="object-contain relative"
                              quality={75}
                              priority
                            />
                            
          <p className='font-bold text-4xl text-secondary'>€34.99</p>
       <div className='space-y-3'>

          <p className='text-xl text-black'>
            <span className='text-primary'>✓</span> 1 aplicación para instalar en Android, iPhone o Tablet


          </p>
          <p className='text-xl text-black'>
            <span className='text-primary'>✓</span> 70+ recetas fit (del Vol 2)


          </p>
          <p className='text-xl text-black'>
       

<span className='text-primary'>✓</span> Guía de la compra, tamaño de porciones y adaptar las recetas a tu dieta
          </p>
       </div>
       <div className='bg-secondary rounded-lg w-fit py-3 px-6 text-white font-bold'>Añadir al carrito</div>
        </div>


        <div className="relative w-full border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-between space-y-10 overflow-hidden">
          <div className='bg-amber-500 text-white font-bold absolute rotate-45 top-7 -right-12 py-1 px-20'>
            <p>-10%</p>
          </div>
            <p className='font-bold text-xl text-amber-500'>Volumen 1 + 2</p>
          <Image
                              src="/libroCocina.png"
                              alt='Libro de Cocina Squat Fit'
                              width={100}
                              height={50}
                              className="object-contain relative"
                              quality={75}
                              priority
                            />
                            
          <p className='font-bold text-4xl text-amber-500'>€63,97</p>
          

       <div className='space-y-3'>

          <p className='text-xl text-black'>
            <span className='text-primary'>✓</span> 2 apps para instalar en Android, iPhone o Tablet


          </p>
          <p className='text-xl text-black'>
            <span className='text-primary'>✓</span> 140+ recetas fit (Vol 1 y 2)


          </p>
          <p className='text-xl text-black'>
       

<span className='text-primary'>✓</span> Guía de contar calorías, preparación semanal y utensilios esenciales
          </p>
          <p className='text-xl text-black'>
       

<span className='text-primary'>✓</span> Guía de la compra, tamaño de porciones y adaptar las recetas a tu dieta
          </p>
       </div>
       <div className='bg-amber-500 rounded-lg w-fit py-3 px-6 text-white font-bold'>Añadir al carrito</div>
        </div>
          
      </div>
    </div>
  )
}
