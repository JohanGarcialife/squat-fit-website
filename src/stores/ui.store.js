'use client'
import { create } from 'zustand'

// Estado de UI que no se persiste: si se guardara, el carrito aparecería
// abierto al volver a entrar en la web.
//
// El carrito tiene 3 estados:
//  - cerrado
//  - "asomado" (peek): al añadir un producto el panel se asoma un poco como
//    sugerencia. Un clic en él lo abre entero; un clic fuera lo retira.
//  - abierto del todo
export const useUiStore = create((set) => ({
  isCartOpen: false,
  isCartPeeking: false,
  openCart: () => set({ isCartOpen: true, isCartPeeking: false }),
  closeCart: () => set({ isCartOpen: false }),
  peekCart: () => set({ isCartPeeking: true }),
  closePeek: () => set({ isCartPeeking: false }),
}))
