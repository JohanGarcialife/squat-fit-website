import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

export default function Summary(props) {
    const {
        cart,
        totalItems,
        subtotal,
        shipping,
        total,
        freeShippingThreshold,
        remainingForFreeShipping,
        addToCart,
        decrementQuantity,
        removeFromCart,
        setStep    } = props;

    // Currency State
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
                setExchangeRate(1.08); // Fallback
            } finally {
                setIsLoading(false);
            }
        };

        fetchExchangeRate();
    }, []);

    const toggleCurrency = () => {
        setCurrency((prev) => (prev === 'EUR' ? 'USD' : 'EUR'));
    };

    const convertPrice = (priceInEur) => {
        if (isLoading || !exchangeRate) return '...';
        if (currency === 'USD') {
            return (priceInEur * exchangeRate).toFixed(2).replace('.', ',');
        }
        return priceInEur.toFixed(2).replace('.', ',');
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
        // We preserve image and generic type, but update ID, Name, Price, Period
        const newItem = {
            ...currentItem,
            id: newVariant.id,
            name: newVariant.name,
            price: newVariant.price,
            period: newVariant.period,
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
          <div className="w-full lg:w-3/5 xl:w-1/2 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
            <div className="mb-10">
                <span className="text-indigo-900 text-lg font-medium">Paso 1 de 3</span>
                <Link
                href="/cocina"
                className="flex items-center gap-2 mt-4 cursor-pointer text-indigo-900 group">
                <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                <h1 className="text-3xl md:text-4xl font-bold">Carrito ({totalItems})</h1>
                </Link>
            </div>

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
                        src={item.image}
                        alt={item.name}
                        layout="fill"
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
                            {isDigital(item) ? 'Cocina Squat Fit Digital' : item.name}
                        </h3>
                        {/* Subtitle / Description based on reference */}
                        <p className="text-indigo-400 text-sm mb-6">
                            {isDigital(item) ? 'Suscripción online' : item.description || 'Volumen físico'}
                        </p>

                        <div className="flex items-center justify-between w-full mt-auto">
                            {/* Quantity or Period Selector */}
                            <div className="flex flex-col items-center sm:items-start gap-1">
                                <span className="text-indigo-900 text-xs font-bold uppercase tracking-wider">
                                    {isDigital(item) ? 'Período' : 'Cantidad'}
                                </span>
                                
                                {isDigital(item) ? (
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
                                    /* Physical Item: Quantity Selector */
                                    <div className="relative group">
                                         <div className="bg-indigo-900 text-white pl-4 pr-10 py-2 rounded-lg font-medium text-sm flex items-center min-w-[80px] cursor-pointer">
                                            {item.quantity}
                                        </div>
                                         <div className="absolute top-full left-0 w-full bg-white border border-indigo-100 rounded-lg shadow-lg hidden group-hover:block z-10 overflow-hidden">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <button 
                                                    key={num}
                                                    onClick={() => num > item.quantity ? addToCart({...item, quantity: num - item.quantity}) : decrementQuantity(item.id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-900 text-sm"
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 text-sm border-t border-gray-100"
                                            >
                                                Eliminar
                                            </button>
                                         </div>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                <span className="text-indigo-900 font-bold text-xl">
                                    {convertPrice(item.price * (item.quantity || 1))} {currency === 'EUR' ? '€' : '$'}
                                </span>
                                {isDigital(item) && <span className="text-indigo-400 text-xs block">
                                    {digitalVariants.find(v => v.id === item.id)?.period || '/mes'}
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

        {/* Columna Derecha: Resumen */}
        <div className="w-full lg:w-2/5 xl:w-1/2 min-h-screen bg-[#FFF5F3]">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <div className="py-14 px-8 lg:px-20 xl:px-32 flex flex-col h-full justify-center">
              
              {/* Logo */}
              <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 relative mb-4">
                     <Image
                        src="/LogotipoSquatfit.png" // Placeholder or existing logo
                        layout="fill"
                        objectFit="contain"
                        alt="Logo Squat Fit"
                     />
                </div>
                
                 {/* Currency Switcher */}
                <button onClick={toggleCurrency} className="flex items-center gap-2 text-indigo-400 text-sm border-b border-indigo-200 pb-0.5 hover:text-indigo-600 transition-colors">
                  Cambiar moneda
                  <div className="border-2 border-indigo-900 rounded-full w-7 h-7 flex items-center justify-center text-indigo-900 font-bold text-sm">
                    {currency === 'EUR' ? '€' : '$'}
                  </div>
                </button>
              </div>

              {/* Free Shipping Message */}
              <div className="text-center mb-12">
                {remainingForFreeShipping > 0 ? (
                  <p className="text-indigo-900 text-lg">
                    *Añade <span className="font-bold">{convertPrice(remainingForFreeShipping)} {currency === 'EUR' ? '€' : '$'}</span> para tener envío <span className="text-orange-500 font-bold">gratis</span>
                  </p>
                ) : (
                  <p className="text-green-600 text-lg font-bold">
                    ¡Tienes envío gratis!
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-6 mb-12 max-w-md mx-auto w-full">
                <div className="flex justify-between items-center text-indigo-900/80 text-xl">
                  <span>Subtotal</span>
                  <span>{convertPrice(subtotal)} {currency === 'EUR' ? '€' : '$'}</span>
                </div>
                <div className="flex justify-between items-center text-indigo-900/80 text-xl">
                  <span>Envío</span>
                  <span>
                    {subtotal >= freeShippingThreshold
                      ? "0,00"
                      : convertPrice(shipping)} {currency === 'EUR' ? '€' : '$'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-indigo-900 font-bold text-2xl pt-6 border-t border-indigo-100">
                  <span>Total</span>
                  <span>
                    {convertPrice(
                      subtotal +
                      (subtotal >= freeShippingThreshold ? 0 : shipping)
                    )} {currency === 'EUR' ? '€' : '$'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setStep(2)} 
                disabled={cart.length === 0}
                className="w-full cursor-pointer max-w-md mx-auto bg-indigo-800 text-white font-bold text-lg py-5 rounded-2xl hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}
