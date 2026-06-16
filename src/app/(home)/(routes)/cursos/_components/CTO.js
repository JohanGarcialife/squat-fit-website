'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart.store'
import { toast } from 'react-hot-toast'

const PLANS = [
  { id: 'monthly', title: 'Mensual', price: 27.47, subtitle: 'al mes', label: null },
  { id: 'annual', title: 'Anual', price: 197.94, subtitle: 'pago anual', label: 'Más popular' },
  { id: 'lifetime', title: 'Permanente', price: 346.36, subtitle: 'pago único', label: null },
]

export default function CTO() {
  const { setDirectCheckoutItem, cart } = useCartStore()
  const [selectedPlanId, setSelectedPlanId] = useState('annual')
  const router = useRouter()

  const handleAddToCart = (plan) => {
    if (cart.length > 0 && !cart.some(item => item.isDirectCheckout)) {
       toast.error('Tus productos físicos fueron removidos por seguridad (no se pueden mezclar suscripciones y productos de pago único).', { duration: 5000 });
    }

    setDirectCheckoutItem({
      id: plan.id,
      name: `Curso - Plan ${plan.title}`,
      price: plan.price,
      image: '/CursosHero.png',
      endpoint: '/api/v1/course/create-payment-intent',
      payload: { course_id: plan.id } // Backend expects: { course_id: "uuid" }. Assumes plan.id is mapped to a UUID.
    })
    toast.success('Curso añadido al carrito')
  }

  return (
    <div className='flex flex-col items-center justify-center my-16 px-4 md:px-0'>
         <p className='text-black max-w-2xl text-center text-xl mb-12'>
            Obtén el curso definitivo que te enseñará a <span className='font-bold'>transformar tu cuerpo</span> y no solo llegar al objetivo físico que siempre has querido sino a cómo <span className='font-bold'>mantenerlo</span> de por vida
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
            {PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                <div 
                    key={plan.id} 
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative flex flex-col items-center p-8 rounded-lg cursor-pointer transition-all duration-300 bg-white ${isSelected ? 'border-4 border-secondary shadow-2xl scale-105 z-10' : 'border border-gray-200 shadow-lg opacity-70 hover:opacity-100'}`}
                >
                    {plan.label && (
                        <div className="absolute -top-4 bg-secondary text-white px-6 py-1 rounded-full text-sm font-medium">
                            {plan.label}
                        </div>
                    )}
                    <h3 className="text-2xl font-bold text-secondary mb-4">{plan.title}</h3>
                    <div className="text-center mb-6">
                        <div className="flex items-start justify-center">
                            <span className="text-5xl font-bold text-secondary">{String(plan.price).replace('.', ',')}</span>
                            <span className="text-3xl font-bold text-secondary mt-1 ml-1">€</span>
                        </div>
                        <div className="text-gray-500 mt-1">{plan.subtitle}</div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(plan);
                        }}
                        className="w-full bg-secondary text-white py-3 rounded-md font-bold text-lg hover:opacity-90 transition-opacity mt-auto shadow-md"
                    >
                        Empezar
                    </button>
                </div>
            )})}
        </div>
    </div>
  )
}
