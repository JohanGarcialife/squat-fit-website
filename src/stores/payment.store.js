'use client';

import { create } from 'zustand';

export const usePaymentStore = create((set) => ({
  // Se podría inicializar con 'card' o dejarlo vacío para que el usuario elija.
  selectedMethod: 'card', 
  
  // Acción para actualizar el método de pago seleccionado
  setSelectedMethod: (method) => set({ selectedMethod: method }),

  // Aquí se podrían añadir más estados relacionados al pago en el futuro,
  // como el estado del procesamiento, errores, etc.
}));
