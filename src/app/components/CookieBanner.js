'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  getCookieConsent,
  hasChosenConsent,
  saveCookieConsent,
  OPEN_PREFS_EVENT,
} from './cookieConsent';

// Re-exportadas por compatibilidad: por si algo importa estas funciones desde
// CookieBanner.js en vez de desde cookieConsent.js directamente.
export { getCookieConsent, analyticsAllowed, marketingAllowed } from './cookieConsent';

// Banner de cookies v3 (F2 — gestor de consentimiento propio): tres
// categorías reales — Esenciales (siempre activas), Analítica (Google) y
// Marketing (invitaciones de Trustpilot) — que GOBIERNAN de verdad qué
// scripts de terceros carga la web (ver GoogleAnalytics.js y
// TrustpilotInvitations.js, que solo se insertan si su categoría está
// aceptada). La elección se persiste en `sqf-cookie-consent` y se puede
// cambiar después desde el pie de página o desde /politicas?tab=cookies
// (ambos disparan OPEN_PREFS_EVENT, que este componente escucha para
// reaparecer con las preferencias actuales precargadas).
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Primera visita sin elección guardada: mostrar el banner.
  useEffect(() => {
    try {
      if (!hasChosenConsent()) setVisible(true);
    } catch {
      // Sin localStorage (modo privado antiguo): no bloqueamos la página
    }
  }, []);

  // Reabrir en modo preferencias desde el footer o /politicas, con los
  // valores ya guardados precargados (no se resetea a "todo apagado").
  useEffect(() => {
    const reopen = () => {
      const saved = getCookieConsent();
      setAnalytics(saved?.analytics === true);
      setMarketing(saved?.marketing === true);
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_PREFS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, reopen);
  }, []);

  // El banner va por encima del contenido A PROPÓSITO: es una puerta de
  // consentimiento, así que subir el z-index de lo que tapa sería el arreglo
  // equivocado. El problema es que, siendo `fixed`, roba los píxeles de lo que
  // haya debajo. A 375x812 eso dejaba **inpulsables** «Registrarme» (0 de 52
  // px útiles), «Política de Privacidad» y «¿Ya tienes cuenta?» en /register,
  // y «Empezar de nuevo» en /empieza-tu-cambio (2 de 24) — esta última sin
  // rescate posible, porque esa pantalla mide justo el alto del viewport y no
  // hace scroll. Antes ya se había cobrado «Acceder» y «Registro» del menú
  // móvil (PR #95), que se arregló a mano; esto mata la familia entera.
  //
  // Arreglo: mientras el banner esté visible, reservarle su altura REAL al
  // final del body. Real y no una constante porque el banner cambia mucho de
  // tamaño: plegado ocupa ~199 px, y con «preferencias» abierto ~707 px de los
  // 812 de un móvil.
  //
  // Se recalcula por DOS vías a propósito. `showPrefs` en las dependencias es
  // la que manda: es cambio de estado de React, así que el hueco se ajusta de
  // forma determinista justo después de repintar. El ResizeObserver es solo
  // refuerzo para lo que React no sabe (girar el móvil, una fuente que carga
  // tarde y recoloca el texto). No se puede depender solo de él: solo entrega
  // en oportunidades de render, así que en una pestaña en segundo plano no
  // dispara ni una vez.
  const bannerRef = useRef(null);
  useEffect(() => {
    if (!visible) return;
    const el = bannerRef.current;
    if (!el) return;

    const previous = document.body.style.paddingBottom;
    const apply = () => {
      const actual = bannerRef.current;
      if (actual) document.body.style.paddingBottom = `${actual.offsetHeight}px`;
    };
    apply();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(apply);
      ro.observe(el);
    }
    return () => {
      ro?.disconnect();
      document.body.style.paddingBottom = previous;
    };
  }, [visible, showPrefs]);

  const save = (choice, analyticsOn, marketingOn) => {
    saveCookieConsent({ analytics: analyticsOn, marketing: marketingOn, choice });
    setVisible(false);
    setShowPrefs(false);
  };

  if (!visible) return null;

  return (
    <div ref={bannerRef} className="fixed bottom-0 inset-x-0 z-[90] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-[20px] bg-white shadow-2xl ring-1 ring-[#363C98]/10 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#363C98] leading-relaxed">
            🍪 Usamos Cookies para que la web funcione correctamente (navegación,
            carrito, analíticas). Al hacer clic en «aceptar» aceptas todas. Ver más en{' '}
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#363C98]">Marketing (Trustpilot)</p>
                  <p className="text-[#363C98]/70">
                    Nos permite invitarte a valorar tu compra en Trustpilot. Desactivada
                    por defecto; hoy no cargamos ese script hasta que tú lo actives.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={marketing}
                  aria-label="Activar invitaciones de Trustpilot"
                  onClick={() => setMarketing((v) => !v)}
                  className={`shrink-0 mt-1 inline-flex h-6 w-11 items-center rounded-full px-1 transition-colors cursor-pointer ${marketing ? 'bg-[#FF690B]' : 'bg-[#C6C3E8]'}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white transition-transform ${marketing ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => save('custom', analytics, marketing)}
                className="self-end px-4 py-2 rounded-full text-sm font-bold text-white bg-[#363C98] hover:bg-[#2c317c] transition-colors cursor-pointer"
              >
                Guardar preferencias
              </button>
            </div>
          )}

          {/* Aceptar a la IZQUIERDA (decisión de Hamlet: más intuitivo); acepta TODAS. */}
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => save('rejected', false, false)}
              className="order-2 px-4 py-2 rounded-full text-sm font-bold text-[#363C98] border-2 border-[#363C98] hover:bg-[#363C98]/5 transition-colors cursor-pointer"
            >
              Rechazar
            </button>
            <Link
              href="/politicas?tab=cookies"
              className="order-3 px-4 py-2 rounded-full text-sm font-bold text-[#363C98] hover:bg-[#363C98]/5 transition-colors cursor-pointer"
            >
              Saber más
            </Link>
            <button
              type="button"
              onClick={() => save('accepted', true, true)}
              className="order-1 px-5 py-2 rounded-full text-sm font-bold text-white bg-[#FF690B] hover:bg-[#e05b08] shadow-md transition-colors cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
