'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCheckoutStore } from '@/stores/checkout.store';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

// Make sure to configure your .env.local with NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Componente interno que ya tiene acceso a los hooks de Stripe
function PaymentInner(props) {
  const { setStep, setSuccess } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Procesando pago...');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/cart?success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message, { id: toastId });
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
          const msg = paymentIntent.status === 'succeeded'
            ? 'Pago completado con éxito'
            : 'El pago se está procesando. Te avisaremos cuando se complete.';
          toast.success(msg, { id: toastId });

          // Limpiar el carrito y actualizar estado de suscripción en el store global
          useCartStore.getState().clearCart();
          await useAuthStore.getState().refreshSubscriptionStatus();

          setSuccess(true);
        } else {
          toast.error(`Estado del pago: ${paymentIntent.status}`, { id: toastId });
        }
      } else {
        // En caso de que no haya error ni paymentIntent (raro pero posible)
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.error("Stripe confirm error:", err);
      toast.error('Ocurrió un error inesperado al procesar el pago', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Columna Izquierda: Formulario Stripe (aprox 60%) */}
      <div className="w-full lg:w-3/5 xl:w-1/2 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
        
        {/* Header */}
        <div className="mb-10">
            <span className="text-indigo-900 text-lg font-medium">Paso 3 de 3</span>
            <div onClick={() => setStep(2)} className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 group">
                <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                <h1 className="text-3xl md:text-4xl font-bold">Pago</h1>
            </div>
        </div>

        {/* Métodos de Pago Integrados de Stripe */}
        <div className="mb-12">
            <h2 className="text-indigo-900 font-bold text-lg mb-4">Métodos de pago</h2>
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <PaymentElement />
                
                {/* Logos de seguridad */}
                <div className="mt-10 opacity-80">
                    <div className="relative w-48 h-12">
                         <div className="flex items-center gap-2 border border-gray-200 rounded p-2 bg-gray-50 text-xs text-gray-500">
                            <span>PAGO SEGURO</span>
                            <span className="font-bold">Stripe</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Columna Derecha: Resumen */}
      <div className="w-full lg:w-2/5 xl:w-1/2 lg:min-h-screen bg-orange-50 sticky bottom-0 lg:static z-40 rounded-t-3xl lg:rounded-none shadow-[0_-10px_30px_rgba(0,0,0,0.10)] lg:shadow-none">
        <div className="lg:sticky lg:top-0 lg:h-screen max-h-[70vh] lg:max-h-none overflow-y-auto">
          <OrderSummary 
             triggerCheckoutFormSubmit={handleSubmit}
             isFormValid={!isProcessing} // Prevenir clicks múltiples mientras procesa
             isFormDirty={true}
          />
        </div>
      </div>
    </div>
  );
}

// Wrapper principal que obtiene el clientSecret antes de montar el formulario
export default function Payment(props) {
  const router = useRouter();
  const { cart } = useCartStore();
  const { token } = useAuthStore();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  // Cursos con tramos (15.1) sin endpoint de cobro todavía (TIER_CHECKOUT_ENDPOINT
  // en null): aviso honesto en lugar de un error críptico de Stripe.
  const [pendingBackend, setPendingBackend] = useState(false);

  const appearance = useMemo(() => ({
    theme: 'stripe',
    variables: {
      colorPrimary: '#FF690B', // Naranja de marca SquadFit
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      spacingUnit: '4px',
      borderRadius: '8px',
    }
  }), []);

  const options = useMemo(() => ({
    clientSecret,
    appearance
  }), [clientSecret, appearance]);

  useEffect(() => {
    if (!cart || cart.length === 0) return;

    let endpoint = '';
    let payload = {};

    // Detectar si es un checkout de suscripción directo o un carrito mixto
    const directItem = cart.find(item => item.isDirectCheckout);

    // Item directo SIN endpoint (curso con tramo, a la espera del checkout de
    // productos del catálogo en el backend): no hay nada que cobrar aún.
    if (directItem && !directItem.endpoint) {
       setPendingBackend(true);
       setLoading(false);
       return;
    }

    if (directItem && directItem.endpoint) {
       endpoint = directItem.endpoint;
       payload = directItem.payload;
    } else {
       // Carrito global de productos físicos
       if (cart.length > 1) {
           toast.error('La API actual solo procesa 1 tipo de artículo a la vez. Por favor ajusta tu carrito.', { duration: 5000 });
           setLoading(false);
           return;
       }
       
       const item = cart[0];
       
       // Origen/atribución de la venta (capturado por UTMCapture) para que el
       // pedido llegue al back office con su columna Origen rellena
       let origin;
       try { origin = localStorage.getItem('sf_origin') || undefined; } catch { origin = undefined; }

       // Dirección de envío del paso 2 (formulario de checkout): el pedido la
       // necesita en el back office para preparar el envío del producto físico
       const f = useCheckoutStore.getState().formData || {};
       const shipping = f.address
         ? {
             companyName: f.companyName || undefined,
             firstName: f.firstName || undefined,
             lastName: f.lastName || undefined,
             address: f.address,
             apartment: f.apartment || undefined,
             postalCode: f.postalCode || undefined,
             city: f.city || undefined,
             country: f.country || undefined,
             phone: f.phone || undefined,
             dni_cif: f.dni_cif || undefined,
             notes: f.shippingNotes || undefined,
           }
         : undefined;

       if (item.type === 'pack') {
           endpoint = '/api/v1/book/create-payment-intent-pack';
           payload = { pack_id: item.id, quantity: item.quantity || 1, origin, shipping };
       } else {
           endpoint = '/api/v1/book/create-payment-intent-version';
           payload = { version_id: item.id, quantity: item.quantity || 1, origin, shipping };
       }
    }

    const fetchPaymentIntent = async () => {
      try {
        const response = await axios.post(
          `https://squatfit-api-cyrc2g3zra-no.a.run.app${endpoint}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Manejar el caso donde el usuario ya tiene la suscripción activa Y es mismo/menor tier
        if (response.data.hasActiveSubscription && !response.data.isUpgrade) {
            toast.success("¡Ya tienes esta suscripción activa! Redirigiendo a tu biblioteca...");
            useCartStore.getState().clearCart();
            useAuthStore.getState().setSubscribed(true);
            router.push('/panel-cocina');
            return;
        }

        // Caso upgrade (isUpgrade: true) → el backend devuelve clientSecret, proceder con pago
        if (response.data.isUpgrade) {
            toast.success("¡Upgrade detectado! Completa el pago para actualizar tu suscripción.");
        }

        // Stripe nos mandará el client_secret o clientSecret
        const secret = response.data.clientSecret || response.data.client_secret;
        setClientSecret(secret);
      } catch (error) {
        console.error("Error creating payment intent", error);
        console.error("Payload sent:", JSON.stringify(payload));
        if (error.response?.data) {
           console.error("Server validation errors:", JSON.stringify(error.response.data));
           const serverSms = error.response.data.message || error.response.data.error;
           toast.error(typeof serverSms === 'string' ? serverSms : JSON.stringify(serverSms));
        } else {
           toast.error("Error al iniciar el pago");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [cart, token]);

  if (loading) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
        </div>
    );
  }

  if (pendingBackend) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
            <div className="text-5xl mb-4">🛠️</div>
            <h2 className="text-indigo-900 text-2xl font-bold mb-3">La compra online de este curso se activa muy pronto</h2>
            <p className="text-gray-500 max-w-md leading-relaxed mb-8">
                Estamos terminando de conectar el pago de los cursos. Mientras tanto,
                escríbenos y te lo activamos al momento:{' '}
                <a href="mailto:hola@squatfit.es" className="text-orange-500 font-bold underline">hola@squatfit.es</a>
            </p>
            <button onClick={() => props.setStep(1)} className="text-secondary font-bold underline cursor-pointer">Volver al carrito</button>
        </div>
    );
  }

  if (!clientSecret) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <p className="text-red-500 font-bold mb-4">No se pudo inicializar el pago seguro.</p>
            <button onClick={() => props.setStep(2)} className="text-secondary font-bold underline">Volver</button>
        </div>
    );
  }

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={options}>
      <PaymentInner {...props} />
    </Elements>
  );
}
