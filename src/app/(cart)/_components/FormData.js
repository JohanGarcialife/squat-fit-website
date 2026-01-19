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

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 4.99;
  const freeShippingThreshold = 90.00;
  
  const finalShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = subtotal + finalShipping;

  const triggerCheckoutFormSubmit = async () => {
    if (checkoutFormRef.current) {
      await checkoutFormRef.current(); // Call Formik's submitForm
      // Formik's onSubmit will update store and then we can proceed
      // The onSubmit in CheckoutForm will update the formData in store,
      // and here we rely on the state (isFormValid) being updated by onValidationChange
      // to decide if we proceed to the next step.
      if (isFormValid) {
        setStep(3);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <h1 className="text-3xl font-extrabold text-text-primary">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <CheckoutForm 
              setStep={setStep} 
              onValidationChange={handleValidationChange}
              submitRef={checkoutFormRef}
            />
          </div>
          <div>
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
      </main>
    </div>
  );
}
