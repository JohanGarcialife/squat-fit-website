'use client';

import React from 'react';
import { Euro } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart.store';

export default function OrderSummary(props) {
    const { setStep, setSuccess } = props;
    const { cart } = useCartStore();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = 4.99;
    const freeShippingThreshold = 90.00;
    
    const finalShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
    const total = subtotal + finalShipping;

  return (
    <div className="w-full max-w-sm mx-auto bg-[#FFF5F3] rounded-[2.5rem] p-8 shadow-sm font-sans">
      
      {/* 1. Logo SQ/FT */}
      <Link href="/">
        <div  className="flex flex-col items-center mb-4">
            <Image src="/LogotipoSquatfit.png" width={100} height={40} alt="Logo Squat Fit" />
        </div>
      </Link>

      {/* 2. Cambiar Moneda */}
      <div className="flex justify-end mb-8">
        <button  className="group flex items-center gap-2 text-indigo-300 text-xs border-b border-indigo-200 pb-0.5 hover:text-indigo-600 transition-colors">
          <span className="mt-1">Cambiar moneda</span>
          <div className="w-6 h-6 rounded-full border-2 border-indigo-900 flex items-center justify-center text-indigo-900 font-bold">
            <Euro size={14} strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* 3. Lista de Productos (Cards compactas) */}
      <div className="space-y-4 mb-10 max-h-64 overflow-y-auto pr-2">
        {cart.map((item) => (
          <div 
            key={item.id} 
            className="bg-[#FFFDFC] p-3 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]"
          >
            {/* Imagen del producto */}
            <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
              <Image 
                src={item.image} 
                alt={item.name} 
                layout="fill"
                className="object-contain" 
              />
            </div>

            {/* Info del producto */}
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-orange-500 font-bold text-sm leading-tight mb-1">
                {item.name}
              </h4>
              <div className="flex justify-between items-end">
                <span className="text-indigo-900 text-sm font-medium">
                  {item.quantity} ud.
                </span>
                <span className="text-indigo-900 font-bold text-sm">
                  {(item.price * item.quantity).toFixed(2).replace('.', ',')} EUR
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Totales */}
      <div className="space-y-3 mb-8 px-2">
        <div className="flex justify-between items-center text-indigo-900">
          <span className="text-lg font-medium">Envío</span>
          <span className="text-lg font-medium">{finalShipping.toFixed(2).replace('.', ',')} EUR</span>
        </div>
        <div className="flex justify-between items-center text-indigo-900 font-bold text-xl">
          <span>Total</span>
          <span>{total.toFixed(2).replace('.', ',')} EUR</span>
        </div>
      </div>

      {/* 5. Botón de Acción */}
      <button onClick={() => setStep(3)} className="w-full bg-[#3b4097] text-white cursor-pointer font-bold py-4 rounded-2xl hover:bg-[#2f337a] transition-colors shadow-lg shadow-indigo-200">
        Continuar
      </button>

    </div>
  );
}