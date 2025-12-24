'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Añade un producto al carrito.
      // Si el producto ya existe, incrementa su cantidad.
      addToCart: (product) => {
        const cart = get().cart
        const productInCart = cart.find((item) => item.id === product.id)

        if (productInCart) {
          const updatedCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
          set({ cart: updatedCart })
        } else {
          set({ cart: [...cart, { ...product, quantity: 1 }] })
        }
      },

      // Elimina un producto del carrito por su ID
      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((item) => item.id !== productId),
        })
      },

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
      
      // Vacía completamente el carrito
      clearCart: () => {
        set({ cart: [] })
      },
    }),
    {
      name: 'cart-storage', // Nombre para el almacenamiento en localStorage
    }
  )
)
