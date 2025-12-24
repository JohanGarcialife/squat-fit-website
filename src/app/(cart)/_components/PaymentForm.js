import React, { useState } from 'react';
import { ChevronLeft, ChevronUp } from 'lucide-react';

export default function PaymentForm() {
  const [method, setMethod] = useState('tarjeta');

  return (
    <div className="min-h-screen bg-white flex justify-center py-10 px-4 font-sans">
      <div className="w-full max-w-lg">
        
        {/* --- Encabezado --- */}
        <div className="mb-10">
          <span className="text-slate-500 text-sm font-medium">Paso 3 de 3</span>
          <div className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 hover:text-indigo-700 transition-colors">
            <ChevronLeft size={24} />
            <h1 className="text-3xl font-bold">Pago</h1>
          </div>
        </div>

        {/* --- Selección de Métodos --- */}
        <div className="space-y-4 mb-8">
          <h2 className="text-indigo-900 font-bold text-lg mb-4">Métodos de pago</h2>
          
          <PaymentOption 
            id="tarjeta" 
            label="Pago con Tarjeta" 
            selected={method === 'tarjeta'} 
            onClick={() => setMethod('tarjeta')} 
          />
          <PaymentOption 
            id="apple-google" 
            label="Apple Pay / Google Pay" 
            selected={method === 'apple-google'} 
            onClick={() => setMethod('apple-google')} 
          />
          <PaymentOption 
            id="klarna" 
            label="Klarna" 
            selected={method === 'klarna'} 
            onClick={() => setMethod('klarna')} 
          />

          {/* Sección Expandible */}
          <div className="pt-2">
            <button className="flex items-center gap-2 text-orange-500 font-bold border-b border-orange-500 pb-0.5 mb-4">
              Más métodos de pago <ChevronUp size={20} />
            </button>
            
            <div className="space-y-4">
              <PaymentOption 
                id="paypal" 
                label="Pago con PayPal" 
                selected={method === 'paypal'} 
                onClick={() => setMethod('paypal')} 
              />
              <PaymentOption 
                id="transferencia" 
                label="Transferencia bancaria" 
                selected={method === 'transferencia'} 
                onClick={() => setMethod('transferencia')} 
              />
            </div>
          </div>
        </div>

        {/* --- Formulario de Tarjeta --- */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">Número de tarjeta*</label>
            <input 
              type="text" 
              placeholder="1234 1234 1234 1234" 
              className="w-full border border-orange-300 rounded-2xl px-5 py-4 text-orange-500 font-bold placeholder-orange-300 outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-orange-500 text-sm ml-1">Caducidad*</label>
              <input 
                type="text" 
                placeholder="mm / aa" 
                className="w-full border border-orange-300 rounded-2xl px-5 py-4 text-orange-500 font-bold placeholder-orange-300 outline-none focus:border-orange-500 transition-all text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-orange-500 text-sm ml-1">Código*</label>
              <input 
                type="text" 
                placeholder="CVC" 
                className="w-full border border-orange-300 rounded-2xl px-5 py-4 text-orange-500 font-bold placeholder-orange-300 outline-none focus:border-orange-500 transition-all text-center"
              />
            </div>
          </div>
        </div>

        {/* --- Sellos de Confianza (Stripe / Visa) --- */}
        <div className="mt-16 flex flex-col items-center">
          <div className="border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3">
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pago Seguro</span>
             <div className="h-4 w-px bg-gray-200"></div>
             {/* Simulación de logos de tarjetas */}
             <div className="flex gap-2 items-center opacity-80 grayscale hover:grayscale-0 transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente para las opciones de pago (Radio buttons personalizados)
function PaymentOption({ id, label, selected, onClick }) {
  return (
    <div 
      className="flex items-center gap-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? 'border-orange-500 bg-orange-500' : 'border-orange-300 bg-white group-hover:border-orange-500'
      }`}>
        {selected && (
          <div className="w-2.5 h-2.5 bg-white rounded-full"></div> // Punto central si prefieres o el Check anterior
        )}
      </div>
      <span className={`font-bold transition-colors ${selected ? 'text-orange-500' : 'text-orange-400 group-hover:text-orange-500'}`}>
        {label}
      </span>
    </div>
  );
}