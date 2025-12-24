"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useCartStore } from "@/stores/cart.store";

import Summary from "../../_components/Summary";
import FormData from "../../_components/FormData";
import Payment from "../../_components/Payment";
import PaymentSuccess from "../../_components/PaymentSuccess";

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
    const [success, setSuccess] = useState(false);
console.log(success);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { cart, addToCart, decrementQuantity, removeFromCart } = useCartStore();

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
      setStep={setStep}
    />}
    {step === 2 && <FormData setStep={setStep} />}
    {step === 3 && <Payment setStep={setStep} setSuccess={setSuccess} />}
     </>
  );
}
