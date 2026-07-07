'use client';

import React, { useEffect } from 'react';
import { Check, BookOpen, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

export default function PaymentSuccess() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  // Clear the cart and refresh subscription status (handling webhook delay)
  useEffect(() => {
    clearCart();

    const refresh = async () => {
      try {
        await useAuthStore.getState().refreshSubscriptionStatus();
      } catch (err) {
        console.error('Error refreshing subscription on success page:', err);
      }
    };

    refresh();
    const t1 = setTimeout(refresh, 3000);
    const t2 = setTimeout(refresh, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        
        {/* --- Icono de Éxito animado --- */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-orange-100 animate-bounce-slow">
          <Check size={44} className="text-white" strokeWidth={3} />
        </div>

        {/* --- Mensaje Principal --- */}
        <h1 className="text-4xl font-extrabold text-orange-500 mb-3">
          ¡Pago confirmado!
        </h1>
        <p className="text-gray-500 text-lg font-medium mb-2">
          Tu compra se ha procesado correctamente.
        </p>
        <p className="text-gray-400 text-sm mb-10">
          Recibo enviado a <span className="font-semibold text-gray-600">{user?.email || 'tu correo'}</span>
        </p>

        {/* --- Línea Divisora --- */}
        <div className="w-full h-px bg-gray-100 mb-10" />

        {/* --- CTAs de Acceso --- */}
        <p className="text-indigo-900 font-bold text-lg mb-6">
          ¿A dónde quieres ir ahora?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
          {/* Biblioteca Digital */}
          <Link href="/panel-cocina" className="group">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-indigo-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={24} className="text-white" />
              </div>
              <span className="font-bold text-indigo-900 text-base">Biblioteca Digital</span>
              <span className="text-indigo-600 text-sm">Tus libros de cocina</span>
              <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Cursos en Video */}
          <Link href="/panel-cursos" className="group">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-orange-100 bg-orange-50 hover:border-orange-500 hover:bg-orange-100 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={24} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-orange-700 text-base">Cursos en Video</span>
              <span className="text-orange-500 text-sm">Tus clases de Squad Fit</span>
              <ArrowRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* --- Link secundario al panel --- */}
        <p className="text-gray-400 text-sm">
          También puedes ir a tu{' '}
          <Link href="/panel-control" className="font-semibold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 transition-colors">
            Panel de Control
          </Link>
        </p>

        {/* --- Logotipo Final --- */}
        <div className="flex flex-col items-center mt-12">
          <div className="text-4xl font-black text-indigo-900 leading-none">
            SQ<br />
            <span className="text-orange-500">FT</span>
          </div>
        </div>

      </div>
    </div>
  );
}