'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart.store';
import Link from 'next/link';

export default function FloatingCartWidget() {
  const { cart } = useCartStore();
  const [isClient, setIsClient] = useState(false); // Para manejar hidratación

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // No renderizar en el servidor o si el carrito está vacío
  if (!isClient || cart.length === 0) {
    return null;
  }

  return (
    <Link 
      href="/cart" 
      className="fixed bottom-8 right-8 z-50 bg-indigo-800 text-white rounded-md p-2 shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-900 transition-colors cursor-pointer"
      aria-label="Ver carrito"
    >
      {/* Icono de carrito simple */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <circle cx="6" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
        <path d="M17 17h-11v-14h-2" />
        <path d="M6 5l14 1l-1 7h-13" />
      </svg>
      {totalItems > 0 && <span className="text-sm font-bold">{totalItems}</span>}
      {subtotal > 0 && <span className="text-sm font-bold">€{subtotal.toFixed(2)}</span>}
    </Link>
  );
}
