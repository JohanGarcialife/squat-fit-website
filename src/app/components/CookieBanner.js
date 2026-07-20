'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'sqf-cookie-consent';

// Lee el consentimiento guardado. Devuelve null si aún no se ha elegido.
export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ¿Puede cargarse Google Analytics? (consent mode: denegado por defecto).
// Cuando se instale Site Kit/GA4, condicionar la carga del script a esto.
export function analyticsAllowed() {
  return getCookieConsent()?.analytics === true;
}

// Banner de cookies v2 (13.6): tres acciones — Aceptar (todo), Rechazar (solo
// esenciales) y Saber más (política). El panel de preferencias añade la
// categoría «Analítica (Google)», desactivada por defecto y persistida en
// sqf-cookie-consent, lista para el consent mode cuando se instale GA4.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Sin localStorage (modo privado antiguo): no bloqueamos la página
    }
  }, []);

  const save = (choice, analyticsOn) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, analytics: !!analyticsOn, date: new Date().toISOString() })
      );
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
            Usamos almacenamiento propio para que la web funcione (sesión, carrito y tus
            preferencias) y cookies de Stripe para pagar de forma segura. La analítica
            (Google) está <strong>desactivada por defecto</strong>: solo se usa si tú la
            activas en las{' '}
            <button
              type="button"
              onClick={() => setShowPrefs((v) => !v)}
              className="underline font-semibold text-[#363C98] hover:text-[#FF690B] cursor-pointer"
            >
              preferencias
            </button>
            .
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#363C98]">Analítica (Google)</p>
                  <p className="text-[#363C98]/70">
                    Estadísticas anónimas de uso para mejorar la web. Desactivada por
                    defecto; hoy no cargamos ningún script de Google hasta que tú lo actives.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  aria-label="Activar analítica de Google"
                  onClick={() => setAnalytics((v) => !v)}
                  className={`shrink-0 mt-1 inline-flex h-6 w-11 items-center rounded-full px-1 transition-colors cursor-pointer ${analytics ? 'bg-[#FF690B]' : 'bg-[#C6C3E8]'}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white transition-transform ${analytics ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => save(analytics ? 'custom-analytics' : 'custom-essential', analytics)}
                className="self-end px-4 py-2 rounded-full text-sm font-bold text-white bg-[#363C98] hover:bg-[#2c317c] transition-colors cursor-pointer"
              >
                Guardar preferencias
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            <Link
              href="/politicas?tab=cookies"
              className="px-4 py-2 rounded-full text-sm font-bold text-[#363C98] hover:bg-[#363C98]/5 transition-colors cursor-pointer"
            >
              Saber más
            </Link>
            <button
              type="button"
              onClick={() => save('rejected', false)}
              className="px-4 py-2 rounded-full text-sm font-bold text-[#363C98] border-2 border-[#363C98] hover:bg-[#363C98]/5 transition-colors cursor-pointer"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => save('accepted', true)}
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
