'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useCheckoutStore } from '@/stores/checkout.store';
import { useCurrency } from './useCurrency';
import CurrencySelector from './CurrencySelector';
import { arancelParaCarrito } from './aranceles';
import { useShippingQuote } from './useShippingQuote';
import useCerrarAlTocarFuera from '@/hooks/useCerrarAlTocarFuera';

export default function OrderSummary(props) {
    // `mostrarCta` va por defecto a `true`: los pasos 1 y 2 no la pasan y
    // siguen igual que antes. Solo el paso 3 la apaga — ver dónde se usa.
    const { isFormValid, isFormDirty, triggerCheckoutFormSubmit, mostrarCta = true } = props;
    const { cart } = useCartStore();

    // En MÓVIL el resumen va plegado: ocupaba media pantalla y empujaba el
    // formulario fuera de la vista. Solo se despliega al tocar la barra. En
    // escritorio no cambia nada (el bloque plegable lleva `lg:block`, la barra
    // `lg:hidden`), que es la regla de la casa al tocar responsive.
    // El total y el botón de continuar quedan SIEMPRE a la vista: son lo que
    // el cliente necesita para decidir y avanzar sin desplegar nada.
    const [expanded, setExpanded] = useState(false);

    // Desplegado se come el tercio inferior de la pantalla, y hasta ahora la
    // única salida era volver a encontrar la barra. Ahora un toque en el resto
    // de la página (o Escape) lo pliega. La ref va en el contenedor de TODO el
    // resumen: así el propio botón queda "dentro" y sigue siendo un
    // interruptor normal, y se pueden tocar los productos, la moneda o
    // «Continuar» sin que se cierre en la cara.
    const resumenRef = useRef(null);
    const plegar = useCallback(() => setExpanded(false), []);
    useCerrarAlTocarFuera(expanded, plegar, [resumenRef]);

    const { currency, setCurrency, symbol, convertPrice, currencies } = useCurrency();

    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Only apply shipping if the cart contains physical products (non-direct checkouts)
    const hasPhysicalItems = cart.some(item => !item.isDirectCheckout);

    // Aranceles de importación (solo envíos a EE. UU. con productos físicos).
    // Se muestran como línea aparte del envío; el cobro real llega en Fase 16.
    const { formData } = useCheckoutStore();

    // Envío real por zona (12.2). El backend es quien manda: aquí solo se
    // pinta lo mismo que se va a cobrar.
    // ENVÍO: el destino manda, no la facturación.
    // Si el cliente desmarcó «usar la misma dirección», la tarifa tiene que
    // salir del CP y el país a los que se manda el paquete. Calcularla con los
    // de facturación es cobrar la zona equivocada — entre España peninsular
    // (0 €) y Norteamérica (22,90 €) la diferencia no es un redondeo.
    const destinoEnvio = formData?.sameAddress === false
      ? { pais: formData?.shippingCountry, cp: formData?.shippingPostalCode }
      : { pais: formData?.country, cp: formData?.postalCode };
    const { shippingCost: finalShipping, sinDestino } = useShippingQuote(
      subtotal,
      destinoEnvio.pais,
      destinoEnvio.cp,
      hasPhysicalItems,
    );
    // Los aranceles de importación los cobra la ADUANA DE DESTINO, así que
    // salen del país al que se envía, no del de facturación. Con la dirección
    // separada era el mismo fallo que el envío: alguien que factura en España
    // y manda a Estados Unidos no veía el arancel, y al revés se le cobraba
    // uno que no le corresponde.
    const arancel = arancelParaCarrito(cart, destinoEnvio.pais);

    const total = subtotal + finalShipping + arancel;

    // Lógica de pago recurrente: son suscripciones tanto el tramo mensual ('/mes')
    // como el trimestral ('/trimestre'). El anual y el permanente son pago único,
    // así que NO cuentan como recurrentes.
    const recurringItems = cart.filter(item => item.period === '/mes' || item.period === '/trimestre');
    const recurringTotal = recurringItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    // Today's total includes everything (recurring first payment + others).
    const hasRecurring = recurringTotal > 0;

    // Etiqueta del cobro siguiente según la periodicidad presente.
    const hasQuarterly = recurringItems.some(item => item.period === '/trimestre');
    const hasMonthly = recurringItems.some(item => item.period === '/mes');
    const recurringLabel = hasMonthly && hasQuarterly
      ? 'En cada renovación'
      : hasQuarterly
        ? 'Los siguientes trimestres'
        : 'Los siguientes meses';

    return (
    // `px-5 py-3` en móvil en vez de `p-6`: la barra pegada abajo es UNA línea
    // con el total y el acceso al detalle, y 24px de aire por los cuatro lados
    // la hacían casi el doble de alta de lo necesario. En escritorio no cambia
    // nada — ahí esto no es una barra, es la columna entera (`lg:p-14`).
    <div ref={resumenRef} className="w-full h-full px-5 py-3 lg:p-14 xl:p-20 font-sans flex flex-col justify-start lg:justify-center">

      {/* Logo (oculto en móvil para compactar) + selector de moneda (siempre
          visible: en móvil se quedaba escondido dentro del bloque del logo). */}
      <Link href="/" className="mb-4 hidden lg:block self-center">
        <div className="w-20 h-20 relative">
          <Image src="/LogotipoSquatfit.png" layout="fill" objectFit="contain" alt="Logo Squad Fit" />
        </div>
      </Link>
      {/* Barra compacta — SOLO móvil. Una línea: lo que se paga a la izquierda
          y el acceso al detalle a la derecha. Antes eran dos («Ver resumen (1)»
          arriba y «Hoy pagarás …» debajo) y en un móvil con el teclado abierto
          esas dos líneas se comían la mitad de lo que quedaba de pantalla. */}
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-expanded={expanded}
        aria-controls="resumen-pedido"
        className="lg:hidden flex items-center justify-between w-full gap-3 mb-4 cursor-pointer"
      >
        <span className="text-indigo-900/80 text-sm">
          Hoy pagarás{' '}
          <span className="font-bold text-indigo-900 text-base">
            {convertPrice(total)} {symbol}
          </span>
        </span>
        <span className="flex items-center gap-1 text-indigo-900 font-bold text-sm shrink-0">
          Ver detalle
          {/* Antes era una flecha hacia abajo, que promete desplegar en línea.
              El resumen ya no se despliega: entra deslizando desde la derecha,
              así que la flecha correcta apunta hacia allí. */}
          <ChevronRight size={18} className="shrink-0" />
        </span>
      </button>

      {/* Fondo del cajón — solo móvil. Cierra al tocar fuera, igual que el
          cajón del carrito. */}
      <div
        onClick={plegar}
        className={`lg:hidden fixed inset-0 z-[99] bg-black/25 transition-opacity duration-300 ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Detalle. En ESCRITORIO va inline en la columna derecha, como siempre.
          En MÓVIL es un cajón que entra deslizando desde la derecha — el mismo
          gesto, tamaño y animación que el cajón del carrito (CartDrawer), para
          que el resumen se comporte igual en toda la web. Desplegarlo en línea
          empujaba el formulario fuera de la vista, que es lo que lo hacía
          incómodo en el paso 2. */}
      {/* El desplazamiento va en `style`, no en clases de Tailwind.
          Con `translate-x-full`/`translate-x-0` el cajón se quedaba clavado
          fuera de pantalla: medido en el preview, `left` calculado 54,6px pero
          el rectángulo real en 390px, y `translate: 100%` seguía puesto con la
          clase `translate-x-0` ya aplicada. Tailwind v4 escribe la propiedad
          `translate` (no `transform`), y ahí las dos utilidades se pisaban.
          Un estilo en línea no admite ese empate. El `lg:translate-x-0!` lleva
          `!important` a propósito: es lo único que gana a un estilo en línea,
          y hace falta para que en escritorio el resumen vuelva a su sitio. */}
      <div
        id="resumen-pedido"
        style={{ transform: expanded ? 'translateX(0)' : 'translateX(100%)' }}
        className={`
          fixed right-0 top-0 z-[100] h-full w-[86%] max-w-[420px] overflow-y-auto
          bg-orange-50 shadow-2xl p-6 transition-transform duration-300 ease-out
          lg:static lg:z-auto lg:h-auto lg:w-auto lg:max-w-none lg:[transform:none]!
          lg:bg-transparent lg:shadow-none lg:p-0 lg:overflow-visible
        `}
      >
        <div className="lg:hidden flex items-center justify-between mb-6">
          <span className="text-indigo-900 font-bold">Tu pedido ({totalItems})</span>
          <button
            type="button"
            onClick={plegar}
            aria-label="Cerrar resumen"
            className="p-1.5 rounded-full text-indigo-900/60 hover:bg-indigo-100 active:scale-90 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

      <div className="mb-6 flex justify-center">
        <CurrencySelector currency={currency} setCurrency={setCurrency} currencies={currencies} />
      </div>

      {/* Product List Cards */}
      <div className="space-y-4 mb-8 overflow-y-auto pr-2 max-h-[40vh]">
        {cart.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-indigo-50"
          >
            <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden relative">
              <Image 
                src={item.image} 
                alt={item.name} 
                layout="fill"
                className="object-contain p-1" 
              />
            </div>

            <div className="flex-1">
              <h4 className="text-orange-500 font-bold text-sm leading-tight mb-1">
                {item.name}
              </h4>
              <p className="text-indigo-400 text-xs mb-2">
                 {item.description || (item.isDirectCheckout ? 'Suscripción online' : 'Volumen en papel')}
              </p>
              
              <div className="flex justify-between items-end">
                <span className="text-indigo-900 text-xs font-semibold bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {item.type === 'digital'
                    ? item.period?.replace('/', '') || 'mes'
                    : item.tier
                      ? { mensual: 'mensual', trimestral: 'trimestral', anual: 'anual', permanente: 'de por vida' }[item.tier] || item.tier
                      : `${item.quantity || 1} unidad`}
                </span>
                <span className="text-indigo-900 font-bold text-sm">
                  {convertPrice(item.price * (item.quantity || 1))} {symbol}
                  {item.period && <span className="text-xs font-normal text-gray-500"> {item.period}</span>}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

        {hasRecurring && (
            <div className="text-center mb-6">
                <p className="text-indigo-500 text-sm font-medium leading-relaxed">
                    Tu carrito incluye productos de<br/>
                    pago único y de suscripción
                </p>
            </div>
        )}

        {(hasPhysicalItems || arancel > 0) && (
            <div className="space-y-2">
                {hasPhysicalItems && (
                    <div className="flex justify-between items-center text-indigo-900/70 text-sm sm:text-base">
                        <span>Envío</span>
                        <span>
                            {sinDestino
                                ? 'Según destino'
                                : finalShipping > 0
                                    ? `${convertPrice(finalShipping)} ${symbol}`
                                    : 'Gratis'}
                        </span>
                    </div>
                )}
                {arancel > 0 && (
                    <div className="flex justify-between items-center text-indigo-900/70 text-sm sm:text-base">
                        <span>Aranceles (importación EE. UU.)</span>
                        <span>{convertPrice(arancel)} {symbol}</span>
                    </div>
                )}
            </div>
        )}

      </div>
      {/* fin del detalle */}

      {/* Totales y botón. Con el resumen plegado se ve SOLO lo que se paga: el
          desglose (envío, aranceles) se va con el detalle, porque plegado no
          debe quedar media lista a la vista. El cobro recurrente sí se queda
          siempre: no es detalle, es lo que se le seguirá cobrando.
          El texto es pequeño en móvil y crece a partir de `sm:`. */}
      <div className="space-y-4 mb-8">
        <div className="space-y-2">
            {/* Desglose. La línea de Envío se pinta SIEMPRE que el pedido lleve
                envío, no solo cuando además hay aranceles.
                Antes toda la caja colgaba de `arancel > 0`, así que con envío a
                España (el caso normal) desplegar «Ver resumen» enseñaba el libro
                a 34,95 € y «Hoy pagarás 39,94 €» sin decir de dónde salían los
                4,99: los únicos que veían el desglose eran los envíos a EE. UU.
                Con envío gratis la línea sigue apareciendo y dice «Gratis», que
                es lo que explica por qué el total no sube.
                Aquí NO se toca ningún importe ni ningún cálculo: `finalShipping`,
                `arancel` y `total` son los de antes, letra por letra. Lo único
                que cambia es qué líneas se enseñan.

                DOS COSAS DE ESTE COMENTARIO ESTABAN CADUCADAS, corregidas el
                3-ago tras preguntarle las tarifas reales a
                `POST /shipping/quote` (me hicieron perseguir una falsa alarma):

                · NO hay ningún umbral de 90 €. Los de verdad, por zona:
                    España peninsular ... tarifa 0    (gratis SIEMPRE, umbral 0)
                    Europa cercana ...... 9,90 €      (gratis desde 100 €)
                    Norteamérica ........ 22,90 €     (gratis desde 150 €)
                    Latinoamérica ....... 19,90 €     (gratis desde 150 €)
                  Así que el ejemplo de «envío a España … 4,99» tampoco vale:
                  a España peninsular no se cobra envío.

                · El desajuste de que el envío se pintara y Stripe no lo cobrase
                  YA NO está en espera: se arregló el 30-jul (revisión
                  00353-duy). */}
            {/* El desglose (envío, aranceles) se mudó ARRIBA, dentro del
                detalle: en móvil el detalle es ahora un cajón lateral y estas
                líneas tienen que ir con él, no quedarse sueltas en la barra. */}
            {/* Solo en escritorio: en móvil este mismo total ya va en la barra
                compacta de arriba, y salían los dos «Hoy pagarás» seguidos. */}
            <div className="hidden lg:flex justify-between items-center text-indigo-900/80 text-sm sm:text-base lg:text-lg">
                <span>Hoy pagarás</span>
                <span className="font-bold text-indigo-900 text-base sm:text-lg lg:text-xl">
                    {convertPrice(total)} {symbol}
                </span>
            </div>

            {/* Simulador de cuotas de seQura, debajo del total. Solo aparece si
                de verdad se puede fraccionar ESTE carrito: nada de enseñar un
                «divídelo en plazos» permanente que luego el pago no cumple.
                - `!hasRecurring`: con una suscripción dentro no se puede, porque
                  seQura financia un importe cerrado y una suscripción no lo es.
                - `divisa`: solo en euros; el comercio es ES/EUR y con el selector
                  en otra moneda el importe mostrado no sería el que se cobra.
                - Por debajo de 50 € el propio widget no pinta nada.
                Se pasa `total` (lo que se paga hoy), no el subtotal: es la cifra
                que el cliente está mirando cuando duda. */}
            {/* AQUÍ NO VA EL SIMULADOR DE seQURA, a propósito.
                Este resumen se pinta en los tres pasos del carrito, así que su
                cuadro salía en todos — y con el de la tarjeta del curso y el
                del paso 3, el cliente se cruzaba con la marca de seQura cuatro
                veces en una sola compra. Deja de parecer un método de pago y
                empieza a parecer que la tienda está patrocinada por ellos.
                Decisión de María el 4-ago: solo en dos sitios, la tarjeta del
                curso (donde ayuda a decidir) y el paso 3 (donde se elige cómo
                pagar). */}

            {hasRecurring && (
                <div className="flex justify-between items-center text-indigo-900 font-bold text-sm sm:text-base lg:text-lg pt-2 border-t border-indigo-100/50">
                    <span>{recurringLabel}</span>
                    <span>
                        {convertPrice(recurringTotal)} {symbol}
                    </span>
                </div>
            )}
        </div>
      </div>

      {/* En el paso del checkout incrustado, quien cobra es el botón «Pagar»
          de Stripe: repetir aquí un «Continuar» daría dos llamadas a la acción
          en la misma pantalla y ninguna de las dos sería obvia. El resumen se
          queda por lo que aporta —recordar qué se está comprando y por cuánto,
          justo cuando se decide el pago—, pero sin CTA propia. */}
      {mostrarCta && (
        <button
          onClick={triggerCheckoutFormSubmit}
          disabled={!isFormValid}
          className="w-full bg-indigo-800 text-white cursor-pointer font-bold text-base py-3 lg:text-lg lg:py-4 rounded-2xl hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      )}

    </div>
  );
}