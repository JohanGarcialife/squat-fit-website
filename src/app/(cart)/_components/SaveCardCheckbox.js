'use client';

import React from 'react';

// Casilla «guardar tarjeta para futuras compras» del checkout de catálogo
// (feat/guardar-metodo-de-pago-checkout). SIEMPRE desmarcada por defecto: el
// backend (PR #44, ya en prod) solo guarda la tarjeta si `save_card: true`
// viaja explícito, y aquí replicamos esa misma regla — nunca premarcada, y
// si el cliente no la toca el checkout se comporta exactamente igual que
// antes de este cambio.
//
// Área táctil de 44px real (el `span` que envuelve el input, no solo el
// `input` de 20px) y `<label htmlFor>` de verdad para que el teclado y los
// lectores de pantalla la asocien con el texto.
export default function SaveCardCheckbox({ checked, onChange, id = 'save-card', className = '' }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 cursor-pointer select-none ${className}`}
    >
      <span className="flex h-11 w-11 shrink-0 -m-3 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 rounded accent-[#FF690B] cursor-pointer"
        />
      </span>
      <span className="text-sm leading-snug text-[#363C98]/80 -ml-1 py-3">
        Guardar esta tarjeta para mis próximas compras. La guarda Stripe
        (nuestra pasarela de pago), no nosotros. No marcarla no cambia nada en
        este pago, y puedes gestionarla o eliminarla luego desde «Gestionar
        pagos y facturas» en Ajustes.
      </span>
    </label>
  );
}
