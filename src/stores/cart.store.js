'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { enviarAddToCart } from '@/app/components/ga4Ecommerce'

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
        
        // Aquí se vaciaba el carrito si dentro había algún `isDirectCheckout`.
        //
        // No era un capricho: el checkout resolvía UN producto y el resto se
        // perdía, así que vaciarlo era la forma de que el cliente no pagara
        // creyendo que se llevaba dos cosas. El coste era el ticket medio —
        // añadir un libro te borraba el curso, y nadie hace dos compras
        // seguidas por gusto.
        //
        // Ya no hace falta: el backend cobra varias líneas en una sola sesión
        // de Stripe y el webhook concede todas (ver `resolveProducts` y
        // `concederRestoDelCarrito`). Si algún día se revierte aquello, esto
        // tiene que volver: sin ello se cobraría de menos.

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

        // Medición GA4: se emite aquí, en el store, y no en cada botón, porque
        // por aquí pasan TODOS los caminos que meten algo en el carrito. Si no
        // hay consentimiento de analítica, `enviarAddToCart` no hace nada.
        enviarAddToCart(product)
      },

      // Compra directa: el artículo trae sus propias instrucciones de checkout.
      //
      // SUSTITUYE el carrito a propósito, y esto sí se queda: es el camino de
      // «Comprarlo» desde la ficha de un curso, donde el cliente eligió UN
      // tramo concreto. Cambiar de mensual a anual tiene que reemplazar, no
      // acumular las dos suscripciones del mismo curso.
      //
      // Para añadir sin reemplazar está `addToCart`, que desde el carrito
      // mixto ya convive con los directos.
      setDirectCheckoutItem: (product) => {
        set({ cart: [{ ...product, quantity: 1, isDirectCheckout: true }] })
        // La compra directa (suscripciones) salta el carrito visible, pero
        // para el embudo es exactamente lo mismo: el cliente eligió producto.
        enviarAddToCart(product)
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
      // Si la cantidad es 1, elimina el producto del carrito (y guarda el
      // borrado para poder deshacerlo, igual que con el botón de la papelera).
      decrementQuantity: (productId) => {
        const cart = get().cart
        const index = cart.findIndex((item) => item.id === productId)
        if (index === -1) return
        const productInCart = cart[index]

        if (productInCart.quantity > 1) {
          const updatedCart = cart.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          set({ cart: updatedCart })
        } else {
          // Última unidad: es un borrado → deshacible.
          set({
            cart: cart.filter((item) => item.id !== productId),
            lastRemoved: { item: productInCart, index },
          })
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
