'use client';

// Simulador de cuotas de seQura: el «desde X €/mes» que sale junto al precio.
//
// Por qué esto primero y el checkout después: el simulador no cobra nada, se
// pinta entero en el navegador (no hay una sola llamada a nuestro backend) y
// quita el muro que supone ver 300 € de golpe. Sube conversión aunque todavía
// no se pueda pagar con seQura, así que es lo que antes rinde de la integración.
//
// ── Lo que hay que saber antes de tocar esto ────────────────────────────────
//
// 1. SOLO PAGOS ÚNICOS. `pp3` («Paga Fraccionado», en 3/6/9/12/18 meses)
//    financia un importe cerrado. Una suscripción mensual no se puede
//    fraccionar, así que en los tramos `mensual` y `trimestral` el simulador NO
//    debe aparecer: prometería algo que el checkout no puede cumplir.
//
// 2. SOLO EUROS Y SOLO ESPAÑA. El comercio de sandbox responde
//    `allowed_countries: ["ES"]` y `currency: "EUR"`. Con el selector de divisa
//    en USD (o cualquier otra) el importe que vería el widget no sería el que se
//    va a cobrar, así que tampoco se pinta.
//
// 3. EL IMPORTE VA EN CÉNTIMOS. `data-amount="15000"` son 150,00 €. Pasarlo en
//    euros hace que el widget anuncie cuotas 100 veces menores.
//
// 4. LA CSP TIENE QUE DEJAR PASAR sequracdn. El script viene de un dominio de
//    terceros y sin añadirlo a `script-src` el navegador lo bloquea y el widget
//    simplemente no aparece — sin error en el servidor y sin que `curl` note
//    nada. Ya nos costó 15 horas de carrito caído con el iframe de Stripe el
//    28-jul. Está añadido en next.config.mjs; si alguien recorta esa cabecera,
//    esto deja de verse.
//
// 5. EN SANDBOX LAS CUOTAS SALEN A 0,00 €. El comercio de pruebas no tiene
//    comisiones configuradas (`cost_description: "desde 0,00 €/cuota"`). No es
//    un fallo: en producción salen los costes reales.

import React, { useEffect, useRef } from 'react';

const ENTORNO = process.env.NEXT_PUBLIC_SEQURA_ENV || 'sandbox';
const MERCHANT = process.env.NEXT_PUBLIC_SEQURA_MERCHANT || 'squatfit_web';
const ASSETS_KEY = process.env.NEXT_PUBLIC_SEQURA_ASSETS_KEY || '2lC-bllCsd';

// Apagado por defecto: se enciende con NEXT_PUBLIC_SEQURA_READY=true en Vercel.
// Así el código puede viajar a producción sin que el cliente vea nada hasta que
// seQura dé el visto bueno al sandbox y lleguen las credenciales reales.
const ENCENDIDO = process.env.NEXT_PUBLIC_SEQURA_READY === 'true';

const SCRIPT_URI =
  ENTORNO === 'live'
    ? 'https://live.sequracdn.com/assets/sequra-checkout.min.js'
    : 'https://sandbox.sequracdn.com/assets/sequra-checkout.min.js';

const PRODUCTO = 'pp3';

/** Carga el script de seQura una sola vez por página, no una por tarjeta.
 *
 * OJO con el nombre de la variable de configuración. El ejemplo de la
 * documentación la declara como `sequraConfigParams`, pero eso es solo el nombre
 * local: su cargador la asigna a **`window.SequraConfiguration`**, y ese es el
 * sitio donde la librería la busca. Dejarla en `window.sequraConfigParams` hace
 * que el script arranque SIN configuración: no falla, no avisa, simplemente no
 * pinta nada y `Sequra.computeCreditAgreements` revienta con «Cannot convert
 * undefined or null to object». Perdí un rato con eso.
 *
 * También hay que dejar montado el buzón `SequraOnLoad` + el stub de
 * `Sequra.onLoad` ANTES de inyectar el script, porque las llamadas que se hagan
 * mientras carga se encolan ahí y se ejecutan cuando la librería está lista.
 */
let cargando = null;
function cargarSequra() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Sequra?.refreshComponents) return Promise.resolve(true);
  if (cargando) return cargando;

  cargando = new Promise((resolve) => {
    const config = {
      merchant: MERCHANT,
      assetKey: ASSETS_KEY,
      products: [PRODUCTO],
      scriptUri: SCRIPT_URI,
      decimalSeparator: ',',
      thousandSeparator: '.',
      locale: 'es-ES',
      currency: 'EUR',
    };

    window.SequraConfiguration = config;
    window.SequraOnLoad = [];
    window.Sequra = window.Sequra || {};
    window.Sequra.onLoad = (cb) => { window.SequraOnLoad.push(cb); };

    const s = document.createElement('script');
    s.src = SCRIPT_URI;
    s.async = true;
    s.onload = () => resolve(true);
    // Si el script no carga (CSP, bloqueador de anuncios, seQura caído) no se
    // pinta nada y el precio se queda como estaba. Nunca debe romper la ficha.
    s.onerror = () => {
      console.warn('[seQura] no se pudo cargar el simulador de cuotas');
      resolve(false);
    };
    document.head.appendChild(s);
  });
  return cargando;
}

/**
 * @param {number} importeEur  Importe del pago único, en euros.
 * @param {boolean} pagoUnico  false para suscripciones → no se pinta.
 * @param {string} divisa      Código de la divisa activa; solo se pinta en EUR.
 */
export default function SequraSimulador({
  importeEur,
  pagoUnico = true,
  divisa = 'EUR',
  className = '',
  /** 'left' | 'center'. En la ficha del curso va centrado con el precio; en el
   *  paso 3 va a la izquierda, alineado con el resto del formulario. */
  alineacion = 'center',
}) {
  const ref = useRef(null);
  const visible = ENCENDIDO && pagoUnico && divisa === 'EUR' && importeEur > 0;

  useEffect(() => {
    if (!visible) return;
    let cancelado = false;
    cargarSequra().then((ok) => {
      if (!ok || cancelado || !ref.current) return;
      // refreshComponents vuelve a leer los data-amount del DOM: hay que
      // llamarlo en cada cambio de tramo, no solo al montar, o la cuota se
      // queda con el importe del tramo anterior. Se pasa por onLoad para que la
      // primera llamada espere a que la librería acabe de inicializarse.
      window.Sequra.onLoad(() => {
        if (!cancelado) window.Sequra.refreshComponents?.();
      });
    });
    return () => { cancelado = true; };
  }, [visible, importeEur]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={`sequra-promotion-widget ${className}`}
      data-amount={Math.round(importeEur * 100)}
      data-product={PRODUCTO}
      data-type="text"
      // Sin esto seQura sirve una versión antigua del widget. Nos lo dijo su
      // equipo de integración el 1-ago al revisar nuestra vista previa: el
      // atributo no aparece en la documentación de componentes promocionales,
      // así que no hay forma de deducirlo leyendo.
      data-version="v2"
      // ── Sin caja ──────────────────────────────────────────────────────
      // El widget venía con recuadro y fondo propios, y en una página que ya
      // tiene tarjetas se leía como un anuncio insertado: parecía que la
      // tienda estuviera patrocinada por seQura. Con el borde y el fondo
      // transparentes queda como una línea de texto más de la ficha.
      //
      // POR QUÉ SE CONFIGURA SU WIDGET EN VEZ DE ESCRIBIR EL TEXTO A MANO,
      // que era la idea inicial: su «+info» es el que lleva el ejemplo
      // representativo con la TAE, y eso lo exige la normativa española de
      // crédito al consumo en cuanto se anuncia una cuota con cifras. No hay
      // URL pública a la que enlazarlo por separado (probadas cinco, todas
      // 404 o 403), así que sacarlo de su iframe significaba quedarse sin él.
      //
      // Y hay una trampa en sus datos que remata el argumento: de los dos
      // campos que devuelve `computeCreditAgreements`, `instalment_amount`
      // son 15,66 € (solo el principal) e `instalment_total` son 18,06 €, que
      // es lo que se cobra. Escribiendo el texto a mano y cogiendo el campo
      // del nombre obvio se anunciaría una cuota 2,40 € más barata que la
      // real. Su widget ya pinta la buena.
      //
      // El TEMA se lee al MONTAR, no en `refreshComponents`: estos atributos
      // tienen que estar puestos desde el primer render o se ignoran.
      data-border-color="transparent"
      data-background-color="transparent"
      data-alignment={alineacion}
    />
  );
}
