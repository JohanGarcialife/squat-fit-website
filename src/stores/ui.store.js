'use client'
import { create } from 'zustand'

// Estado de UI que no se persiste: si se guardara, el carrito aparecería
// abierto al volver a entrar en la web.
export const useUiStore = create((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
}))
