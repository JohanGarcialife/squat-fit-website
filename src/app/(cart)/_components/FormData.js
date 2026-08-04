'use client';
import React, { useRef, useState, useCallback } from 'react';
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { useCartStore } from "@/stores/cart.store";
import { useCheckoutStore } from "@/stores/checkout.store";
import { useShippingQuote } from "./useShippingQuote";
import useTecladoAbierto from "@/hooks/useTecladoAbierto";

export default function FormData(props) {
  const { setStep, saveCard, onSaveCardChange } = props;
  const { cart } = useCartStore();
  // Este es el paso con formulario largo: es donde el teclado tapa cosas.
  const tecladoAbierto = useTecladoAbierto();

  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const checkoutFormRef = useRef();

  const handleValidationChange = useCallback((isValid, dirty) => {
    setIsFormValid(isValid);
    setIsFormDirty(dirty);
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  // El envío solo aplica a productos físicos (los digitales van con isDirectCheckout)
  const hasPhysicalItems = cart.some((item) => !item.isDirectCheckout);

  // Tarifa real de la zona de destino (12.2), no un 4,99 fijo para todo el
  // mundo. La calcula el backend, que es también quien la cobra.
  const { formData } = useCheckoutStore();
  // ENVÍO: el destino manda, no la facturación.
  // Si el cliente desmarcó «usar la misma dirección», la tarifa tiene que
  // salir del CP y el país a los que se manda el paquete. Calcularla con los
  // de facturación es cobrar la zona equivocada — entre España peninsular
  // (0 €) y Norteamérica (22,90 €) la diferencia no es un redondeo.
  const destinoEnvio = formData?.sameAddress === false
    ? { pais: formData?.shippingCountry, cp: formData?.shippingPostalCode }
    : { pais: formData?.country, cp: formData?.postalCode };
  const { shippingCost: finalShipping } = useShippingQuote(
    subtotal,
    destinoEnvio.pais,
    destinoEnvio.cp,
    hasPhysicalItems,
  );
  const total = subtotal + finalShipping;

  const triggerCheckoutFormSubmit = async () => {
    const formik = checkoutFormRef.current;
    if (!formik) return;
    // Validación REAL en el momento del clic (no el isFormValid del closure, que
    // arranca en true por defecto de Formik y dejaba saltar el paso vacío).
    const errs = await formik.validateForm();
    if (Object.keys(errs).length === 0) {
      // Persistimos los datos (onSubmit → updateFormData) y avanzamos al pago.
      await formik.submitForm();
      setIsFormValid(true);
      setStep(3);
    } else {
      // Marcamos todos los campos con error como "tocados" para que se muestren.
      formik.setTouched(
        Object.keys(errs).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      setIsFormValid(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      
      {/* Columna Izquierda: Formulario (aprox 60%) */}
      <div className="w-full lg:w-2/3 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
        <CheckoutForm
            setStep={setStep}
            onValidationChange={handleValidationChange}
            submitRef={checkoutFormRef}
            saveCard={saveCard}
            onSaveCardChange={onSaveCardChange}
        />
      </div>
      
      {/* Columna Derecha: Resumen — sticky a la derecha en desktop, sticky
          abajo (bottom sheet) en móvil para tener siempre a la vista el total.

          MIENTRAS SE ESCRIBE, LA BARRA SE VA. Con el teclado abierto quedaba
          una franja de dos o tres campos entre él y esta barra, y a veces el
          campo que estabas rellenando caía justo detrás. En escritorio, donde
          no hay teclado que suba, no se aplica nunca.

          SE ESCONDE CON `max-height`, NO CON `translate-y`. Un elemento con
          `transform` pasa a ser el marco de referencia de sus descendientes
          `position: fixed`, y el cajón del resumen es uno: con el translate
          puesto, el cajón se posicionaba contra ESTA barra en vez de contra la
          pantalla y no llegaba a deslizarse nunca. `max-height` anima igual y
          no crea contenedor. */}
      <div
        className={`w-full lg:w-1/3 lg:min-h-screen bg-orange-50 sticky bottom-0 lg:static z-40 rounded-t-3xl lg:rounded-none shadow-[0_-10px_30px_rgba(0,0,0,0.10)] lg:shadow-none transition-[max-height] duration-200 ${
          tecladoAbierto ? 'max-h-0 overflow-hidden lg:max-h-none lg:overflow-visible' : 'max-h-[80vh] lg:max-h-none'
        }`}
      >
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
