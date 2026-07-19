'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'sqf-cookie-consent';

// Banner de cookies discreto, abajo. Sin analítica: solo almacenamiento propio
// (localStorage) y cookies de Stripe para el pago seguro. Las tres acciones
// guardan la elección en localStorage y no se vuelve a mostrar.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Sin localStorage (modo privado antiguo): no bloqueamos la página
    }
  }, []);

  const save = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, date: new Date().toISOString() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-[20px] bg-white shadow-2xl ring-1 ring-[#363C98]/10 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#363C98] leading-relaxed">
            <span className="font-bold">🍪 Cookies en Squad Fit.</span>{' '}
            No usamos cookies de analítica ni publicidad. Solo guardamos datos en tu
            dispositivo para que la web funcione (sesión, carrito y tus preferencias) y
            Stripe usa sus cookies para procesar pagos de forma segura.{' '}
            <Link href="/politicas?tab=cookies" className="underline font-semibold text-[#FF690B] hover:text-[#e05b08]">
              Política de cookies
            </Link>
          </p>

          {showPrefs && (
            <div className="rounded-2xl bg-[#FFF6F0] p-4 flex flex-col gap-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#363C98]">Esenciales (siempre activas)</p>
                  <p className="text-[#363C98]/70">Sesión, carrito y preferencias guardadas en tu navegador. Sin ellas la web no funciona.</p>
                </div>
                <span className="shrink-0 mt-1 inline-flex h-6 w-11 items-center rounded-full bg-[#363C98] px-1 opacity-60" aria-label="Siempre activas">
                  <span className="h-4 w-4 translate-x-5 rounded-full bg-white transition" />
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#363C98]">Pago seguro (Stripe)</p>
                  <p className="text-[#363C98]/70">Cookies de Stripe necesarias para prevenir fraude y completar tu compra. Solo se usan al pagar.</p>
                </div>
                <span className="shrink-0 mt-1 inline-flex h-6 w-11 items-center rounded-full bg-[#363C98] px-1 opacity-60" aria-label="Siempre activas">
                  <span className="h-4 w-4 translate-x-5 rounded-full bg-white transition" />
                </span>
              </div>
              <p className="text-[#363C98]/60 text-xs">
                No hay cookies opcionales que desactivar: no usamos analítica ni marketing.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowPrefs((v) => !v)}
              className="px-4 py-2 rounded-full text-sm font-bold text-[#363C98] hover:bg-[#363C98]/5 transition-colors cursor-pointer"
            >
              Preferencias
            </button>
            <button
              type="button"
              onClick={() => save('essential')}
              className="px-4 py-2 rounded-full text-sm font-bold text-[#363C98] border-2 border-[#363C98] hover:bg-[#363C98]/5 transition-colors cursor-pointer"
            >
              Solo esenciales
            </button>
            <button
              type="button"
              onClick={() => save('accepted')}
              className="px-5 py-2 rounded-full text-sm font-bold text-white bg-[#FF690B] hover:bg-[#e05b08] shadow-md transition-colors cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
