import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        
        {/* --- Icono de Éxito --- */}
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-100">
          <Check size={40} className="text-white" strokeWidth={3} />
        </div>

        {/* --- Mensaje Principal --- */}
        <h1 className="text-3xl font-extrabold text-orange-500 mb-4">
          Pago confirmado
        </h1>
        <p className="text-orange-400 text-lg font-medium mb-10">
          Tu pedido se ha realizado correctamente.
        </p>

        {/* --- Línea Divisora --- */}
        <div className="w-full h-px bg-orange-200 mb-10"></div>

        {/* --- Información de Cuenta --- */}
        <div className="space-y-6 mb-16">
          <p className="text-indigo-900 text-lg">
            Hemos registrado tu cuenta con el e-mail <span className="font-semibold">[mail_del_cliente]</span>.
          </p>
          
          <p className="text-indigo-900 text-lg">
            Pulsa <Link href="/register" className="font-bold border-b-2 border-indigo-900 pb-0.5 hover:text-indigo-700 hover:border-indigo-700 transition-colors">aquí</Link> para entrar en tu cuenta y establecer tu contraseña.
          </p>
        </div>

        {/* --- Logotipo Final --- */}
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black text-indigo-900 leading-none">
            SQ<br />
            <span className="text-orange-500">FT</span>
          </div>
        </div>

      </div>
    </div>
  );
}