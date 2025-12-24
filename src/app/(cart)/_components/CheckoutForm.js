'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Check } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkout.store';

export default function CheckoutForm() {
  const { formData, updateFormData } = useCheckoutStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  // Estado local para UI, no necesita estar en el store global por ahora
  const [customerType, setCustomerType] = useState('particular');
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

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCustomerType('particular')}
            className={`px-6 py-2 rounded-full font-bold transition-all border cursor-pointer ${
              customerType === 'particular' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-300 hover:border-orange-500'
            }`}
          >
            Particular
          </button>
          <button
            onClick={() => setCustomerType('empresa')}
            className={`px-6 py-2 rounded-full font-bold transition-all border ${
              customerType === 'empresa' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-300 hover:border-orange-500'
            }`}
          >
            Empresa
          </button>
        </div>

        {/* --- Formulario --- */}
        <form className="space-y-5">
          
          <InputField label="DNI/CIF (opcional)" placeholder="Número de Identificación" name="dni_cif" value={formData.dni_cif} onChange={handleChange} />
          <InputField label="Nombre*" placeholder="Tu nombre" name="firstName" value={formData.firstName} onChange={handleChange} />
          <InputField label="Apellidos*" placeholder="Tus apellidos" name="lastName" value={formData.lastName} onChange={handleChange} />
          
          <div className="h-2"></div>

          <InputField label="Dirección*" placeholder="Introduce tu calle y número" name="address" value={formData.address} onChange={handleChange} />
          <InputField label="Piso / puerta (opcional)" placeholder="Piso, puerta, etc." name="apartment" value={formData.apartment} onChange={handleChange} />
          <InputField label="Código postal*" placeholder="XXXXX" name="postalCode" value={formData.postalCode} onChange={handleChange} />
          <InputField label="Ciudad*" placeholder="Tu ciudad" name="city" value={formData.city} onChange={handleChange} />
          
          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">País*</label>
            <div className="relative">
              <select name="country" value={formData.country} onChange={handleChange} className="w-full appearance-none bg-white border border-orange-300 rounded-2xl px-5 py-3 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer">
                <option value="ES">España</option>
                <option value="MX">México</option>
                <option value="CO">Colombia</option>
                <option value="US">United States</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <div className="h-4"></div>

          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">Teléfono*</label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center gap-1 w-24 border border-white rounded-2xl px-3 py-3 text-orange-500 font-medium">
                <span>🇪🇸</span><span>+34</span>
              </div>
              <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Tu teléfono" className="flex-1 border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
            </div>
          </div>

          <InputField label="e-mail*" placeholder="Tu correo electrónico" type="email" name="email" value={formData.email} onChange={handleChange} />
          
          <div className="flex items-center gap-3 cursor-pointer mt-2" onClick={() => setSameAddress(!sameAddress)}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${sameAddress ? 'bg-orange-500' : 'border border-orange-300'}`}>
              {sameAddress && <Check size={16} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-orange-500">Usar la misma dirección para Envío</span>
          </div>

          <div className="h-2"></div>
          
          <div className="flex flex-col gap-1">
            <label className="text-orange-500 text-sm ml-1">Notas del envío (opcional)</label>
            <textarea name="shippingNotes" value={formData.shippingNotes} onChange={handleChange} rows={4} placeholder="Escribe aquí..." className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
          </div>

        </form>
      </div>
    </div>
  );
}

function InputField({ label, placeholder, type = "text", name, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-orange-500 text-sm ml-1">{label}</label>
      <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
    </div>
  );
}