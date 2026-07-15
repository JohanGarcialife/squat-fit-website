'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Último producto eliminado, para poder deshacer mientras el carrito
      // esté abierto. No se persiste (ver partialize), así no reaparece el
      // aviso al recargar.
      lastRemoved: null,

      // Añade un producto al carrito (Comportamiento clásico para Carrito global)
      // Si el producto ya existe, incrementa su cantidad.
      addToCart: (product) => {
        let currentCart = get().cart;
        
        // Evitar carritos mixtos: Si el carrito actual tiene alguna suscripción/producto directo,
        // vaciamos el carrito porque el usuario decidió agregar un producto físico que usa el checkout global.
        if (currentCart.some(item => item.isDirectCheckout)) {
            currentCart = [];
        }

        const productInCart = currentCart.find((item) => item.id === product.id)

        if (productInCart) {
          const updatedCart = currentCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: Math.min(9, item.quantity + 1) }
              : item
          )
          set({ cart: updatedCart })
        } else {
          set({ cart: [...currentCart, { ...product, quantity: 1 }] })
        }
      },

      // Opción de Compra Directa (Bypass de carrito para Suscripciones)
      // Limpia el carrito y añade solo este item con sus instrucciones de checkout exactas
      setDirectCheckoutItem: (product) => {
        set({ cart: [{ ...product, quantity: 1, isDirectCheckout: true }] })
      },

      // Elimina un producto del carrito por su ID.
      // Guarda el item y su posición para poder deshacer.
      removeFromCart: (productId) => {
        const cart = get().cart
        const index = cart.findIndex((item) => item.id === productId)
        if (index === -1) return
        set({
          cart: cart.filter((item) => item.id !== productId),
          lastRemoved: { item: cart[index], index },
        })
      },

      // Devuelve al carrito el último producto eliminado, en su posición.
      undoRemove: () => {
        const { lastRemoved, cart } = get()
        if (!lastRemoved) return
        // Si mientras tanto se volvió a añadir, solo limpiamos el aviso.
        if (cart.some((item) => item.id === lastRemoved.item.id)) {
          set({ lastRemoved: null })
          return
        }
        const restored = [...cart]
        restored.splice(Math.min(lastRemoved.index, restored.length), 0, lastRemoved.item)
        set({ cart: restored, lastRemoved: null })
      },

      // Descarta el aviso de deshacer (al cerrar el carrito, por ejemplo).
      clearLastRemoved: () => set({ lastRemoved: null }),

      // Decrementa la cantidad de un producto.
      // Si la cantidad es 1, elimina el producto del carrito.
      decrementQuantity: (productId) => {
        const cart = get().cart
        const productInCart = cart.find((item) => item.id === productId)

        if (productInCart && productInCart.quantity > 1) {
          const updatedCart = cart.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          set({ cart: updatedCart })
        } else {
          // Si la cantidad es 1 o el producto no se encuentra, lo elimina
          set({ cart: get().cart.filter((item) => item.id !== productId) })
        }
      },

      // Actualiza la cantidad de un producto directamente
      updateQuantity: (productId, quantity) => {
        const updatedCart = get().cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.min(9, Math.max(1, quantity)) }
            : item
        )
        set({ cart: updatedCart })
      },

      // Vacía completamente el carrito
      clearCart: () => {
        set({ cart: [] })
      },
    }),
    {
      name: 'cart-storage', // Nombre para el almacenamiento en localStorage
      // Solo persistimos el carrito; lastRemoved es efímero (sesión/pestaña).
      partialize: (state) => ({ cart: state.cart }),
    }
  )
)
