'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'

export default function Shop() {
  const [presentacion, setPresentacion] = useState(null)
  const { addToCart } = useCartStore()

  const products = [
    {
      id: 'vol-1',
      name: 'Volumen 1',
      price: 34.99,
      image: '/LibroCocina.png',
      features: [
        '1 aplicación para instalar en Android, iPhone o Tablet',
        '70+ recetas fit (del Vol 1)',
        'Guía de contar calorías, preparación semanal y utensilios esenciales',
      ],
      buttonClass: 'bg-secondary',
      textColor: 'text-secondary',
    },
    {
      id: 'vol-2',
      name: 'Volumen 2',
      price: 34.99,
      image: '/LibroCocina.png',
      features: [
        '1 aplicación para instalar en Android, iPhone o Tablet',
        '70+ recetas fit (del Vol 2)',
        'Guía de la compra, tamaño de porciones y adaptar las recetas a tu dieta',
      ],
      buttonClass: 'bg-secondary',
      textColor: 'text-secondary',
    },
    {
      id: 'pack-1-2',
      name: 'Volumen 1 + 2',
      price: 63.97,
      image: '/LibroCocina.png',
      features: [
        '2 apps para instalar en Android, iPhone o Tablet',
        '140+ recetas fit (Vol 1 y 2)',
        'Guía de contar calorías, preparación semanal y utensilios esenciales',
        'Guía de la compra, tamaño de porciones y adaptar las recetas a tu dieta',
      ],
      buttonClass: 'bg-amber-500',
      textColor: 'text-amber-500',
      discount: '-10%',
    },
  ]

  const handleAddToCart = (product) => {
    addToCart(product)
    console.log('Producto añadido:', product.name)
  }

  return (
    <div className='px-4 sm:px-8 md:px-12 lg:px-20 py-12 flex flex-col items-center gap-6 max-w-screen-xl mx-auto'>
      <h2 className='text-black font-bold text-3xl sm:text-4xl md:text-5xl text-center'>Compra tu libro aquí:</h2>

      {/* Presentacion */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full my-6'>
        <p className='text-black font-bold text-xl sm:text-2xl self-start sm:self-center'>Presentación</p>

        <div
          onClick={() => setPresentacion('digital')}
          className={`${presentacion === 'digital' ? 'bg-amber-400 border-2 border-amber-500 text-white' : 'bg-gray-200 border-2 border-gray-300 text-black'} flex items-center gap-3 rounded-2xl px-4 py-3 w-full sm:w-auto cursor-pointer`}
        >
          <input
            type='radio'
            id='presentacion-digital'
            name='presentacion'
            value='digital'
            checked={presentacion === 'digital'}
            onChange={() => setPresentacion('digital')}
            className='h-4 w-4'
          />
          <label htmlFor='presentacion-digital' className='ml-1 font-bold text-base sm:text-lg'>
            App Digital
          </label>
        </div>

        <div
          onClick={() => setPresentacion('libro')}
          className={`${presentacion === 'libro' ? 'bg-amber-400 border-2 border-amber-500 text-white' : 'bg-gray-200 border-2 border-gray-300 text-black'} flex items-center gap-3 rounded-2xl px-4 py-3 w-full sm:w-auto cursor-pointer`}
        >
          <input
            type='radio'
            id='presentacion-libro'
            name='presentacion'
            value='libro'
            checked={presentacion === 'libro'}
            onChange={() => setPresentacion('libro')}
            className='h-4 w-4'
          />
          <label htmlFor='presentacion-libro' className='ml-1 font-bold text-base sm:text-lg'>
            Libro Impreso
          </label>
        </div>

        <div
          onClick={() => setPresentacion('pack')}
          className={`${presentacion === 'pack' ? 'bg-amber-400 border-2 border-amber-500 text-white' : 'bg-gray-200 border-2 border-gray-300 text-black'} flex items-center gap-3 rounded-2xl px-4 py-3 w-full sm:w-auto cursor-pointer`}
        >
          <input
            type='radio'
            id='presentacion-pack'
            name='presentacion'
            value='pack'
            checked={presentacion === 'pack'}
            onChange={() => setPresentacion('pack')}
            className='h-4 w-4'
          />
          <label htmlFor='presentacion-pack' className='ml-1 font-bold text-base sm:text-lg'>
            Pack (Libro + App)
          </label>
        </div>
      </div>

      {/* Libro */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-black'>
        {products.map((product) => (
          <div key={product.id} className="relative w-full border-2 border-gray-300 rounded-lg px-4 py-6 flex flex-col items-center justify-between space-y-6 overflow-hidden">
            {product.discount && (
              <div className='bg-amber-500 text-white font-bold absolute rotate-45 -right-7 top-4 md:top-6 md:right-0 lg:-right-12 lg:top-7 py-1 px-10 md:px-20'>
                <p>{product.discount}</p>
              </div>
            )}
            <p className={`font-bold text-lg md:text-xl ${product.textColor}`}>{product.name}</p>
            <Image
              src={product.image}
              alt={`Libro de Cocina Squat Fit - ${product.name}`}
              width={160}
              height={200}
              className="object-contain relative"
              quality={75}
              priority
            />
            <p className={`font-bold text-3xl md:text-4xl ${product.textColor}`}>
              €{product.price.toString().replace('.', ',')}
            </p>

            <div className='space-y-2 text-sm md:text-base'>
              {product.features.map((feature, index) => (
                <p key={index}><span className='text-primary'>✓</span> {feature}</p>
              ))}
            </div>

            <div className='mt-4 cursor-pointer'>
              <button onClick={() => handleAddToCart(product)} className={`${product.buttonClass} w-full sm:w-auto rounded-lg py-3 px-6 text-white font-bold cursor-pointer`}>
                Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
