'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart.store'

export default function MiniCart({ onClose }) {
  const { cart, removeFromCart } = useCartStore()
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-black">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Mi Carrito</h3>
          <button onClick={onClose} className="font-bold text-xl cursor-pointer">&times;</button>
        </div>
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 my-6">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <Image src={item.image} alt={item.name} width={60} height={60} className="rounded-md object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    <p className="font-bold text-sm">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg cursor-pointer">
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold mb-4">
              <span>Subtotal:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <Link href="/cart" onClick={onClose} className="block w-full text-center bg-secondary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-colors">
              Ver Carrito
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
