"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

import Summary from "../../_components/Summary";
import FormData from "../../_components/FormData";
import Payment from "../../_components/Payment";
import PaymentSuccess from "../../_components/PaymentSuccess";

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

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

  // Force Step 1 if the user is not authenticated
  useEffect(() => {
    if (isClient && step > 1 && !token) {
      setStep(1);
      toast.error("Debes iniciar sesión para realizar la compra.");
      router.push("/login?redirect=/cart");
    }
  }, [step, token, isClient, router]);

  const handleSetStep = (nextStep) => {
    if (nextStep > 1 && !token) {
      toast.error("Debes iniciar sesión para realizar la compra.");
      router.push("/login?redirect=/cart");
      return;
    }
    setStep(nextStep);
  };

  const { cart, addToCart, decrementQuantity, removeFromCart, updateQuantity } = useCartStore();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = 4.99;
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
        <Link
          href="/cocina"
          className="mt-4 inline-block bg-indigo-800 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-900 transition-colors">
          Ver productos
        </Link>
      </div>
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
