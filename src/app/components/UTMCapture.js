'use client';

import { useEffect } from 'react';
import { VENDEDORES } from '@/app/components/downsellEngine';

/**
 * Origen final que viaja en el payload del checkout (columna `origin` de
 * `orders`, mismo campo de siempre). Prioridad: si el lead viene del
 * recomendador (localStorage `sqf_attrib`, escrito por RecomendadorClient
 * cuando la URL trae ?via=), esa atribución manda sobre la genérica de
 * UTMCapture — identifica al vendedor concreto, que es más específico que
 * "UTM: ..." o "Directo". Si no hay downsell, se cae al `sf_origin` de
 * siempre (sin cambios de comportamiento para el resto del tráfico).
 */
export function resolveOrigin() {
  try {
    const raw = localStorage.getItem('sqf_attrib');
    if (raw) {
      const { via } = JSON.parse(raw) || {};
      if (via) {
        const nombre = VENDEDORES.find((v) => v.key === via)?.label || via;
        return `Downsell: ${nombre}`;
      }
    }
  } catch {
    // localStorage corrupto o inaccesible: seguir con sf_origin
  }
  try {
    return localStorage.getItem('sf_origin') || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Captura la atribución de la visita para el módulo de Pedidos del back office.
 * - Si la URL trae UTM (utm_source/utm_campaign/utm_medium), la guarda.
 * - Si no hay UTM pero hay referrer externo, guarda "Orgánico: <host>".
 * - Si no hay nada y es la primera visita, guarda "Directo".
 * Se persiste en localStorage (sf_origin) y el carrito la envía al crear el
 * pago, de modo que cada pedido llega con su columna Origen rellena.
 */
export default function UTMCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('utm_source');
      const campaign = params.get('utm_campaign');
      const medium = params.get('utm_medium');

      if (source || campaign || medium) {
        const parts = [source, campaign, medium].filter(Boolean).join(' · ');
        localStorage.setItem('sf_origin', `UTM: ${parts}`);
        return;
      }

      // No pisar una atribución UTM previa con visitas posteriores
      if (localStorage.getItem('sf_origin')) return;

      const ref = document.referrer;
      if (ref) {
        const host = new URL(ref).hostname.replace('www.', '');
        if (!host.includes('squatfit')) {
          localStorage.setItem('sf_origin', `Orgánico: ${host}`);
          return;
        }
      }
      localStorage.setItem('sf_origin', 'Directo');
    } catch {
      // La atribución nunca debe romper la página
    }
  }, []);

  return null;
}
