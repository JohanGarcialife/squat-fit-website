'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cart.store';

export default function Payment(props) {
  const { setStep, setSuccess } = props;
  const { cart } = useCartStore();
  
  // State for UI toggles
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [showMoreMethods, setShowMoreMethods] = useState(false);

  // Mock calculation for totals (OrderSummary will handle its own logic, 
  // but we pass necessary props if needed or it gets them from store)
  // For this step, OrderSummary is self-contained via store.

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      
      {/* Columna Izquierda: Métodos de Pago y Formulario (aprox 60%) */}
      <div className="w-full lg:w-3/5 xl:w-1/2 p-6 lg:p-14 lg:pl-40 min-h-screen bg-white">
        
        {/* Header */}
        <div className="mb-10">
            <span className="text-indigo-900 text-lg font-medium">Paso 3 de 3</span>
            <div onClick={() => setStep(2)} className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 group">
                <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                <h1 className="text-3xl md:text-4xl font-bold">Pago</h1>
            </div>
        </div>

        {/* Métodos de Pago */}
        <div className="mb-12">
            <h2 className="text-indigo-900 font-bold text-lg mb-4">Métodos de pago</h2>
            
            <div className="space-y-4">
                {/* Opción Tarjeta */}
                <PaymentOption 
                    id="card" 
                    label="Pago con Tarjeta" 
                    selected={selectedMethod === 'card'} 
                    onSelect={() => setSelectedMethod('card')} 
                />
                
                {/* Opción Apple/Google Pay */}
                <PaymentOption 
                    id="wallets" 
                    label="Apple Pay / Google Pay" 
                    selected={selectedMethod === 'wallets'} 
                    onSelect={() => setSelectedMethod('wallets')} 
                />
                
                {/* Opción Klarna */}
                <PaymentOption 
                    id="klarna" 
                    label="Klarna" 
                    selected={selectedMethod === 'klarna'} 
                    onSelect={() => setSelectedMethod('klarna')} 
                />
                
                {/* Más métodos toggle */}
                <div 
                    onClick={() => setShowMoreMethods(!showMoreMethods)}
                    className="flex items-center gap-2 text-orange-500 font-bold cursor-pointer hover:underline mt-4"
                >
                    <span>Más métodos de pago</span>
                    {showMoreMethods ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {/* Métodos adicionales */}
                {showMoreMethods && (
                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        <PaymentOption 
                            id="paypal" 
                            label="Pago con PayPal" 
                            selected={selectedMethod === 'paypal'} 
                            onSelect={() => setSelectedMethod('paypal')} 
                        />
                        <PaymentOption 
                            id="transfer" 
                            label="Transferencia bancaria" 
                            selected={selectedMethod === 'transfer'} 
                            onSelect={() => setSelectedMethod('transfer')} 
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Formulario de Tarjeta (Solo visible si 'card' está seleccionado) */}
        {selectedMethod === 'card' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-6 max-w-md">
                    <MockInput label="Número de tarjeta*" placeholder="1234 1234 1234 1234" />
                    <div className="flex gap-6">
                        <MockInput label="Caducidad*" placeholder="mm / aa" />
                        <MockInput label="Código*" placeholder="CVC" />
                    </div>
                </div>

                {/* Logos de seguridad */}
                <div className="mt-10 opacity-80">
                    <div className="relative w-48 h-12">
                         {/* Placeholder for "Pago Seguro Stripe" logos */}
                         {/* Using a simple text representation or local image if available. 
                             Based on user prompt, mocking layout first. 
                             Reference image shows a specific stripe logo block. */}
                         <div className="flex items-center gap-2 border border-gray-200 rounded p-2 bg-gray-50 text-xs text-gray-500">
                            <span>PAGO SEGURO</span>
                            <span className="font-bold">Stripe</span>
                            <div className="flex gap-1">
                                <span className="bg-blue-900 text-white px-1 font-bold text-[8px] rounded">VISA</span>
                                <span className="bg-red-600 text-white px-1 font-bold text-[8px] rounded">MC</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {/* Columna Derecha: Resumen (aprox 40%, fondo Peach) */}
      <div className="w-full lg:w-2/5 xl:w-1/2 min-h-screen bg-[#FFF5F3]">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {/* Reutilizamos OrderSummary pero pasando la función para "Continuar" que en este paso sería "Pagar" theoretically */}
          {/* Note: In real implementation, this button would trigger Stripe payment. 
              Here visually it will just match the design "Continuar" */}
          <OrderSummary 
             triggerCheckoutFormSubmit={() => {
                 // Mock success action
                 // En el futuro aquí irá la lógica de stripe.confirmPayment
                 console.log("Processing payment visual mock...");
                 setSuccess(true); // Simulate success for now if user clicks
             }}
             isFormValid={true} // Always valid for visual mock
             isFormDirty={true}
          />
        </div>
      </div>
    </div>
  );
}

// Subcomponente para Opciones de Pago (Radio Buttons personalizados)
function PaymentOption({ id, label, selected, onSelect }) {
    return (
        <div 
            onClick={onSelect}
            className="flex items-center gap-3 cursor-pointer group"
        >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected ? 'border-orange-500 bg-orange-500' : 'border-orange-300 bg-white group-hover:border-orange-400'
            }`}>
                {selected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
            </div>
            <span className={`text-lg ${selected ? 'text-orange-500 font-medium' : 'text-orange-400'}`}>
                {label}
            </span>
        </div>
    )
}

// Subcomponente para Inputs Mock (Estilo naranja redondeado)
function MockInput({ label, placeholder }) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-orange-500 text-sm ml-1">{label}</label>
            <input 
                type="text" 
                placeholder={placeholder}
                className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-300 text-indigo-900 text-lg font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-white"
            />
        </div>
    )
}
