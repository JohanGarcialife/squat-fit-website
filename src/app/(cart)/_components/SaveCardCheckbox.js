'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import Casilla from './Casilla';

// Casilla «guardar tarjeta para futuras compras» del checkout de catálogo
// (feat/guardar-metodo-de-pago-checkout). SIEMPRE desmarcada por defecto: el
// backend (PR #44, ya en prod) solo guarda la tarjeta si `save_card: true`
// viaja explícito, y aquí replicamos esa misma regla — nunca premarcada, y
// si el cliente no la toca el checkout se comporta exactamente igual que
// antes de este cambio.
//
// ── Por qué va destacada ────────────────────────────────────────────────────
//
// Antes era una línea gris más entre el formulario y el botón de pagar, y
// leída así no da ninguna razón para marcarla: solo pide permiso para guardar
// algo. Ahora dice qué gana el cliente —la próxima compra en un toque— porque
// esa es la verdad y es lo único que justifica el clic.
//
// El recuadro cambia de color al marcarla. No es adorno: es la confirmación de
// que el clic ha hecho algo, que en una casilla dibujada a mano importa más
// que en la nativa.
export default function SaveCardCheckbox({ checked, onChange, id = 'save-card', className = '' }) {
  return (
    <Casilla checked={checked} onChange={onChange} id={id} destacada className={className}>
      <span className="flex items-center gap-1.5 font-semibold text-indigo-900">
        <Zap size={15} className="shrink-0 text-orange-500" />
        Que la próxima compra sea un solo clic
      </span>
      {/* Dos líneas y para. La versión anterior metía en el mismo párrafo que
          lo guarda Stripe y no nosotros, que no marcarla no cambia nada, y la
          ruta exacta del ajuste — cinco líneas de letra pequeña al lado de una
          casilla que se decide en un segundo. Nadie lee eso; lo que hace es dar
          la sensación de que hay algo que leer. Lo de Stripe sigue estando
          donde importa (la política de privacidad) y el propio Stripe lo repite
          en su caja de pago justo después. */}
      <span className="mt-0.5 block text-sm leading-snug text-slate-500">
        Guarda tu método de pago para no volver a teclearlo. Puedes quitarlo
        cuando quieras desde Ajustes.
      </span>
    </Casilla>
  );
}
