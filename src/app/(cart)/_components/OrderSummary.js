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

    return (
    <div className="w-full max-w-sm mx-auto bg-[#FFF5F3] rounded-[2.5rem] p-8 shadow-sm font-sans">
      
      <Link href="/">
        <div  className="flex flex-col items-center mb-4">
            <Image src="/LogotipoSquatfit.png" width={100} height={40} alt="Logo Squat Fit" />
        </div>
      </Link>

      <div className="flex justify-end mb-8">
        <button onClick={toggleCurrency} className="group cursor-pointer flex items-center gap-2 text-indigo-300 text-xs border-b border-indigo-200 pb-0.5 hover:text-indigo-600 transition-colors">
          <span className="mt-1">Cambiar moneda</span>
          <div className="w-6 h-6 rounded-full border-2 border-indigo-900 flex items-center justify-center text-indigo-900 font-bold">
            {currency === 'EUR' ? <Euro size={14} strokeWidth={3} /> : <DollarSign size={14} strokeWidth={3} />}
          </div>
        </button>
      </div>

      <div className="space-y-4 mb-10 max-h-64 overflow-y-auto pr-2">
        {cart.map((item) => (
          <div 
            key={item.id} 
            className="bg-[#FFFDFC] p-3 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]"
          >
            <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
              <Image 
                src={item.image} 
                alt={item.name} 
                layout="fill"
                className="object-contain" 
              />
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-orange-500 font-bold text-sm leading-tight mb-1">
                {item.name}
              </h4>
              <div className="flex justify-between items-end">
                <span className="text-indigo-900 text-sm font-medium">
                  {item.quantity} ud.
                </span>
                <span className="text-indigo-900 font-bold text-sm">
                  {convertPrice(item.price * item.quantity)} {currency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-8 px-2">
        <div className="flex justify-between items-center text-indigo-900">
          <span className="text-lg font-medium">Envío</span>
          <span className="text-lg font-medium">{convertPrice(finalShipping)} {currency}</span>
        </div>
        <div className="flex justify-between items-center text-indigo-900 font-bold text-xl">
          <span>Total</span>
          <span>{convertPrice(total)} {currency}</span>
        </div>
      </div>

      <button 
        onClick={triggerCheckoutFormSubmit} 
        disabled={!isFormValid || !isFormDirty}
        className="w-full bg-[#3b4097] text-white cursor-pointer font-bold py-4 rounded-2xl hover:bg-[#2f337a] transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </button>

    </div>
  );
}