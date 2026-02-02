'use client'
import React from 'react'
import { useCartStore } from '@/stores/cart.store'

const PLANS = [
  { id: 'monthly', title: 'Mensual', price: 27.47, subtitle: 'al mes', label: null },
  { id: 'annual', title: 'Anual', price: 197.94, subtitle: 'pago anual', label: 'Más popular' },
  { id: 'lifetime', title: 'Permanente', price: 346.36, subtitle: 'pago único', label: null },
]

export default function CTO() {
  const { addToCart } = useCartStore()

  const handleAddToCart = (plan) => {
    addToCart({
      id: plan.id,
      name: `Curso - Plan ${plan.title}`,
      price: plan.price,
      image: '', 
    })
  }

  return (
    <div className='flex flex-col items-center justify-center my-16 px-4 md:px-0'>
         <p className='text-black max-w-2xl text-center text-xl mb-12'>
            Obtén el curso definitivo que te enseñará a <span className='font-bold'>transformar tu cuerpo</span> y no solo llegar al objetivo físico que siempre has querido sino a cómo <span className='font-bold'>mantenerlo</span> de por vida
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
            {PLANS.map((plan) => (
                <div 
                    key={plan.id} 
                    className={`relative flex flex-col items-center p-8 rounded-lg bg-white ${plan.label ? 'border-2 border-indigo-600 shadow-xl scale-105 z-10' : 'border border-gray-200 shadow-lg'}`}
                >
                    {plan.label && (
                        <div className="absolute -top-4 bg-indigo-600 text-white px-6 py-1 rounded-full text-sm font-medium">
                            {plan.label}
                        </div>
                    )}
                    <h3 className="text-2xl font-bold text-indigo-900 mb-4">{plan.title}</h3>
                    <div className="text-center mb-6">
                        <div className="flex items-start justify-center">
                            <span className="text-5xl font-bold text-indigo-900">{String(plan.price).replace('.', ',')}</span>
                            <span className="text-3xl font-bold text-indigo-900 mt-1 ml-1">€</span>
                        </div>
                        <div className="text-gray-500 mt-1">{plan.subtitle}</div>
                    </div>
                    <button 
                        onClick={() => handleAddToCart(plan)}
                        className=" cursor-pointer w-full bg-indigo-600 text-white py-3 rounded-md font-bold text-lg hover:bg-indigo-700 transition-colors mt-auto shadow-md"
                    >
                        Empezar
                    </button>
                </div>
            ))}
        </div>
    </div>
  )
}
