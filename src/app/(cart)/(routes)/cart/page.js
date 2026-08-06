"use client";

import React, { useEffect, useState, useRef } from "react";

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
import {
  enviarPurchase,
  enviarBeginCheckout,
  itemsDesdeCarrito,
  valorDesdeCarrito,
} from "@/app/components/ga4Ecommerce";

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

  // `begin_checkout` se emite UNA vez por visita: al carrito se puede volver
  // (botón «Volver» del paso 2), y cada ida y vuelta no es un checkout nuevo.
  const beginCheckoutEmitido = useRef(false);
  const emitirBeginCheckout = () => {
    if (beginCheckoutEmitido.current) return;
    if (enviarBeginCheckout(useCartStore.getState().cart)) {
      beginCheckoutEmitido.current = true;
    }
  };

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

    // `transactionId` es obligatorio para medir: es lo que evita que una
    // recarga de la pantalla de gracias cuente la venta dos veces. Se lee el
    // carrito ANTES de vaciarlo, que es lo único que queda del pedido en el
    // navegador al volver de Stripe.
    const finishAsPaid = (transactionId, importeReal = null, moneda = null) => {
      const comprado = useCartStore.getState().cart;
      // El importe bueno es el que confirma Stripe (`amount_total`): trae el
      // envío y los cupones dentro. El subtotal del carrito queda de respaldo
      // por si esa respuesta no lo trajera, y entonces declara de menos.
      enviarPurchase({
        transactionId,
        items: itemsDesdeCarrito(comprado),
        value: importeReal ?? valorDesdeCarrito(comprado),
        currency: moneda || 'EUR',
      });
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
      verifyCheckoutSession(sessionId).then(({ paid, amountTotal, currency }) => {
        setVerifyingPayment(false);
        if (paid) finishAsPaid(sessionId, amountTotal, currency);
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
            if (paymentIntent?.status === 'succeeded') finishAsPaid(paymentIntent.id);
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
      emitirBeginCheckout();
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
    if (nextStep === 2) emitirBeginCheckout();
    setNeedsAccess(false);
    setStep(nextStep);
  };

  const { cart, addToCart, decrementQuantity, removeFromCart, updateQuantity, lastRemoved, undoRemove } = useCartStore();
  const { formData, updateFormData } = useCheckoutStore();

  // El país de partida sale de la IP, no de un 'ES' escrito a mano.
  //
  // POR QUÉ. `checkout.store` arranca con `country: 'ES'`, así que hasta que
  // alguien rellenaba la dirección el carrito enseñaba las tarifas de España a
  // TODO EL MUNDO: «¡Tienes envío gratis!», «Envío 0,00 €» y un total sin
  // envío. Medido el 6-ago contra la API de tarifas: a México y Argentina se
  // les cobra 19,90 €, a Estados Unidos 22,90 y a Francia 9,90. O sea que a
  // quien compra desde fuera se le prometía gratis algo que cuesta hasta 22,90
  // y se enteraba al rellenar la dirección — y esa gente no es un caso raro: el
  // propio carrito le ofrece pagar en pesos mexicanos, argentinos, colombianos
  // y chilenos.
  //
  // `/api/geo` ya existe y es lo que usa el formulario de prellamada para
  // preseleccionar el país. Es una PISTA, no un dato: con VPN se equivoca. Por
  // eso solo se aplica cuando el formulario está SIN ESTRENAR (ni email, ni
  // nombre, ni dirección, ni ciudad, ni código postal), que es la señal de que
  // ese 'ES' es el valor por defecto y no algo que haya elegido nadie. En
  // cuanto la persona escribe su dirección manda ella, y el backend vuelve a
  // calcular el envío al cobrar, así que el importe real nunca depende de esto.
  // HAY QUE ESPERAR A LA HIDRATACIÓN, y esto no es teórico: la primera versión
  // de este efecto le CAMBIABA EL PAÍS a quien volvía con la dirección ya
  // puesta. `persist` de zustand rellena desde localStorage DESPUÉS del primer
  // render, así que en ese primer render el formulario parece recién estrenado
  // aunque no lo esté, la comprobación de abajo pasaba y el país de la IP se
  // colaba encima del que había guardado la persona. Se vio probando con un
  // formulario a medias; sin esa prueba habría llegado a producción.
  const geoPedido = useRef(false);
  useEffect(() => {
    const intentar = () => {
      if (geoPedido.current) return;
      const f = useCheckoutStore.getState().formData;
      const sinEstrenar =
        !f?.email &&
        !f?.firstName &&
        !f?.lastName &&
        !f?.address &&
        !f?.city &&
        !f?.postalCode;
      if (!sinEstrenar) return;
      geoPedido.current = true;
      fetch('/api/geo')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          // Sin cabecera de país (en local, o tras un proxy que la quita) no se
          // toca nada: mejor el valor de antes que uno inventado.
          if (d?.iso && d.iso !== useCheckoutStore.getState().formData?.country) {
            updateFormData({ country: d.iso });
          }
        })
        .catch(() => {});
    };

    if (useCheckoutStore.persist?.hasHydrated?.()) {
      intentar();
      return undefined;
    }
    return useCheckoutStore.persist?.onFinishHydration?.(intentar);
  }, [updateFormData]);

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
