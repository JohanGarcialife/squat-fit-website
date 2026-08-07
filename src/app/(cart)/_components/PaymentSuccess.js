'use client';

import React, { useEffect, useState } from 'react';
import { Check, BookOpen, Play, Package, LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import TrustpilotInvitation from './TrustpilotInvitation';
import { readOrderAccess } from './accesoComprado';
import RegalarCompra from './RegalarCompra';

// Icono por tipo de producto comprado.
const ICONO = { curso: Play, biblioteca: BookOpen, libro: Package };

// Qué se le promete al cliente en cada tarjeta. El libro en papel no lleva
// destino: se envía, no se abre en el panel.
const PIE = {
  curso: 'Entra en Mis cursos',
  biblioteca: 'Entra en tu biblioteca de recetas',
  libro: 'Te lo enviamos a tu dirección',
};

export default function PaymentSuccess({ pedidoRegalable = null }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  // Lo que acaba de comprar (foto tomada por el paso de pago). Se lee ya
  // montado: sessionStorage no existe en el render del servidor.
  const [comprado, setComprado] = useState([]);

  useEffect(() => {
    setComprado(readOrderAccess());
  }, []);

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
      {/* Invitación de reseña de Trustpilot: no pinta nada, solo dispara la
          llamada una vez con los datos del pedido ya confirmado. */}
      <TrustpilotInvitation />

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

        {/* Una entrada por producto DE ESTE pedido (antes había dos tarjetas
            fijas: quien no compraba libros o cursos acababa en una pantalla
            vacía) + el panel, que va siempre. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
          {comprado.map((entrada) => {
            const Icono = ICONO[entrada.tipo] || Package;

            // Sin destino real (libro en papel): tarjeta INFORMATIVA, no enlace.
            //
            // Se ve distinta a propósito. Antes llevaba el mismo borde índigo, el
            // mismo fondo y el mismo cuadrado relleno con el icono en blanco que
            // la tarjeta de «Mi panel», que sí es un enlace: lo único que las
            // separaba era la flecha de 16 px del pie, y en la captura de
            // escritorio las dos parecían botones. Un cliente que acaba de pagar
            // no debe pulsar dos veces una tarjeta que no lleva a ningún sitio.
            //
            // Las señales de «esto no se toca», todas a la vez para que funcione
            // aunque se pierda alguna: sin color de marca (gris, no índigo ni
            // naranja), borde DISCONTINUO, icono en hueco en vez de sobre un
            // cuadrado relleno, `cursor-default` y sin ningún estado :hover.
            // Y sigue sin flecha, que es lo único que la distinguía antes.
            if (!entrada.href) {
              return (
                <div
                  key={`${entrada.tipo}-${entrada.id}`}
                  className="h-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center">
                    <Icono size={24} className="text-gray-400" />
                  </div>
                  <span className="font-bold text-gray-600 text-base">{entrada.titulo}</span>
                  <span className="text-gray-500 text-sm">{PIE[entrada.tipo]}</span>
                </div>
              );
            }

            return (
              <Link key={`${entrada.tipo}-${entrada.id}`} href={entrada.href} className="group">
                <div className="h-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-orange-100 bg-orange-50 hover:border-orange-500 hover:bg-orange-100 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icono size={24} className="text-white" />
                  </div>
                  <span className="font-bold text-orange-700 text-base">{entrada.titulo}</span>
                  <span className="text-orange-500 text-sm">{PIE[entrada.tipo]}</span>
                  <ArrowRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}

          {/* Panel de control: SIEMPRE, y es lo único que se ofrece si no
              tenemos la foto del pedido (pestaña nueva, sin sessionStorage…). */}
          <Link href="/panel-control" className="group">
            <div className="h-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-indigo-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              <span className="font-bold text-indigo-900 text-base">Mi panel</span>
              <span className="text-indigo-600 text-sm">Todo tu contenido y tus datos</span>
              <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Regalar la compra. Se pinta antes del logotipo y DESPUÉS de los
            accesos: primero que vea lo que acaba de comprar, y luego la
            opción. El componente se esconde solo si no hay pedido que regalar
            o si no hay sesión. */}
        <div className="flex justify-center">
          <RegalarCompra orderId={pedidoRegalable} />
        </div>

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