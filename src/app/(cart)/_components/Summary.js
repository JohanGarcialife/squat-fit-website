import React, { useCallback, useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, ChevronRight, X, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useCurrency } from './useCurrency';
import CurrencySelector from './CurrencySelector';
import { useCartStore } from '@/stores/cart.store';
import { useCheckoutStore } from '@/stores/checkout.store';
import { arancelParaCarrito } from './aranceles';
import { TIER_META, groupTierOrder, buildTierCartItem, formatEuros } from '@/app/components/courseCatalog';
import useCerrarAlTocarFuera from '@/hooks/useCerrarAlTocarFuera';

// Sufijo de cobro por tramo (el trimestral se etiquetaba antes como «pago
// único» porque el selector usaba un orden fijo de 3 tramos).
const tierChargeSuffix = (tier) =>
  tier === 'mensual' ? '/mes'
  : tier === 'trimestral' ? '/trimestre'
  : tier === 'anual' ? '/año'
  : 'pago único';

export default function Summary(props) {
    const {
        cart,
        totalItems,
        subtotal,
        shipping,
        total,
        freeShippingThreshold,
        sinDestino,
        remainingForFreeShipping,
        addToCart,
        decrementQuantity,
        removeFromCart,
        updateQuantity,
        setStep    } = props;

    // Moneda: hook compartido (Euro y Dólar primero + monedas de países principales)
    const { currency, setCurrency, symbol, convertPrice, currencies } = useCurrency();

    // En MÓVIL el detalle (subtotal, envío, aranceles) va PLEGADO: en el
    // bottom sheet junto a «Continuar» solo tiene que verse el total, que es lo
    // que el cliente va a pagar. Misma regla que el resumen de los pasos 2 y 3:
    // el bloque plegable lleva `lg:block` y la barra `lg:hidden`, así que en
    // escritorio no cambia nada.
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    // Y una vez desplegado hay que poder salir sin buscar la barra otra vez:
    // un toque en el resto de la página (o Escape) lo pliega. La ref va en el
    // bottom sheet completo, así el botón «Ver detalle» sigue siendo un
    // interruptor y se puede tocar la moneda o «Continuar» sin que se cierre.
    const hojaRef = useRef(null);
    const plegarDetalle = useCallback(() => setDetalleAbierto(false), []);
    useCerrarAlTocarFuera(detalleAbierto, plegarDetalle, [hojaRef]);

    // Deshacer: igual que en el pop-up del carrito, también cuando el producto
    // se elimina llegando a 0 con el botón −.
    const { lastRemoved, undoRemove, setDirectCheckoutItem } = useCartStore();

    // Solo hay envío (y banner de envío gratis) si el carrito lleva físicos.
    const hasPhysicalItems = cart.some((item) => !item.isDirectCheckout);

    // Aranceles de importación (solo envíos a EE. UU. con físicos): el país
    // sale del checkout persistido (paso 2); línea aparte del envío. El cobro
    // real llega con la Fase 16.
    const { formData } = useCheckoutStore();
    // Mismo criterio que en el resumen del paso 2/3: el arancel lo cobra la
    // aduana de DESTINO, así que sale del país al que se envía.
    const paisDestino = formData?.sameAddress === false
      ? formData?.shippingCountry
      : formData?.country;
    const arancel = arancelParaCarrito(cart, paisDestino);

    // Cursos con tramos (15.1): el item lleva su grupo completo, así que aquí
    // también se puede cambiar entre Mensual / Anual / De por vida.
    const isCourseTier = (item) => !!(item.tierGroup && item.tier);
    const handleTierChange = (item, newTierKey) => {
        if (item.tier === newTierKey) return;
        setDirectCheckoutItem(buildTierCartItem(item.tierGroup, newTierKey));
    };

    // Digital Product Variations (Mirrors Shop.js data)
    const digitalVariants = [
        { id: 'digital-monthly', name: 'Mensual', price: 9.99, period: '/mes' },
        { id: 'digital-annual', name: 'Anual', price: 89.99, period: '/año' },
        { id: 'digital-permanent', name: 'Permanente', price: 159, period: '/pago único' }
    ];

    // Helper to determine if an item is a digital subscription product
    const isDigital = (item) => digitalVariants.some(v => v.id === item.id) || item.type === 'digital';

    const handlePeriodChange = (currentItem, newVariantId) => {
        if (currentItem.id === newVariantId) return; // No change

        const newVariant = digitalVariants.find(v => v.id === newVariantId);
        if (!newVariant) return;

        // Construct the new item derived from the current one but with new variant details
        // We preserve image and generic type, but update ID, Name, Price, Period.
        // OJO: endpoint/payload del tramo anterior fuera — si se heredaran, el
        // pago cobraría el tramo viejo con el precio nuevo a la vista.
        const newItem = {
            ...currentItem,
            id: newVariant.id,
            name: newVariant.name,
            price: newVariant.price,
            period: newVariant.period,
            endpoint: undefined,
            payload: undefined,
            type: 'digital', // Ensure type is set
            description: 'Suscripción online' // Constant for digital
        };

        // Remove old item and add new item
        removeFromCart(currentItem.id);
        addToCart(newItem); // Assumes addToCart adds single quantity by default or takes object
    };

    return (
     <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
        
          {/* Columna Izquierda: Lista de Productos */}
          <div className="w-full lg:w-2/3 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
            <div className="mb-10">
                <span className="text-indigo-900 text-lg font-medium">Paso 1 de 3</span>
                <Link
                href="/cocina"
                className="flex items-center gap-2 mt-4 cursor-pointer text-indigo-900 group">
                <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                <h1 className="text-3xl md:text-4xl font-bold">Carrito ({totalItems})</h1>
                </Link>
            </div>

            {/* Aviso de deshacer: al eliminar un producto (papelera, "x" o el
                botón − llegando a 0) se puede recuperar aquí mismo. */}
            {lastRemoved && (
                <div className="flex items-center justify-between gap-3 mb-6 px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <span className="text-sm text-indigo-900 min-w-0 truncate">
                        «{lastRemoved.item.name}» eliminado
                    </span>
                    <button
                        type="button"
                        onClick={undoRemove}
                        className="shrink-0 inline-flex items-center gap-1.5 text-indigo-900 font-bold text-sm hover:underline active:scale-95 transition cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Deshacer
                    </button>
                </div>
            )}

            <div className="space-y-8">
                {cart.map((item) => (
                <div
                    key={item.id}
                    className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start relative">
                    
                    {/* Remove Button */}
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Eliminar producto"
                    >
                        <X size={20} />
                    </button>
                    
                    {/* Product Image */}
                    <div className="relative w-32 h-32 md:w-36 md:h-36 shrink-0 bg-gray-50 rounded-xl overflow-hidden self-center sm:self-start">
                    <Image
                        src={item.image || '/LibrosFisicos.png'}
                        alt={item.name}
                        fill
                        sizes="144px"
                        className="object-contain p-2"
                    />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h3 className="text-orange-500 font-bold text-xl mb-1">
                            {/* If digital, we might want a generic title or keep specific name? 
                                Reference image shows "Curso de la mujer" as title and "Suscripción online" as subtitle
                                But our items are named "Mensual", "Anual".
                                Let's standardise the display title for digital items if possible or use item.name */}
                            {isDigital(item) ? 'Cocina Squad Fit Digital' : isCourseTier(item) ? item.tierGroup.baseName : item.name}
                        </h3>
                        {/* Subtitle / Description based on reference */}
                        <p className="text-indigo-400 text-sm mb-6">
                            {isDigital(item) ? 'Suscripción online' : item.description || 'Volumen físico'}
                        </p>

                        <div className="flex items-center justify-between w-full mt-auto">
                            {/* Quantity or Period Selector */}
                            <div className="flex flex-col items-center sm:items-start gap-1">
                                <span className="text-indigo-900 text-xs font-bold uppercase tracking-wider">
                                    {isDigital(item) || isCourseTier(item) ? 'Período' : 'Cantidad'}
                                </span>

                                {isCourseTier(item) ? (
                                    /* Curso con tramos: selector Mensual / Anual / De por vida */
                                    <div className="relative group">
                                        <div className="bg-indigo-900 text-white pl-4 pr-10 py-2 rounded-lg font-medium text-sm flex items-center min-w-[140px] cursor-pointer">
                                            {TIER_META[item.tier]?.label || item.tier}
                                        </div>
                                        <div className="absolute top-full left-0 w-full bg-white border border-indigo-100 rounded-lg shadow-lg hidden group-hover:block z-10 overflow-hidden min-w-[190px]">
                                            {groupTierOrder(item.tierGroup).map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleTierChange(item, key)}
                                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors cursor-pointer
                                                        ${item.tier === key ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-gray-600'}
                                                    `}
                                                >
                                                    {TIER_META[key].label}
                                                    <span className="block text-xs text-indigo-400 font-normal">
                                                        {formatEuros(item.tierGroup.tiers[key].price)} {TIER_META[key].priceSuffix}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                                    </div>
                                ) : isDigital(item) ? (
                                    /* Digital Item: Period Display & Selector */
                                    <div className="relative group">
                                         {/* Current Selection Display */}
                                        <div className="bg-indigo-900 text-white pl-4 pr-10 py-2 rounded-lg font-medium text-sm flex items-center min-w-[120px] cursor-pointer">
                                            {item.name} 
                                        </div>
                                        
                                        {/* Dropdown Options */}
                                        <div className="absolute top-full left-0 w-full bg-white border border-indigo-100 rounded-lg shadow-lg hidden group-hover:block z-10 overflow-hidden min-w-[140px]">
                                            {digitalVariants.map((variant) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => handlePeriodChange(item, variant.id)}
                                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors
                                                        ${item.id === variant.id ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-gray-600'}
                                                    `}
                                                >
                                                    {variant.name}
                                                </button>
                                            ))}
                                        </div>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                                    </div>
                                ) : (
                                    /* Físico: botones +/- (máx. 9). El botón "x" de arriba elimina. */
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => decrementQuantity(item.id)}
                                            className="w-9 h-9 rounded-lg bg-indigo-900 text-white text-2xl leading-none font-bold flex items-center justify-center hover:bg-indigo-800 transition-colors cursor-pointer"
                                            aria-label="Quitar una unidad"
                                        >
                                            −
                                        </button>
                                        <span className="min-w-[2ch] text-center text-indigo-900 font-bold text-lg">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, Math.min(9, item.quantity + 1))}
                                            disabled={item.quantity >= 9}
                                            className="w-9 h-9 rounded-lg bg-indigo-900 text-white text-2xl leading-none font-bold flex items-center justify-center hover:bg-indigo-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label="Añadir una unidad"
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                <span className="text-indigo-900 font-bold text-xl">
                                    {convertPrice(item.price * (item.quantity || 1))} {symbol}
                                </span>
                                {isDigital(item) && <span className="text-indigo-400 text-xs block">
                                    {digitalVariants.find(v => v.id === item.id)?.period || '/mes'}
                                </span>}
                                {isCourseTier(item) && <span className="text-indigo-400 text-xs block">
                                    {tierChargeSuffix(item.tier)}
                                </span>}
                            </div>
                        </div>
                    </div>
                </div>
                ))}

                {cart.length === 0 && (
                     <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <p className="text-indigo-900 text-xl font-medium">Tu carrito está vacío</p>
                        <Link href="/cocina" className="text-orange-500 font-bold mt-4 inline-block hover:underline">
                            Volver a la tienda
                        </Link>
                     </div>
                )}
            </div>
          </div>

        {/* Columna Derecha: Resumen — sticky a la derecha en desktop, sticky
            abajo (bottom sheet) en móvil para tener siempre a la vista el total. */}
        <div className="w-full lg:w-1/3 lg:min-h-screen bg-orange-50 sticky bottom-0 lg:static z-40 rounded-t-3xl lg:rounded-none shadow-[0_-10px_30px_rgba(0,0,0,0.10)] lg:shadow-none">
          <div className="lg:sticky lg:top-0 lg:h-screen max-h-[70vh] lg:max-h-none overflow-y-auto">
            <div className="py-8 lg:py-14 px-6 lg:px-20 xl:px-32 flex flex-col h-full justify-start lg:justify-center">
              
              {/* Logo + moneda — el logo se oculta en móvil (bottom sheet compacto) */}
              <div className="flex flex-col items-center mb-6 lg:mb-10">
                <div className="hidden lg:block w-24 h-24 relative mb-4">
                     <Image
                        src="/LogotipoSquatfit.png"
                        fill
                        sizes="96px"
                        className="object-contain"
                        alt="Logo Squad Fit"
                     />
                </div>

                 {/* Selector de moneda */}
                <CurrencySelector currency={currency} setCurrency={setCurrency} currencies={currencies} />
              </div>

              {/* Free Shipping Message — solo con productos físicos en el
                  carrito (en carritos 100 % digitales no hay envío que regalar) */}
              {hasPhysicalItems && (
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-indigo-900 text-sm sm:text-base lg:text-lg">
                      *Añade <span className="font-bold">{convertPrice(remainingForFreeShipping)} {symbol}</span> para tener envío <span className="text-orange-500 font-bold">gratis</span>
                    </p>
                  ) : (
                    <p className="text-green-600 text-sm sm:text-base lg:text-lg font-bold">
                      ¡Tienes envío gratis!
                    </p>
                  )}
                </div>
              )}

              {/* Un solo artículo por pedido.
                  El cobro de físicos va por `create-payment-intent-version` o
                  `-pack`, y ambos aceptan UN id: con dos artículos distintos el
                  pago se corta. Eso ya pasaba, pero el aviso saltaba en el paso
                  de PAGO — después de que el cliente hubiera dejado correo,
                  dirección y DNI—, que es el peor momento para enterarse.
                  Aquí se le dice en el paso 1, cuando corregirlo cuesta un clic
                  en la papelera que ya tiene al lado. */}
              {cart.length > 1 && (
                <div className="mb-6 sm:mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left">
                  <p className="text-amber-900 font-bold text-sm sm:text-base">
                    Por ahora solo podemos enviar un artículo por pedido
                  </p>
                  <p className="text-amber-800 text-sm mt-1">
                    Tienes {cart.length} en el carrito. Deja el que quieras recibir
                    primero y haz el otro pedido después — te llegarán igual.
                  </p>
                </div>
              )}

              {/* Totals — en móvil el texto es pequeño y discreto; crece a
                  partir de `sm:` (en el móvil de María, 375 px, se comía media
                  pantalla). */}
              <div className="mb-6 sm:mb-8 lg:mb-12 max-w-md mx-auto w-full">

                {/* Acceso al detalle — SOLO móvil.
                    Era un desplegable con flecha hacia abajo mientras que en
                    los pasos 2 y 3 el mismo «Ver detalle» abre un cajón que
                    entra desde la derecha. La misma pasarela con dos gestos
                    distintos para lo mismo se lee como dos webs pegadas, así
                    que este paso pasa al cajón y la flecha apunta a donde
                    aparece de verdad. */}
                <button
                  type="button"
                  onClick={() => setDetalleAbierto(true)}
                  aria-expanded={detalleAbierto}
                  aria-controls="detalle-carrito"
                  className="lg:hidden flex items-center justify-between w-full gap-3 mb-3 cursor-pointer"
                >
                  <span className="text-indigo-900 font-bold text-sm">Ver detalle</span>
                  <ChevronRight size={18} className="text-indigo-900 shrink-0" />
                </button>

                {/* Fondo del cajón — solo móvil, cierra al tocar fuera. */}
                <div
                  onClick={plegarDetalle}
                  className={`lg:hidden fixed inset-0 z-[99] bg-black/25 transition-opacity duration-300 ${
                    detalleAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  aria-hidden="true"
                />

                {/* Detalle: cajón deslizante en móvil, inline en escritorio.
                    El desplazamiento va en `style` y no en clases de Tailwind
                    por el mismo motivo que en OrderSummary: Tailwind v4 escribe
                    la propiedad `translate` y las utilidades se pisan entre sí,
                    dejando el cajón clavado fuera de pantalla. El
                    `lg:[transform:none]!` lleva `!important` porque es lo único
                    que gana a un estilo en línea. */}
                <div
                  id="detalle-carrito"
                  ref={hojaRef}
                  style={{ transform: detalleAbierto ? 'translateX(0)' : 'translateX(100%)' }}
                  className={`
                    fixed right-0 top-0 z-[100] h-full w-[86%] max-w-[420px] overflow-y-auto
                    bg-orange-50 shadow-2xl p-6 transition-transform duration-300 ease-out
                    text-left
                    lg:static lg:z-auto lg:h-auto lg:w-auto lg:max-w-none lg:[transform:none]!
                    lg:bg-transparent lg:shadow-none lg:p-0 lg:overflow-visible
                    lg:space-y-6
                  `}
                >
                  <div className="lg:hidden flex items-center justify-between mb-6">
                    <span className="text-indigo-900 font-bold">Detalle del pedido</span>
                    <button
                      type="button"
                      onClick={plegarDetalle}
                      aria-label="Cerrar detalle"
                      className="p-1.5 rounded-full text-indigo-900/60 hover:bg-indigo-100 active:scale-90 transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3 lg:space-y-6">
                    <div className="flex justify-between items-center text-indigo-900/80 text-sm sm:text-lg lg:text-xl">
                      <span>Subtotal</span>
                      <span>{convertPrice(subtotal)} {symbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-indigo-900/80 text-sm sm:text-lg lg:text-xl">
                      <span>Envío</span>
                      <span>
                        {/* `shipping` ya viene con la tarifa de la zona y el
                            umbral de gratis aplicados (12.2); aquí no se
                            recalcula nada. */}
                        {sinDestino
                          ? 'Según destino'
                          : `${shipping > 0 ? convertPrice(shipping) : '0,00'} ${symbol}`}
                      </span>
                    </div>
                    {arancel > 0 && (
                      <div className="flex justify-between items-center text-indigo-900/80 text-sm sm:text-lg lg:text-xl">
                        <span>Aranceles (EE. UU.)</span>
                        <span>{convertPrice(arancel)} {symbol}</span>
                      </div>
                    )}
                  </div>

                  {/* El total va DENTRO del cajón además de fuera: quien lo abre
                      para revisar las cuentas necesita ver la suma junto a los
                      sumandos, no acordarse del número de la pantalla anterior. */}
                  <div className="lg:hidden flex justify-between items-center text-indigo-900 font-bold text-base pt-3 mt-3 border-t border-indigo-100">
                    <span>Total</span>
                    <span>{convertPrice(subtotal + shipping + arancel)} {symbol}</span>
                  </div>
                </div>

                {/* Total siempre a la vista, con el cajón abierto o cerrado. */}
                <div className="flex justify-between items-center text-indigo-900 font-bold text-base sm:text-xl lg:text-2xl pt-3 sm:pt-4 lg:pt-6 lg:border-t lg:border-indigo-100 lg:mt-6">
                  <span>Total</span>
                  <span>
                    {convertPrice(
                      subtotal + shipping + arancel
                    )} {symbol}
                  </span>
                </div>

                {/* El simulador de cuotas se quitó de aquí el 4-ago. Estaba
                    también en la tarjeta del curso, en el resumen (que sale en
                    los tres pasos) y en el paso 3: cuatro apariciones de la
                    marca de seQura en una sola compra. Ahora solo en la tarjeta
                    del curso y en el paso 3, que son los dos momentos donde
                    aporta algo — decidir el tramo y elegir cómo pagar. */}
              </div>

              {/* Action Button — un poco más pequeño en móvil */}
              <button
                onClick={() => setStep(2)}
                disabled={cart.length === 0}
                className="w-full cursor-pointer max-w-md mx-auto bg-indigo-800 text-white font-bold text-base py-3 lg:text-lg lg:py-5 rounded-2xl hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}
