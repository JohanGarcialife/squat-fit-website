'use client';
import React, { useRef, useState, useCallback } from 'react';
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { useCartStore } from "@/stores/cart.store";

export default function FormData(props) {
  const { setStep } = props;
  const { cart } = useCartStore();

  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const checkoutFormRef = useRef();

  const handleValidationChange = useCallback((isValid, dirty) => {
    setIsFormValid(isValid);
    setIsFormDirty(dirty);
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const shippingCost = 4.99;
  const freeShippingThreshold = 90.00;
  
  const finalShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = subtotal + finalShipping;

  const triggerCheckoutFormSubmit = async () => {
    if (checkoutFormRef.current) {
      await checkoutFormRef.current(); 
      if (isFormValid) {
        setStep(3);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      
      {/* Columna Izquierda: Formulario (aprox 60%) */}
      <div className="w-full lg:w-3/5 xl:w-1/2 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
        <CheckoutForm 
            setStep={setStep} 
            onValidationChange={handleValidationChange}
            submitRef={checkoutFormRef}
        />
      </div>
      
      {/* Columna Derecha: Resumen (aprox 40%, fondo Peach) */}
      <div className="w-full lg:w-2/5 xl:w-1/2 min-h-screen bg-[#FFF5F3]">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <OrderSummary 
            setStep={setStep} 
            total={total} 
            finalShipping={finalShipping} 
            subtotal={subtotal} 
            isFormValid={isFormValid}
            isFormDirty={isFormDirty}
            triggerCheckoutFormSubmit={triggerCheckoutFormSubmit}
          />
        </div>
      </div>
    </div>
  );
}
