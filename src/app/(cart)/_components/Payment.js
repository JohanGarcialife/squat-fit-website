'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { handleApiError } from '@/app/components/handleApiError';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCheckoutStore } from '@/stores/checkout.store';
import CheckoutIncrustado from './CheckoutIncrustado';
import { ORDER_REF_KEY, saveOrderItems } from './TrustpilotInvitation';
import { saveOrderAccess } from './accesoComprado';
import axios from 'axios';
import { createTierCheckout } from '@/app/components/courseCatalog';
import { enviarPurchase, itemsDesdeCarrito, valorDesdeCarrito } from '@/app/components/ga4Ecommerce';
import { resolveOrigin } from '@/app/components/UTMCapture';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import PagoSequra, { evaluarSequra } from './PagoSequra';
import SequraSimulador from '@/app/components/SequraSimulador';
import CabeceraPaso from './CabeceraPaso';
import Spinner from '@/app/components/Spinner';

/**
 * Iconos de los métodos de pago.
 *
 * Dibujados a mano en SVG en vez de traídos de un CDN: la CSP de esta web no
 * deja cargar imágenes de terceros sin tocarla, y ya nos costó 15 horas de
 * carrito caído el 28-jul. Además son dos formas simples — una tarjeta y unas
 * cuotas — que no justifican una dependencia.
 *
 * `currentColor` a propósito: el icono se tiñe con el color del texto de la
 * fila, así acompaña al estado elegido/sin elegir sin lógica aparte.
 */
function IconoTarjeta() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 9.5h20" stroke="currentColor" strokeWidth="1.6" />
      <rect x="5" y="13" width="5" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

/** Tres cuotas: un importe que se parte en plazos iguales. */
function IconoPlazos() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="6" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="7" width="6" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="16" y="7" width="6" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Una fila del selector de método de pago, en el paso 3.
 *
 * Es un `radio` de verdad, no un `<div onClick>`: con teclado se recorren las
 * opciones con las flechas y el lector de pantalla las anuncia como «1 de 2».
 * Un div con onClick no hace ninguna de las dos cosas, y esto es la pantalla
 * donde se paga.
 *
 * `onClick` en vez de `onChange`: las filas también PLIEGAN al volver a
 * pulsarlas, y un `onChange` de radio no dispara cuando ya está marcado.
 */
function OpcionDePago({ activo, onClick, titulo, sub, icono, pie }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
        activo
          ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        type="radio"
        name="metodo-de-pago"
        checked={activo}
        onChange={() => {}}
        onClick={onClick}
        className="mt-1 accent-indigo-600 cursor-pointer"
      />
      <span className={`mt-0.5 shrink-0 ${activo ? 'text-indigo-600' : 'text-slate-400'}`}>
        {icono}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-indigo-900">{titulo}</span>
        {sub && <span className="block text-xs text-slate-500 mt-0.5">{sub}</span>}
        {/* El simulador de cuotas se pinta aunque la opción esté sin elegir:
            es justo el dato que hace que alguien la elija. */}
        {pie && <span className="block mt-0.5">{pie}</span>}
      </span>
    </label>
  );
}

// La clave publicable viene SIEMPRE del entorno (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).
// Sin fallback de test: si falta, el pago embebido debe fallar a la vista, no
// cargar Stripe en modo prueba en silencio (nos pasó de cara al lanzamiento).
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.reject(new Error('Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'));

// Componente interno que ya tiene acceso a los hooks de Stripe
function PaymentInner(props) {
  const { setStep, setSuccess } = props;
  const { cart } = useCartStore();
  const datosCliente = useCheckoutStore((e) => e.formData);
  const totalCarrito = (cart || []).reduce(
    (acc, i) => acc + Number(i.price || 0) * (i.quantity || 1),
    0,
  );
  // La divisa la elige el cliente arriba; seQura solo opera en euros.
  const divisa = (() => {
    try { return localStorage.getItem('sf_currency') || 'EUR'; } catch { return 'EUR'; }
  })();
  const sequra = evaluarSequra(cart, totalCarrito, divisa, datosCliente);
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

          // Referencia del pedido para la invitación de Trustpilot: con
          // `redirect: 'if_required'` Stripe confirma aquí mismo y la pantalla
          // de gracias no recibe `session_id` ni `payment_intent` en la URL,
          // así que se la dejamos escrita nosotros.
          try { sessionStorage.setItem(ORDER_REF_KEY, paymentIntent.id); } catch {}

          // `purchase` para GA4, AQUÍ y no en la pantalla de gracias.
          //
          // Con `redirect: 'if_required'` —la línea de arriba— una tarjeta que no
          // pide 3-D Secure se confirma en esta misma página: no hay redirección,
          // la URL no recibe `session_id` ni `payment_intent`, y por tanto el
          // `finishAsPaid` de /cart/page.js NUNCA llega a ejecutarse. Ese es el
          // único sitio donde se emitía `purchase`.
          //
          // Medido el 5-ago-2026 en GA4: el flujo del sitio nuevo manda
          // `add_to_cart` y `begin_checkout`, y CERO `purchase` en 28 días —
          // mientras que en la base había cuatro pedidos reales por la web en esa
          // misma ventana. O sea que la analítica no ha visto ni un euro de lo
          // que se vende por el carrito, y el embudo se corta antes de la venta.
          //
          // El importe sale del PaymentIntent (céntimos → euros), que es lo que
          // Stripe ha cobrado de verdad, con envío y cupones ya dentro; el
          // subtotal del carrito queda de respaldo, igual que en la otra rama.
          // Y el carrito se lee ANTES de vaciarlo.
          //
          // No hay riesgo de contar la venta dos veces: `enviarPurchase` ignora
          // un `transaction_id` ya enviado, y además los dos caminos no coinciden
          // nunca — el checkout incrustado vuelve con `cs_...` por la URL y este
          // confirma aquí con `pi_...` sin recargar.
          const comprado = useCartStore.getState().cart;
          enviarPurchase({
            transactionId: paymentIntent.id,
            items: itemsDesdeCarrito(comprado),
            value: typeof paymentIntent.amount === 'number'
              ? paymentIntent.amount / 100
              : valorDesdeCarrito(comprado),
            currency: (paymentIntent.currency || 'eur').toUpperCase(),
          });

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
      <div className="w-full lg:w-2/3 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
        
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
                
                {/* Pago fraccionado con seQura. Solo se pinta cuando de verdad
                    se puede usar: sin suscripciones, en euros y entre 50 y
                    4.000 €. Enseñar una opción que al pulsarla dice «no
                    disponible» es peor que no enseñarla. */}
                {sequra.aplica && (
                    <div className="mt-8 pt-8 border-t border-indigo-100">
                        <p className="text-slate-500 text-sm mb-4 text-center">o si lo prefieres</p>
                        <PagoSequra cart={cart} total={totalCarrito} formData={datosCliente} />
                    </div>
                )}
                {/* Si falta poco para el mínimo, se dice: al cliente le sirve y
                    de paso sube el importe medio del pedido. */}
                {!sequra.aplica && sequra.cerca && (
                    <p className="mt-8 pt-8 border-t border-indigo-100 text-sm text-slate-500 text-center">
                        Añade {sequra.falta.toFixed(2)} € más y podrás pagarlo a plazos con seQura.
                    </p>
                )}

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
      <div className="w-full lg:w-1/3 lg:min-h-screen bg-orange-50 sticky bottom-0 lg:static z-40 rounded-t-3xl lg:rounded-none shadow-[0_-10px_30px_rgba(0,0,0,0.10)] lg:shadow-none">
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
  // Casilla del paso 2 (save_card). Si no se marcó, es `undefined`/`false` y
  // createTierCheckout manda exactamente el mismo payload que antes de este
  // cambio (su propio default es `false`).
  const { saveCard } = props;
  const [clientSecret, setClientSecret] = useState('');
  // Secreto de una Checkout Session (cs_…): el pago se monta incrustado.
  const [embeddedSecret, setEmbeddedSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  // Cursos con tramos (15.1) sin endpoint de cobro todavía (TIER_CHECKOUT_ENDPOINT
  // en null): aviso honesto en lugar de un error críptico de Stripe.
  const [pendingBackend, setPendingBackend] = useState(false);
  // Motivo por el que no se pudo montar el pago, TAL COMO lo explica el
  // backend. Existía ya como `toast.error(...)`, pero un toast dura unos
  // segundos: lo útil se esfumaba y lo que quedaba en pantalla era
  // «No se pudo inicializar el pago seguro», que suena a web rota.
  //
  // El caso que lo destapó (2-ago, recorriendo la compra en navegador real):
  // quien ya tiene un libro recibe un 400 con «Ya tienes «Libro de cocina 1»
  // en tu biblioteca, no hace falta que lo compres otra vez». Ese mensaje
  // está escrito a mano, en castellano y con el nombre del libro dentro
  // —ver el comentario de book.service.ts, que da por hecho que el comprador
  // lo lee «tal cual»—, y el cliente se quedaba sin verlo.
  const [motivoDelFallo, setMotivoDelFallo] = useState(null);

  // Pago fraccionado: los mismos datos que usa `PaymentInner`, porque la
  // opción de seQura se ofrece en las DOS ramas del paso 3 (Payment Element y
  // Checkout incrustado) y el cliente tiene que verla en cualquiera de ellas.
  const datosCliente = useCheckoutStore((e) => e.formData);
  const totalCarrito = (cart || []).reduce(
    (acc, i) => acc + Number(i.price || 0) * (i.quantity || 1),
    0,
  );
  const divisa = (() => {
    try { return localStorage.getItem('sf_currency') || 'EUR'; } catch { return 'EUR'; }
  })();
  const sequra = evaluarSequra(cart, totalCarrito, divisa, datosCliente);
  // Qué pasarela está desplegada en el paso 3. Arranca en NINGUNA: las dos
  // filas se ven plegadas y el cliente abre la suya. Antes arrancaba en Stripe
  // con su caja ya desplegada, y eso convertía la otra opción en la rara de
  // debajo en vez de en una alternativa de igual peso.
  const [metodo, setMetodo] = useState(null);

  // Al llegar al paso 3 la página debe empezar ARRIBA del todo. En móvil el
  // resumen va encima del pago, y sin esto se entraba con el scroll heredado
  // del paso 2: parecía que faltaba media pantalla por encima.
  useEffect(() => {
    if (embeddedSecret) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [embeddedSecret]);

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

    // Foto de las líneas del pedido para la reseña de producto de Trustpilot.
    // Hay que tomarla AQUÍ: la pantalla de gracias vacía el carrito antes de
    // montarse, y en el checkout incrustado la vuelta de Stripe recarga la
    // página, así que el carrito ya no existe cuando sale la invitación.
    saveOrderItems(cart);

    // Foto de lo comprado (tipo + destino) para que la pantalla de gracias
    // lleve al producto de ESTE pedido y no a tarjetas fijas. Se toma aquí por
    // lo mismo que la de Trustpilot: después del pago el carrito ya está vacío.
    saveOrderAccess(cart);

    let endpoint = '';
    let payload = {};

    // Detectar si es un checkout de suscripción directo o un carrito mixto
    const directItem = cart.find(item => item.isDirectCheckout);

    // Curso con tramo (15.1): cobro contra el checkout de tramos de la Fase 9,
    // con detección en vivo. Si el backend devuelve una Stripe Checkout
    // Session se redirige (vuelta a /cart?success=true); si devuelve un
    // clientSecret se monta el Payment Element; si el endpoint aún no está
    // desplegado (404), se mantiene el aviso honesto de «muy pronto».
    if (directItem && (directItem.tierGroup || directItem.tier)) {
       // `datosCliente` es lo que el cliente escribió en el paso 2: de ahí
       // salen la dirección de envío (para que Stripe no la vuelva a pedir y
       // se envíe adonde se calculó el precio) y su nombre y teléfono (para
       // que el pago no aparezca sin nombre en el panel de Stripe).
       createTierCheckout(directItem, { token, saveCard, formData: datosCliente })
         .then((result) => {
           if (result.status === 'embedded') {
             // Lo normal desde ahora: el pago se pinta AQUÍ, sin salir de la web.
             // OJO: hay que apagar `loading` ANTES de salir. El render comprueba
             // `loading` antes que `embeddedSecret`, así que si se sale sin
             // apagarlo el spinner se queda para siempre y el pago no aparece
             // nunca. (Se coló así al añadir el incrustado y dejó el carrito
             // colgado en producción.)
             setEmbeddedSecret(result.clientSecret);
             setLoading(false);
             return;
           }
           if (result.status === 'redirect') {
             // Respaldo: backend antiguo que aún no soporta el incrustado.
             window.location.assign(result.url);
             return;
           }
           if (result.status === 'client_secret') {
             setClientSecret(result.clientSecret);
           } else {
             setPendingBackend(true);
           }
           setLoading(false);
         })
         .catch((err) => {
           // «Invalid URL» = el backend no tiene FRONTEND_URL configurada y
           // rechazó nuestro origin (createTierCheckout ya reintentó con el
           // conocido): aviso honesto en vez de un error críptico en inglés.
           if (/invalid url/i.test(err?.message || '')) {
             setPendingBackend(true);
           } else {
             toast.error(err.message || 'No se pudo iniciar el pago');
           }
           setLoading(false);
         });
       return;
    }

    // Item directo SIN endpoint (legado): no hay nada que cobrar aún.
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
       // Solo se puede cobrar UN artículo físico por pedido: el backend expone
       // create-payment-intent-version y -pack, y ambos aceptan un único id. El
       // checkout de varios artículos es una fase aparte.
       //
       // El mensaje ya no habla de «la API»: quien lo lee es un cliente que
       // acaba de dejar su correo, su dirección y su DNI, y no tiene por qué
       // saber qué es eso. Dice qué pasa, con cuántos, y qué hacer.
       //
       // El aviso de verdad está ahora en el paso 1 (ver Summary.js): aquí se
       // llegaba después de rellenar TODO el formulario, que es el peor momento
       // posible para enterarse. Esto queda como última red por si alguien
       // manipula el carrito por el camino.
       if (cart.length > 1) {
           toast.error(
             `Por ahora solo podemos enviar un artículo por pedido, y tienes ${cart.length}. ` +
             `Deja uno en el carrito y haz el otro pedido después.`,
             { duration: 7000 },
           );
           setLoading(false);
           return;
       }
       
       const item = cart[0];
       
       // Origen/atribución de la venta (capturado por UTMCapture, o por el
       // downsell si el lead llegó desde /recomendador) para que el pedido
       // llegue al back office con su columna Origen rellena
       const origin = resolveOrigin();

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
        // Sesión caducada: no es un problema del pedido, así que no se le
        // enseña al cliente un «jwt expired» en la pantalla de pago. Se
        // resuelve como en el resto del panel: volver a entrar y regresar
        // aquí. (Salió probando: mi token de prueba caducó a mitad y la
        // pantalla nueva pintaba el mensaje crudo del servidor.)
        if (error.response?.status === 401) {
          if (handleApiError(error, '/cart?step=2')) return;
        }
        if (error.response?.data) {
           console.error("Server validation errors:", JSON.stringify(error.response.data));
           const serverSms = error.response.data.message || error.response.data.error;
           const texto = typeof serverSms === 'string' ? serverSms : JSON.stringify(serverSms);
           toast.error(texto);
           // Solo se deja en pantalla lo que el backend escribió PARA el
           // comprador, que es lo que manda con un 400 de regla de negocio.
           // Un 500 trae mensajes de servidor («Internal server error»,
           // trazas) que no le dicen nada a nadie: ahí se queda el genérico.
           setMotivoDelFallo(error.response.status === 400 ? texto : null);
        } else {
           toast.error("Error al iniciar el pago");
           setMotivoDelFallo(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [cart, token, saveCard]);

  if (loading) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Spinner size="lg" />
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
                <a href="mailto:hola@squadfit.es" className="text-orange-500 font-bold underline">hola@squadfit.es</a>
            </p>
            <button onClick={() => props.setStep(1)} className="text-secondary font-bold underline cursor-pointer">Volver al carrito</button>
        </div>
    );
  }

  // Checkout incrustado: el pago de Stripe dentro de nuestra propia página.
  //
  // De la marca de la cuenta de Stripe solo llega el COLOR del botón (y la
  // forma y la tipografía, si se configuran en Ajustes → Pagos → Checkout;
  // es un ajuste distinto del de Marca, que solo afecta a facturas y recibos).
  // El fondo blanco, las cajas y el espaciado son suyos y no se tocan.
  //
  // Por eso lo que personaliza esta pantalla es el MARCO: las dos columnas de
  // los pasos 1 y 2, nuestros encabezados y el resumen del pedido. La versión
  // anterior era una columna blanca suelta, y en el momento de pagar el
  // cliente no veía qué estaba comprando — solo un importe dentro de la caja
  // de Stripe. El resumen vuelve por eso, no por decoración.
  if (embeddedSecret) {
    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
        {/* `lg:min-h-screen` en vez de `min-h-screen`: en móvil el resumen ya
            va encima, y forzar aquí una pantalla entera dejaba un socavón
            blanco debajo del botón de seQura. */}
        <div className="w-full lg:w-2/3 p-6 lg:p-14 lg:pl-40 lg:min-h-screen bg-white">

          {/* Cabecera: la misma que los pasos 1 y 2. Sin ella, si el iframe de
              Stripe no llega a pintar (nos pasó el 28-jul: la CSP lo bloqueó)
              el cliente ve una página vacía y da por hecho que el «Continuar»
              del paso 2 no hizo nada y que nunca llegó al pago. */}
          <CabeceraPaso
            paso="Paso 3 de 3"
            titulo="Pago"
            onAtras={() => props.setStep(2)}
            aria="Volver a mis datos"
          />

          <h2 className="text-indigo-900 font-bold text-lg mb-4">Métodos de pago</h2>

          {/* ── Acordeón de verdad: cada contenido debajo de SU fila ────────
              Antes las dos filas iban juntas arriba y el contenido de la
              elegida se pintaba debajo de LAS DOS. Al pulsar «Tarjeta», la caja
              de Stripe aparecía al final del todo, por debajo de la fila de
              seQura: parecía que el clic no había hecho nada y había que bajar
              a buscarla.

              Aquello se hizo así para que seQura no quedara por debajo del
              botón de pagar, que es lo que reportaron el 5-ago. Ya no hace
              falta: como ahora TODO llega plegado, las dos opciones se ven
              juntas al entrar, que era lo que pedían. Al abrir una, la otra se
              cierra y vuelve a subir.

              Stripe se OCULTA con CSS, nunca se desmonta: `EmbeddedCheckout` se
              monta una sola vez contra su `clientSecret`, y desmontarlo
              obligaría a crear otra sesión de pago para volver — se perdería lo
              que el cliente ya hubiera tecleado. Por eso su contenedor existe
              siempre y solo cambia de clase.

              POR QUÉ SON DOS FILAS Y NO CUATRO: Apple Pay y Google Pay no son
              métodos aparte en Stripe — viajan sobre `card` y los pinta él
              mismo, arriba de su caja, SOLO si el dispositivo los admite.
              Sacarlos a una fila fija llevaría a un Android sin Google Pay a
              pulsar y no encontrar nada. */}
          <div className="max-w-[420px] mx-auto space-y-2 mb-6">
            {sequra.aplica && (
              <OpcionDePago
                activo={metodo === 'stripe'}
                onClick={() => setMetodo(metodo === 'stripe' ? null : 'stripe')}
                titulo="Tarjeta o wallet"
                sub="Visa, Mastercard, Apple Pay, Google Pay y Link"
                icono={<IconoTarjeta />}
              />
            )}
            <div className={!sequra.aplica || metodo === 'stripe' ? '' : 'hidden'}>
              <CheckoutIncrustado clientSecret={embeddedSecret} />
            </div>

            {/* «Paga Fraccionado» es el nombre del producto de seQura, no una
                descripción nuestra. Y SIN logo ni rótulo verde: su propia caja
                lleva el logo a un tamaño que no podemos reducir, así que
                repetirlo aquí lo duplicaría y encima más pequeño. */}
            {sequra.aplica && (
              <>
                <OpcionDePago
                  activo={metodo === 'sequra'}
                  onClick={() => setMetodo(metodo === 'sequra' ? null : 'sequra')}
                  titulo="Paga Fraccionado"
                  icono={<IconoPlazos />}
                  pie={<SequraSimulador importeEur={totalCarrito} divisa={divisa} alineacion="left" />}
                />
                {metodo === 'sequra' && (
                  <PagoSequra
                    cart={cart}
                    total={totalCarrito}
                    formData={datosCliente}
                    abierto
                    onAbrir={() => setMetodo('sequra')}
                  />
                )}
              </>
            )}
          </div>

          {!sequra.aplica && sequra.cerca && (
            <p className="mt-8 pt-8 border-t border-indigo-100 text-sm text-slate-500 text-center">
              Añade {sequra.falta.toFixed(2)} € más y podrás pagarlo a plazos con seQura.
            </p>
          )}

          {/* «Atrás», y atrás es UN paso: al 2, no al carrito.
              Decía «Volver al carrito» y mandaba al paso 1, saltándose de un
              salto el formulario que el cliente acababa de rellenar. No había
              ninguna intención detrás: venía así de antes y nadie lo miró. Si
              alguien quiere cambiar lo que compra tiene el resumen al lado, con
              su propio acceso al carrito; lo que se espera de un botón de atrás
              en el paso 3 es el paso 2. */}
          <button
            type="button"
            onClick={() => props.setStep(2)}
            className="mt-8 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 -ml-3 text-slate-500 font-semibold text-sm hover:bg-slate-50 hover:text-indigo-900 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ChevronLeft size={18} className="shrink-0" />
            Atrás
          </button>
        </div>

        {/* Resumen del pedido, SIN su «Continuar»: aquí quien cobra es el
            botón de Stripe. En móvil sale plegado tras «Ver resumen (N)».

            EN MÓVIL VA ARRIBA, no como barra flotante abajo. La barra `sticky
            bottom-0` de los pasos 1 y 2 funciona allí porque el botón que
            cobra vive DENTRO de ella. Aquí no: el botón «Pagar» es de Stripe y
            queda en la columna de al lado, así que la barra se le montaba
            encima y lo cortaba por la mitad — en la pantalla del cobro. De
            paso se comía el simulador de cuotas y dejaba 200px de hueco.
            `order-first lg:order-last` lo sube al principio en móvil y lo
            devuelve a la derecha en escritorio, donde no cambia nada. */}
        <div className="w-full order-first lg:order-last lg:w-1/3 lg:min-h-screen bg-orange-50">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <OrderSummary mostrarCta={false} />
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    // Cuando el backend explica POR QUÉ, manda su explicación: casi siempre no
    // es un fallo técnico sino una condición del pedido («ya tienes este
    // libro»), y decir «no se pudo inicializar el pago seguro» ahí hace pensar
    // que la tienda está rota. Solo se cae al mensaje genérico cuando de
    // verdad no hay explicación (red caída, 500 sin cuerpo).
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
            {motivoDelFallo ? (
              <>
                <p className="text-[#363C98] text-xl font-bold mb-2 max-w-md">{motivoDelFallo}</p>
                <p className="text-gray-500 mb-6 max-w-md">
                  Puedes quitarlo del carrito y seguir con el resto, o revisar lo que ya tienes en tu panel.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => props.setStep(1)} className="bg-[#363C98] text-white rounded-3xl px-8 py-3 font-bold cursor-pointer hover:bg-[#363C98]/90">
                    Volver al carrito
                  </button>
                  <Link href="/panel-cocina" className="bg-gray-100 text-gray-700 rounded-3xl px-8 py-3 font-semibold hover:bg-gray-200">
                    Ver lo que ya tengo
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-red-500 font-bold mb-4">No se pudo inicializar el pago seguro.</p>
                <button onClick={() => props.setStep(2)} className="text-secondary font-bold underline cursor-pointer">Volver</button>
              </>
            )}
        </div>
    );
  }

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={options}>
      <PaymentInner {...props} />
    </Elements>
  );
}
