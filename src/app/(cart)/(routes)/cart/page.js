"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

import Summary from "../../_components/Summary";
import CheckoutAccess from "../../_components/CheckoutAccess";
import FormData from "../../_components/FormData";
import Payment from "../../_components/Payment";
import PaymentSuccess from "../../_components/PaymentSuccess";
import { markLeavingCart } from "@/app/components/CartScrollRestore";

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

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

    // Detect Stripe redirect success
    const params = new URLSearchParams(window.location.search);
    if (params.get('redirect_status') === 'succeeded' || params.get('success') === 'true') {
      setSuccess(true);
      setStep(3); // Render the success screen
      useCartStore.getState().clearCart();
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

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  // El envío solo aplica a productos físicos (los digitales van con isDirectCheckout)
  const hasPhysicalItems = cart.some((item) => !item.isDirectCheckout);
  const shipping = hasPhysicalItems ? 4.99 : 0;
  const total = subtotal + shipping;
  const freeShippingThreshold = 90.0;
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  if (!isClient) {
    return <div className="min-h-screen bg-white"></div>;
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
      total={total}
      freeShippingThreshold={freeShippingThreshold}
      remainingForFreeShipping={remainingForFreeShipping}
      addToCart={addToCart}
      decrementQuantity={decrementQuantity}
      removeFromCart={removeFromCart}
      updateQuantity={updateQuantity}
      setStep={handleSetStep}
    />}
    {step === 2 && <FormData setStep={handleSetStep} />}
    {step === 3 && <Payment setStep={handleSetStep} setSuccess={setSuccess} />}
     </>
  );
}
