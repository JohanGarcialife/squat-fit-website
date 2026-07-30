'use client';
import { useEffect, useState } from 'react';

/**
 * Gastos de envío reales, calculados por el backend según la zona del destino
 * (spec 12.2: 8 zonas con tarifa y umbral de envío gratis).
 *
 * Antes esto era un `4.99` escrito a mano con umbral de 90 €, igual para todo
 * el mundo: cobraba de más a España peninsular (que va gratis) y de menos a
 * cualquier destino internacional (de 9,90 a 22,90 €). Las tarifas viven en la
 * tabla `shipping_zones`, así que el equipo puede cambiarlas sin tocar código y
 * el carrito se entera solo.
 *
 * Devuelve 0 mientras no haya país: el resumen no puede inventarse una tarifa
 * antes de saber a dónde va el pedido.
 */
export function useShippingQuote(subtotal, country, postalCode, hasPhysicalItems) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasPhysicalItems || !country) {
      setQuote(null);
      return;
    }

    const controller = new AbortController();
    let cancelado = false;

    (async () => {
      setLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API}/api/v1/shipping/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country, subtotal, postal_code: postalCode }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelado) setQuote(data);
      } catch {
        // País sin zona configurada o backend caído: no bloqueamos la compra.
        // El backend vuelve a calcular el envío al cobrar, así que el importe
        // real nunca depende de lo que consiga pintar el navegador.
        if (!cancelado) setQuote(null);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [subtotal, country, postalCode, hasPhysicalItems]);

  return {
    shippingCost: quote?.shipping_cost ?? 0,
    isFree: quote?.is_free ?? false,
    zoneName: quote?.zone_name ?? null,
    freeThreshold: quote?.free_threshold ?? null,
    missingForFree: quote?.missing_for_free ?? null,
    loading,
    /** Todavía no sabemos a dónde va el pedido: hay que pedir la dirección. */
    sinDestino: !country && hasPhysicalItems,
  };
}
