"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useCheckoutStore } from "@/stores/checkout.store";
import { useShippingQuote } from "../../_components/useShippingQuote";
import toast from "react-hot-toast";

import Summary from "../../_components/Summary";
import CheckoutAccess from "../../_components/CheckoutAccess";
import FormData from "../../_components/FormData";
import Payment from "../../_components/Payment";
import PaymentSuccess from "../../_components/PaymentSuccess";
import { markLeavingCart } from "@/app/components/CartScrollRestore";
import { verifyCheckoutSession } from "@/app/components/courseCatalog";

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  // Casilla «guardar tarjeta» del paso 2 (save_card del checkout de
  // catálogo). Vive aquí, no en el store persistido de envío: así arranca
  // SIEMPRE desmarcada en cada visita a /cart, nunca heredada de una compra
  // anterior en el mismo navegador.
  const [saveCard, setSaveCard] = useState(false);
  // Auditoría julio, hallazgo #17: mientras se confirma el pago con el
  // backend (o con Stripe.js), no se pinta ni el carrito ni la pantalla de
  // gracias — antes `?success=true` bastaba por sí solo para vaciar el
  // carrito y mostrar «pago completado» sin comprobar nada.
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Carrito 3.3: al salir de /cart (atrás o enlaces de volver) se marca la
  // salida para que la página anterior restaure su posición de scroll.
  // `pagehide` porque salir de /cart cambia de grupo de layout (navegación
  // completa, sin cleanup de React).
  useEffect(() => {
    window.addEventListener('pagehide', markLeavingCart);
    return () => {
      markLeavingCart();
      window.removeEventListener('pagehide', markLeavingCart);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const paymentIntentSecret = params.get('payment_intent_client_secret');
    const redirectStatus = params.get('redirect_status');

    const finishAsPaid = () => {
      setSuccess(true);
      setStep(3); // Render the success screen
      useCartStore.getState().clearCart();
    };

    // Vuelta de una Stripe Checkout Session (alojada o incrustada): el
    // `session_id` (cs_...) viaja siempre en el success_url que construye el
    // backend. Se confirma con Stripe vía el backend antes de dar nada por
    // pagado — un `?success=true` suelto en la URL ya no basta.
    if (sessionId) {
      setVerifyingPayment(true);
      verifyCheckoutSession(sessionId).then(({ paid }) => {
        setVerifyingPayment(false);
        if (paid) finishAsPaid();
        // Si no está pagada, se deja el carrito intacto: mejor que el
        // cliente reintente el pago a que vea una "compra completada" falsa.
      });
      return;
    }

    // Vuelta de un PaymentIntent con redirección obligatoria (Klarna, PayPal,
    // 3-D Secure…): Stripe añade payment_intent_client_secret y
    // redirect_status a la return_url. Se confirma con el propio Stripe.js
    // (stripe.retrievePaymentIntent), que consulta el estado real — nunca el
    // texto de la URL, que cualquiera puede escribir a mano.
    if (redirectStatus && paymentIntentSecret) {
      setVerifyingPayment(true);
      import('@stripe/stripe-js').then(({ loadStripe }) => {
        const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!pk) {
          setVerifyingPayment(false);
          return;
        }
        return loadStripe(pk).then((stripe) =>
          stripe.retrievePaymentIntent(paymentIntentSecret).then(({ paymentIntent }) => {
            setVerifyingPayment(false);
            if (paymentIntent?.status === 'succeeded') finishAsPaid();
          }),
        );
      }).catch(() => setVerifyingPayment(false));
      return;
    }

    // El carrito se ve y se edita en el pop-up, así que al pulsar "Finalizar
    // compra" se entra directo en los datos de envío. El guard de auth de más
    // abajo devuelve al paso 1 si no hay sesión.
    if (params.get('step') === '2') {
      setStep(2);
    }
  }, []);

  // SIN muro de login: si no hay sesión, el paso intermedio pide solo el email
  // (CheckoutAccess) y resuelve invitado/contraseña sin salir del carrito.
  const [needsAccess, setNeedsAccess] = useState(false);

  const handleSetStep = (nextStep) => {
    if (nextStep > 1 && !token) {
      setNeedsAccess(true);
      return;
    }
    setNeedsAccess(false);
    setStep(nextStep);
  };

  const { cart, addToCart, decrementQuantity, removeFromCart, updateQuantity, lastRemoved, undoRemove } = useCartStore();
  const { formData } = useCheckoutStore();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  // El envío solo aplica a productos físicos (los digitales van con isDirectCheckout)
  const hasPhysicalItems = cart.some((item) => !item.isDirectCheckout);

  // Tarifa real de la zona (12.2). En este paso puede que aún no haya
  // dirección: entonces `sinDestino` es true y el resumen lo dice en vez de
  // inventarse un importe.
  const {
    shippingCost: shipping,
    missingForFree,
    freeThreshold,
    sinDestino,
  } = useShippingQuote(
    subtotal,
    formData?.country,
    formData?.postalCode,
    hasPhysicalItems,
  );
  const total = subtotal + shipping;
  const freeShippingThreshold = freeThreshold ?? 0;
  const remainingForFreeShipping = missingForFree ?? 0;

  if (!isClient) {
    return <div className="min-h-screen bg-white"></div>;
  }

  // Confirmando con Stripe/backend antes de decidir si se vacía el carrito
  // o se pinta la pantalla de gracias (auditoría julio, hallazgo #17).
  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <p className="text-indigo-900 font-medium">Confirmando tu pago…</p>
      </div>
    );
  }

  if (success) {
    return <PaymentSuccess />;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">
          Tu carrito está vacío
        </h1>
        {/* Si el último producto se eliminó (p. ej. con el botón −), se puede
            recuperar sin salir de la página. */}
        {lastRemoved && (
          <button
            type="button"
            onClick={undoRemove}
            className="mb-2 text-indigo-900 font-bold hover:underline cursor-pointer"
          >
            ↩ Deshacer: recuperar «{lastRemoved.item.name}»
          </button>
        )}
        <Link
          href="/cocina"
          className="mt-4 inline-block bg-indigo-800 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-900 transition-colors">
          Ver productos
        </Link>
      </div>
    );
  }

  if (needsAccess && !token) {
    return (
      <CheckoutAccess
        onReady={() => {
          setNeedsAccess(false);
          setStep(2);
        }}
      />
    );
  }

  return (
    <>
    {step === 1 && <Summary
      cart={cart}
      totalItems={totalItems}
      subtotal={subtotal}
      shipping={shipping}
      sinDestino={sinDestino}
      total={total}
      freeShippingThreshold={freeShippingThreshold}
      remainingForFreeShipping={remainingForFreeShipping}
      addToCart={addToCart}
      decrementQuantity={decrementQuantity}
      removeFromCart={removeFromCart}
      updateQuantity={updateQuantity}
      setStep={handleSetStep}
    />}
    {step === 2 && (
      <FormData setStep={handleSetStep} saveCard={saveCard} onSaveCardChange={setSaveCard} />
    )}
    {step === 3 && <Payment setStep={handleSetStep} setSuccess={setSuccess} saveCard={saveCard} />}
     </>
  );
}
