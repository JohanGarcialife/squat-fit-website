'use client';

import { useState, useEffect } from 'react';

// Monedas de los países principales, con Euro y Dólar primero (lo pedido).
// symbol es el prefijo que se muestra junto al importe (desambiguando los $).
export const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'USD', symbol: 'US$', label: 'Dólar (US$)' },
  { code: 'GBP', symbol: '£', label: 'Libra (£)' },
  { code: 'MXN', symbol: 'MX$', label: 'Peso mexicano (MX$)' },
  { code: 'ARS', symbol: 'AR$', label: 'Peso argentino (AR$)' },
  { code: 'COP', symbol: 'CO$', label: 'Peso colombiano (CO$)' },
  { code: 'CLP', symbol: 'CL$', label: 'Peso chileno (CL$)' },
];

const SYMBOLS = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.symbol]));

// Tipos de cambio aproximados (base EUR) por si la API falla, para no romper
// la conversión. Se sobrescriben con los reales al cargar.
const FALLBACK_RATES = { EUR: 1, USD: 1.08, GBP: 0.85, MXN: 20, ARS: 1050, COP: 4300, CLP: 1000 };

/**
 * Conversión de precios (base EUR) a la moneda elegida. Devuelve la moneda
 * seleccionada, el símbolo, la lista de monedas y una función de formateo.
 * Las tasas se piden a open.er-api.com (soporta ARS/COP/CLP, que frankfurter no).
 */
export function useCurrency() {
  const [currency, setCurrency] = useState('EUR');
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    (async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('rates not ok');
        const data = await res.json();
        if (data?.rates) {
          const picked = {};
          for (const c of CURRENCIES) picked[c.code] = data.rates[c.code] ?? FALLBACK_RATES[c.code];
          setRates(picked);
        }
      } catch {
        // Nos quedamos con los fallback (silencioso para no ensuciar la consola).
      } finally {
        setIsLoading(false);
      }
    })();
    return () => clearTimeout(timeoutId);
  }, []);

  const symbol = SYMBOLS[currency] || '€';

  // Las monedas sin decimales (pesos) se muestran redondeadas.
  const noDecimals = currency === 'CLP' || currency === 'COP' || currency === 'ARS';

  const convertPrice = (priceInEur) => {
    if (isLoading) return '...';
    const value = priceInEur * (rates[currency] ?? 1);
    return noDecimals
      ? Math.round(value).toLocaleString('es-ES')
      : value.toFixed(2).replace('.', ',');
  };

  return { currency, setCurrency, symbol, convertPrice, currencies: CURRENCIES, isLoading };
}
