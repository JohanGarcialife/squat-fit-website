'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Selector de moneda del carrito (Euro y Dólar primero, luego el resto de
 * monedas de los países principales). Estilo de marca, compacto.
 */
export default function CurrencySelector({ currency, setCurrency, currencies }) {
  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="currency" className="sr-only">Moneda</label>
      <select
        id="currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="appearance-none cursor-pointer rounded-full border-2 border-indigo-900 bg-white/70 py-1.5 pl-4 pr-9 text-sm font-semibold text-indigo-900 outline-none transition-colors hover:bg-white focus:ring-1 focus:ring-indigo-900"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 text-indigo-900" />
    </div>
  );
}
