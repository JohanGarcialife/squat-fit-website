'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Valores iniciales del formulario
const initialState = {
  email: '',
  country: 'ES', // Valor por defecto
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  postalCode: '',
  phone: '',
  dni_cif: '',
  shippingNotes: '',
};

export const useCheckoutStore = create(
  persist(
    (set) => ({
      formData: initialState,

      // Acción para actualizar uno o más campos del formulario
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      // Acción para resetear el formulario a su estado inicial
      clearFormData: () => set({ formData: initialState }),
    }),
    {
      name: 'checkout-form-storage', // Nombre para el almacenamiento en localStorage
    }
  )
);
