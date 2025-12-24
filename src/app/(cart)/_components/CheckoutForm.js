'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Check } from 'lucide-react';

export default function CheckoutForm() {
  // Estado para el tipo de cliente (Particular vs Empresa)
  const [customerType, setCustomerType] = useState('particular');
  
  // Estado para el checkbox de envío
  const [sameAddress, setSameAddress] = useState(true);

  return (
    <div className="min-h-screen bg-white flex justify-center py-10 px-4 font-sans">
      <div className="w-full max-w-lg">
        
        {/* --- Header --- */}
        <div className="mb-8">
          <span className="text-slate-500 text-sm font-medium">Paso 2 de 3</span>
          <div className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 hover:text-indigo-700 transition-colors">
            <ChevronLeft size={24} />
            <h1 className="text-3xl font-bold">Mis datos</h1>
          </div>
        </div>

        {/* --- Dirección de Facturación --- */}
        <h2 className="text-indigo-900 font-bold text-lg mb-4">Dirección de facturación</h2>

        {/* Toggle: Particular / Empresa */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCustomerType('particular')}
            className={`px-6 py-2 rounded-full font-bold transition-all border cursor-pointer ${
              customerType === 'particular'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-orange-500 border-orange-300 hover:border-orange-500'
            }`}
          >
            Particular
          </button>
          <button
            onClick={() => setCustomerType('empresa')}
            className={`px-6 py-2 rounded-full font-bold transition-all border ${
              customerType === 'empresa'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-orange-500 border-orange-300 hover:border-orange-500'
            }`}
          >
            Empresa
          </button>
        </div>

        {/* --- Formulario --- */}
        <form className="space-y-5">
          
          {/* DNI/CIF */}
          <InputField 
            label="DNI/CIF (opcional)" 
            placeholder="Número de Identificación" 
          />

          {/* Nombre */}
          <InputField 
            label="Nombre*" 
            placeholder="Tu nombre" 
          />

          {/* Apellidos */}
          <InputField 
            label="Apellidos*" 
            placeholder="Tus apellidos" 
          />

          {/* Separador visual (opcional, por el espacio en la imagen) */}
          <div className="h-2"></div>

          {/* Dirección */}
          <InputField 
            label="Dirección*" 
            placeholder="Introduce tu calle y número" 
          />

          {/* Piso / Puerta */}
          <InputField 
            label="Piso / puerta (opcional)" 
            placeholder="Piso, puerta, etc." 
          />

          {/* Código Postal */}
          <InputField 
            label="Código postal*" 
            placeholder="XXXXX" 
          />

          {/* Ciudad */}
          <InputField 
            label="Ciudad*" 
            placeholder="Tu ciudad" 
          />

          {/* País (Select customizado) */}
          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">País*</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-orange-300 rounded-2xl px-5 py-3 text-orange-300 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer">
                <option>Seleccionar país</option>
                <option>España</option>
                <option>México</option>
                <option>Colombia</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <div className="h-4"></div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">Teléfono*</label>
            <div className="flex gap-3">
              {/* Prefijo (Simulado) */}
              <div className="flex items-center justify-center gap-1 w-24 border border-white rounded-2xl px-3 py-3 text-orange-500 font-medium">
                <span>🇪🇸</span>
                <span>+34</span>
              </div>
              {/* Input */}
              <input 
                type="tel"
                placeholder="Tu teléfono"
                className="flex-1 border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          {/* E-mail */}
          <InputField 
            label="e-mail*" 
            placeholder="Tu correo electrónico" 
            type="email"
          />

          {/* Checkbox "Usar la misma dirección" */}
          <div 
            className="flex items-center gap-3 cursor-pointer mt-2"
            onClick={() => setSameAddress(!sameAddress)}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${sameAddress ? 'bg-orange-500' : 'border border-orange-300'}`}>
              {sameAddress && <Check size={16} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-orange-500">Usar la misma dirección para Envío</span>
          </div>

          <div className="h-2"></div>

          {/* Notas del envío */}
          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">Notas del envío (opcional)</label>
            <textarea 
              rows={4}
              placeholder="Escribe aquí..."
              className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
            />
          </div>

        </form>
      </div>
    </div>
  );
}

// Componente auxiliar reutilizable para los inputs estándar
function InputField({ label, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-orange-500 text-sm ml-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
      />
    </div>
  );
}