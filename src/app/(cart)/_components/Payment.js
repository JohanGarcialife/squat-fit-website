'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cart.store';

// Inicializa Stripe fuera del renderizado del componente para evitar recrearlo.
// **IMPORTANTE**: La variable de entorno debe llamarse NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tu archivo .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

console.log(stripePromise);


export default function Payment(props) {
  const { setStep, setSuccess } = props;
  const [clientSecret, setClientSecret] = useState('');
  const { cart } = useCartStore();

  useEffect(() => {
    // --- LLAMADA AL BACKEND PARA CREAR EL PAYMENT INTENT ---
    // Esto debe hacerse en tu servidor para mantener la clave secreta de Stripe segura.
    // El backend recibe el total del carrito y devuelve un 'clientSecret'.
    
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // No procesar si el carrito está vacío o el total es 0
    if (total === 0) return;

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(total * 100) }), // Stripe espera el monto en centavos
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        // Manejar el caso de error donde el clientSecret no se recibe
        console.error("Error: No se pudo obtener el client_secret del servidor.");
      }
    })
    .catch(error => {
      console.error("Error en la llamada a /api/create-payment-intent:", error);
    });

  }, [cart]); // Se re-ejecuta si el carrito cambia

  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-white flex flex-row justify-between font-sans">
      <div className="w-1/2 space-y-6 min-h-screen py-14 px-40 ">
        {/* El formulario de pago solo se renderiza si tenemos el clientSecret */}
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <PaymentForm setStep={setStep} />
          </Elements>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-indigo-900">Cargando métodos de pago...</h2>
            <p className="text-slate-500 mt-2">Por favor, espera un momento.</p>
          </div>
        )}
      </div>
     
      <div className="bg-[#FFF5F3] w-1/2 min-h-screen sticky py-10 top-10">
        <OrderSummary setSuccess={setSuccess} />
      </div>
    </div>
  )
}
