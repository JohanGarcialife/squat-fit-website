'use client';

// Pago de Stripe montado DENTRO de nuestra página.
//
// Por qué así y no con PaymentElement a medida: el formulario lo mantiene
// Stripe, así que cupones, wallets (Apple/Google Pay), 3DS, multidivisa y
// validación vienen resueltos y actualizados. Con el PaymentElement todo eso
// hay que construirlo y mantenerlo a mano — y es justo donde se pudren estas
// integraciones: la nuestra llegó a producción con `pk_test_placeholder` y
// nadie lo detectó.
//
// A cambio de esa comodidad no se pierde la marca: el cliente no sale de
// squadfit.es, la cabecera y el pie siguen siendo nuestros, y los colores, el
// logo y la tipografía salen de la configuración de marca de la cuenta de
// Stripe (ya configurada: #363c98 / #ff6a0b).

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

export default function CheckoutIncrustado({ clientSecret, onError }) {
  if (!PK) {
    // Antes esto era un `pk_test_placeholder` silencioso que fallaba en el
    // momento del pago. Mejor decirlo alto y claro que fingir que funciona.
    if (typeof window !== 'undefined') {
      console.error('[checkout] Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    }
    return (
      <p className="text-center text-[#B4230E] py-8">
        El pago no está disponible ahora mismo. Escríbenos y lo resolvemos en un momento.
      </p>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="w-full" data-testid="checkout-incrustado">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret, onComplete: undefined }}
      >
        <EmbeddedCheckout className="w-full" onError={onError} />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
