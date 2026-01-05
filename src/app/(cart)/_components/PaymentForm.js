'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ChevronLeft } from 'lucide-react';

export default function PaymentForm({ setStep }) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js no ha cargado todavía.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Asegúrate de que esta URL coincida con la página de éxito que creaste.
        return_url: `${window.location.origin}/PaymentSuccess`,
      },
    });

    // Este código solo se ejecutará si hay un error inmediato durante la confirmación del pago.
    // Si el pago se procesa correctamente, el usuario será redirigido a la `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("Ocurrió un error inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-10">
        <span className="text-slate-500 text-sm font-medium">Paso 3 de 3</span>
        <button onClick={() => setStep(2)} className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 hover:text-indigo-700 transition-colors">
          <ChevronLeft size={24} />
          <h1 className="text-3xl font-bold">Pago</h1>
        </button>
      </div>

      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        
        <button 
          disabled={isLoading || !stripe || !elements} 
          id="submit"
          className="w-full mt-8 bg-indigo-800 text-white font-bold py-4 rounded-xl hover:bg-indigo-900 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "Pagar ahora"}
          </span>
        </button>

        {/* Muestra cualquier mensaje de error que ocurra durante el proceso de pago */}
        {errorMessage && <div id="payment-message" className="mt-4 text-red-600 text-center">{errorMessage}</div>}
      </form>

      {/* --- Sellos de Confianza --- */}
      <div className="mt-12 flex flex-col items-center">
        <div className="border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3">
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pago Seguro</span>
           <div className="h-4 w-px bg-gray-200"></div>
           <div className="flex gap-2 items-center opacity-80 grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
           </div>
        </div>
      </div>
    </div>
  );
}