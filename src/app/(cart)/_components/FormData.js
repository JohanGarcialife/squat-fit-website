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
  // El envío solo aplica a productos físicos (los digitales van con isDirectCheckout)
  const shippingCost = cart.some((item) => !item.isDirectCheckout) ? 4.99 : 0;
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
      
      {/* Columna Derecha: Resumen — sticky a la derecha en desktop, sticky
          abajo (bottom sheet) en móvil para tener siempre a la vista el total. */}
      <div className="w-full lg:w-2/5 xl:w-1/2 lg:min-h-screen bg-orange-50 sticky bottom-0 lg:static z-40 rounded-t-3xl lg:rounded-none shadow-[0_-10px_30px_rgba(0,0,0,0.10)] lg:shadow-none">
        <div className="lg:sticky lg:top-0 lg:h-screen max-h-[70vh] lg:max-h-none overflow-y-auto">
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
