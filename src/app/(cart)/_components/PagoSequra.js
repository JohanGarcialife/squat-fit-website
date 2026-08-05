'use client';

// Pago con seQura dentro del carrito: «Paga Fraccionado».
//
// Por qué esto existe aparte de Stripe: seQura NO es un método de pago de
// Stripe, es una pasarela distinta con su propio ciclo. No se puede añadir al
// Payment Element como si fuera otra tarjeta. Así que el paso 3 se bifurca:
// tarjeta por Stripe, o fraccionado por seQura.
//
// ── Cuándo se ofrece ────────────────────────────────────────────────────────
//
// Solo cuando de verdad se puede pagar así. Decisión de María el 3-ago, y es la
// correcta: enseñar una opción que al pulsarla dice «no disponible» es peor que
// no enseñarla. Las condiciones salen de medir su API, no de suponer:
//
//   · Sin suscripciones en el carrito — seQura fracciona un importe cerrado y
//     una suscripción no lo es.
//   · Entre 50 € y 4.000 € — límites reales del comercio.
//   · Solo en euros — el comercio es `allowed_countries: ["ES"]`.
//   · Y que la integración esté encendida en el backend.
//
// La única excepción: si el carrito se queda a menos de 15 € del mínimo, se
// dice. Al cliente le sirve saberlo y de paso sube el ticket.

import React, { useEffect, useState } from 'react';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

/**
 * Verde de seQura, tomado de su propia web (sequra.es) el 4-ago, no inventado.
 * Usan dos: #21CFAC es el claro y #00C2A3 el de acento — este último es el que
 * aguanta como borde sobre blanco.
 */
export const SEQURA_VERDE = '#00C2A3';
/**
 * El mismo verde oscurecido para el TEXTO. `#00C2A3` sobre blanco da 2,2:1 de
 * contraste y el mínimo legible es 4,5:1: con su color exacto, el rótulo del
 * botón no se lee. Se oscurece manteniendo el tono, que es lo que conserva la
 * identidad de la marca sin dejar a nadie fuera.
 */
export const SEQURA_VERDE_TEXTO = '#00786B';

export const SEQURA_MIN = 50;
export const SEQURA_MAX = 4000;
/** Cuánto puede faltar para que merezca la pena avisar al cliente. */
export const SEQURA_AVISO_CERCA = 15;

/**
 * Interruptor general, el mismo que apaga el simulador de cuotas
 * (SequraSimulador.js). Apagado por defecto y se enciende con
 * NEXT_PUBLIC_SEQURA_READY=true en Vercel.
 *
 * ESTO FALTABA, y era grave: el botón se pintaba siempre, mientras el backend
 * apuntaba a `sandbox.sequrapi.com`. Un cliente real con 50 € o más en el
 * carrito veía «Pagar a plazos con seQura», entraba en el formulario de PRUEBAS
 * de seQura y, si lo completaba, se le concedía el acceso sin que hubiera
 * ningún cobro. Estuvo tapado por dos fallos que se anulaban entre sí —la CSP
 * bloqueaba el iframe y la concesión no concedía nada—; al arreglar los dos el
 * 3-ago quedó un camino de acceso gratis abierto durante ~25 minutos. Ningún
 * cliente llegó a usarlo (comprobado en `sequra_orders`: solo los 2 pedidos de
 * prueba internos).
 *
 * La lección: arreglar dos fallos que se compensaban puede destapar un tercero.
 * Un método de pago se enciende con un interruptor explícito, nunca por el
 * hecho de que su código esté desplegado.
 */
const ENCENDIDO = process.env.NEXT_PUBLIC_SEQURA_READY === 'true';

/**
 * ¿Se puede fraccionar este carrito? Devuelve el motivo cuando no, para poder
 * decir algo útil en vez de callar.
 *
 * `datos` son los del paso 2 (`formData`). Hacen falta para el filtro de país:
 * sin ellos no se puede saber a dónde va el pedido.
 */
export function evaluarSequra(cart, total, divisa, datos) {
  if (!ENCENDIDO) return { aplica: false, motivo: 'apagado' };
  if (divisa !== 'EUR') return { aplica: false, motivo: 'divisa' };

  // ── Las DOS direcciones tienen que estar en España ──────────────────────
  //
  // Lo pidió seQura el 5-ago y no es una preferencia suya: solo operan en
  // España, y un pedido que se factura aquí pero se envía fuera se lo rechaza
  // su análisis de riesgo. El cliente habría llegado hasta el final del
  // formulario para que le dijeran que no.
  //
  // Ojo con la de envío: cuando la casilla «usar la misma dirección» está
  // marcada, `shippingCountry` se queda VACÍO —no se copia— así que el país de
  // envío es el de facturación. Leer `shippingCountry` a secas daría «no es
  // España» en la compra más normal que existe, y apagaría seQura para todo
  // el mundo. Es el mismo enredo que ya hizo cotizar el envío con el código
  // postal de facturación.
  const paisFactura = (datos?.country ?? '').toUpperCase();
  const paisEnvio =
    datos?.sameAddress === false
      ? (datos?.shippingCountry ?? '').toUpperCase()
      : paisFactura;
  if (!paisFactura || !paisEnvio) return { aplica: false, motivo: 'sin_pais' };
  if (paisFactura !== 'ES' || paisEnvio !== 'ES') {
    return { aplica: false, motivo: 'fuera_de_espana' };
  }

  const haySuscripcion = (cart || []).some(
    (i) => i.period === '/mes' || i.period === '/trimestre',
  );
  if (haySuscripcion) return { aplica: false, motivo: 'suscripcion' };
  if (total > SEQURA_MAX) return { aplica: false, motivo: 'maximo' };
  if (total < SEQURA_MIN) {
    const falta = SEQURA_MIN - total;
    return {
      aplica: false,
      motivo: 'minimo',
      falta,
      cerca: falta <= SEQURA_AVISO_CERCA,
    };
  }
  return { aplica: true };
}

export default function PagoSequra({ cart, total, formData, onError, onAbrir }) {
  const [estado, setEstado] = useState('inicial'); // inicial | cargando | listo | error
  const [urlForm, setUrlForm] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const empezar = async () => {
    // Se avisa ANTES de pedir nada: el acordeón pliega el pago con tarjeta en
    // cuanto se pulsa, no cuando responde seQura. Si esperara a la respuesta,
    // el cliente vería el botón «Preparando…» con la caja de Stripe todavía
    // abierta encima y parecería que no ha pasado nada.
    onAbrir?.();
    setEstado('cargando');
    setMensaje(null);
    try {
      const res = await fetch(`${API}/api/v1/sequra/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: (cart || []).map((i) => ({
            product_id: i.product_id ?? i.id,
            quantity: i.quantity || 1,
          })),
          email: formData?.email,
          first_name: formData?.firstName,
          last_name: formData?.lastName,
          phone: formData?.phone,
          address: formData?.address,
          address_2: formData?.apartment || undefined,
          postal_code: formData?.postalCode,
          city: formData?.city,
          origin: (() => {
            try { return localStorage.getItem('sf_origin') || undefined; } catch { return undefined; }
          })(),
        }),
      });
      const datos = await res.json();
      if (!res.ok) {
        // El backend devuelve motivos entendibles («no financia por debajo de
        // 50 €»); se enseñan tal cual en vez de un «error inesperado».
        throw new Error(datos?.message || 'No se pudo iniciar el pago fraccionado');
      }
      // Del HTML que devuelve seQura se extrae la URL de su formulario y se
      // monta el iframe nosotros. Inyectar su HTML tal cual no basta: React no
      // ejecuta los <script> insertados con dangerouslySetInnerHTML, así que el
      // formulario se quedaría oculto (viene con display:none y lo muestra su
      // propio JS).
      const src = /src=["']([^"']*pumbaa_form[^"']*)["']/.exec(datos.form || '')?.[1];
      if (!src) throw new Error('seQura no devolvió el formulario de pago');
      setUrlForm(src.replace(/&amp;/g, '&'));
      setEstado('listo');
    } catch (e) {
      setMensaje(e.message);
      setEstado('error');
      onError?.(e);
    }
  };

  if (estado === 'listo' && urlForm) {
    return (
      <div className="w-full">
        <iframe
          src={urlForm}
          title="Pago fraccionado con seQura"
          className="w-full rounded-2xl border border-indigo-100"
          style={{ minHeight: 620 }}
        />
        <p className="text-xs text-slate-400 mt-3 text-center">
          El pago lo gestiona seQura. No guardamos tus datos bancarios.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Relleno y con el mismo radio que el «Pagar» de Stripe (`rounded-lg`,
          8px, que es el preset «redondeado» de su apariencia): las dos
          pasarelas se ofrecen como iguales, y una de las dos con menos peso
          visual se leía como «la opción rara».

          El texto va en blanco sobre SEQURA_VERDE_TEXTO, no sobre su verde
          exacto: `#00C2A3` con texto blanco da 2,1:1 de contraste y no se lee.
          El tono es el mismo, solo oscurecido lo justo para pasar de 4,5:1. */}
      <button
        type="button"
        onClick={empezar}
        disabled={estado === 'cargando'}
        style={{ backgroundColor: SEQURA_VERDE_TEXTO }}
        className="block w-full rounded-lg py-3 font-semibold text-white hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
      >
        {estado === 'cargando' ? 'Preparando…' : 'Continuar con Paga Fraccionado'}
      </button>
      {mensaje && (
        <p className="text-sm text-[#B4230E] mt-3 text-center">{mensaje}</p>
      )}
    </div>
  );
}
