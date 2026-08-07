'use client';

import React, { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';

/**
 * Cuenta atrás para la apertura de «Mi programa».
 *
 * Se enseña a quien entra en la sección y todavía no tiene un programa montado.
 * El correo que se manda a los clientes al crearles la cuenta dice justo esto
 * —«esa parte llega en un mes, verás la cuenta atrás dentro»—, así que la
 * pantalla tiene que sostenerlo; si no, el cliente entra, ve un anuncio del
 * programa y piensa que le hemos vendido humo.
 *
 * El texto vale igual para un cliente que ya paga y para alguien que llega sin
 * haber comprado: lo que se afirma es cuándo se abre la sección, que es cierto
 * para los dos. Lo que NO se hace es decirle a nadie «tu programa está en
 * camino» sin saber si lo ha contratado.
 *
 * La fecha está fijada a mano a propósito. Es un lanzamiento concreto, no algo
 * que se calcule solo: cuando se mueva, se cambia aquí y se ve en el diff.
 */
export const APERTURA_MI_PROGRAMA = new Date('2026-09-07T09:00:00+02:00');

function reparto(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    dias: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
  };
}

function Casilla({ valor, etiqueta }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 sm:w-20 rounded-2xl bg-white shadow-sm border border-slate-100 py-3">
        <span className="block text-2xl sm:text-3xl font-extrabold text-[#363C98] tabular-nums">
          {String(valor).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
        {etiqueta}
      </span>
    </div>
  );
}

export default function CuentaAtrasPrograma() {
  // Arranca en null y se rellena en el efecto: si se calculara durante el
  // render, el HTML del servidor y el del cliente saldrían con segundos
  // distintos y React avisaría de un fallo de hidratación.
  const [restante, setRestante] = useState(null);

  useEffect(() => {
    const tic = () => setRestante(reparto(APERTURA_MI_PROGRAMA - new Date()));
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);

  const abierto = restante && restante.dias + restante.horas + restante.minutos + restante.segundos === 0;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#FFF6F0] to-white border border-[#FFE0CC] p-6 sm:p-8 text-center">
      <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
        <Rocket className="w-7 h-7 text-[#FF690B]" />
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-[#363C98] mb-2">
        {abierto ? 'Esta sección ya está abierta' : 'Esta sección abre pronto'}
      </h2>
      <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-7">
        {abierto
          ? 'Recarga la página para ver tu programa.'
          : 'Estamos montando Mi programa: tu plan, tu seguimiento y tus recursos en un solo sitio. Mientras tanto, puedes completar tu perfil y guardar tus medidas.'}
      </p>

      {!abierto && (
        <div
          className="flex items-start justify-center gap-3 sm:gap-4"
          role="timer"
          aria-live="off"
          aria-label={
            restante
              ? `Faltan ${restante.dias} días para la apertura`
              : 'Calculando el tiempo que falta'
          }
        >
          {restante ? (
            <>
              <Casilla valor={restante.dias} etiqueta="días" />
              <Casilla valor={restante.horas} etiqueta="horas" />
              <Casilla valor={restante.minutos} etiqueta="min" />
              <Casilla valor={restante.segundos} etiqueta="seg" />
            </>
          ) : (
            // Mismo hueco que ocupará el contador, para que no salte el layout.
            <div className="h-[86px]" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}
