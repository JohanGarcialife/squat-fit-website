'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart.store';
import { useCurrency } from './useCurrency';
import CurrencySelector from './CurrencySelector';

export default function OrderSummary(props) {
    const { isFormValid, isFormDirty, triggerCheckoutFormSubmit } = props;
    const { cart } = useCartStore();

    const { currency, setCurrency, symbol, convertPrice, currencies } = useCurrency();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Only apply shipping if the cart contains physical products (non-direct checkouts)
    const hasPhysicalItems = cart.some(item => !item.isDirectCheckout);
    const shippingCost = hasPhysicalItems ? 4.99 : 0; 
    const freeShippingThreshold = 90.00; // in EUR
    
    const finalShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
    const total = subtotal + finalShipping;

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
    <div className="w-full h-full p-6 lg:p-14 xl:p-20 font-sans flex flex-col justify-start lg:justify-center">

      {/* Logo (oculto en móvil para compactar) + selector de moneda (siempre
          visible: en móvil se quedaba escondido dentro del bloque del logo). */}
      <Link href="/" className="mb-4 hidden lg:block self-center">
        <div className="w-20 h-20 relative">
          <Image src="/LogotipoSquatfit.png" layout="fill" objectFit="contain" alt="Logo Squad Fit" />
        </div>
      </Link>
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

      {/* Payment Breakdown */}
      <div className="space-y-4 mb-8">
        {hasRecurring && (
            <div className="text-center mb-6">
                <p className="text-indigo-500 text-sm font-medium leading-relaxed">
                    Tu carrito incluye productos de<br/>
                    pago único y de suscripción
                </p>
            </div>
        )}

        <div className="space-y-2">
            <div className="flex justify-between items-center text-indigo-900/80 text-lg">
                <span>Hoy pagarás</span>
                <span className="font-bold text-indigo-900 text-xl">
                    {convertPrice(total)} {symbol}
                </span>
            </div>
            
            {hasRecurring && (
                <div className="flex justify-between items-center text-indigo-900 font-bold text-lg pt-2 border-t border-indigo-100/50">
                    <span>{recurringLabel}</span>
                    <span>
                        {convertPrice(recurringTotal)} {symbol}
                    </span>
                </div>
            )}
        </div>
      </div>

      <button
        onClick={triggerCheckoutFormSubmit}
        disabled={!isFormValid}
        className="w-full bg-indigo-800 text-white cursor-pointer font-bold text-base py-3 lg:text-lg lg:py-4 rounded-2xl hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </button>

    </div>
  );
}