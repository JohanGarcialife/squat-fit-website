'use client';

import React, { useState, useEffect } from 'react';
import { Euro, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart.store';

export default function OrderSummary(props) {
    const { isFormValid, isFormDirty, triggerCheckoutFormSubmit } = props;
    const { cart } = useCartStore();

    const [currency, setCurrency] = useState('EUR');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD');
                const data = await response.json();
                setExchangeRate(data.rates.USD);
            } catch (error) {
                console.error("Failed to fetch exchange rate:", error);
                // Fallback rate in case of API failure
                setExchangeRate(1.08); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchExchangeRate();
    }, []);

    const toggleCurrency = () => {
        setCurrency((prev) => (prev === 'EUR' ? 'USD' : 'EUR'));
    };
    
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = 4.99; // in EUR
    const freeShippingThreshold = 90.00; // in EUR
    
    const finalShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
    const total = subtotal + finalShipping;

    const convertPrice = (priceInEur) => {
        if (isLoading || !exchangeRate) {
            return '...';
        }
        if (currency === 'USD') {
            return (priceInEur * exchangeRate).toFixed(2).replace('.', ',');
        }
        return priceInEur.toFixed(2).replace('.', ',');
    };

    // Recurring Payment Logic
    const monthlyItems = cart.filter(item => item.period === '/mes');
    const recurringTotal = monthlyItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    
    // Today's total includes everything (monthly first payment + others)
    // Assuming 'total' calculated above is correct for the first payment.
    
    const hasRecurring = recurringTotal > 0;

    return (
    <div className="w-full h-full p-8 lg:p-14 xl:p-20 font-sans flex flex-col justify-center">
      
      {/* Logo & Header */}
      <div className="flex flex-col items-center mb-8">
         <Link href="/" className="mb-4">
            <div className="w-20 h-20 relative">
                 <Image src="/LogotipoSquatfit.png" layout="fill" objectFit="contain" alt="Logo Squat Fit" />
            </div>
         </Link>
         
         <button onClick={toggleCurrency} className="flex items-center gap-2 text-indigo-400 text-sm border-b border-indigo-200 pb-0.5 hover:text-indigo-600 transition-colors">
            Cambiar moneda
            <div className="border-2 border-indigo-900 rounded-full w-7 h-7 flex items-center justify-center text-indigo-900 font-bold text-sm">
                {currency === 'EUR' ? '€' : '$'}
            </div>
        </button>
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
                 {item.description || (item.type === 'digital' ? 'Suscripción online' : 'Volumen en papel')}
              </p>
              
              <div className="flex justify-between items-end">
                <span className="text-indigo-900 text-xs font-semibold bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {item.type === 'digital' ? item.period?.replace('/', '') || 'mes' : `${item.quantity || 1} unidad`}
                </span>
                <span className="text-indigo-900 font-bold text-sm">
                  {convertPrice(item.price * (item.quantity || 1))} {currency === 'EUR' ? '€' : '$'}
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
                    {convertPrice(total)} {currency === 'EUR' ? '€' : '$'}
                </span>
            </div>
            
            {hasRecurring && (
                <div className="flex justify-between items-center text-indigo-900 font-bold text-lg pt-2 border-t border-indigo-100/50">
                    <span>Los siguientes meses</span>
                    <span>
                        {convertPrice(recurringTotal)} {currency === 'EUR' ? '€' : '$'}
                    </span>
                </div>
            )}
        </div>
      </div>

      <button 
        onClick={triggerCheckoutFormSubmit} 
        disabled={!isFormValid}
        className="w-full bg-indigo-800 text-white cursor-pointer font-bold text-lg py-4 rounded-2xl hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </button>

    </div>
  );
}