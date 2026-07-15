'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, X, RotateCcw } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'

// Carrito como pop-up: aquí SOLO se ve y se edita (cantidades, borrar).
// Pagar sigue siendo la página /cart, porque Stripe redirige de vuelta con
// una recarga completa y un drawer (estado en memoria) no sobreviviría.
export default function CartDrawer() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { isCartOpen, closeCart } = useUiStore()
  const { cart, addToCart, decrementQuantity, removeFromCart, lastRemoved, undoRemove, clearLastRemoved } = useCartStore()

  useEffect(() => { setIsClient(true) }, [])

  // El aviso de "deshacer" solo vive mientras el carrito está abierto.
  useEffect(() => {
    if (!isCartOpen) clearLastRemoved()
  }, [isCartOpen, clearLastRemoved])

  // El botón atrás del móvil cierra el carrito en vez de salir de la página.
  useEffect(() => {
    if (!isCartOpen) return
    window.history.pushState({ sqfCartOpen: true }, '')
    const onPop = () => closeCart()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [isCartOpen, closeCart])

  // Escape cierra, y el fondo no scrollea mientras está abierto.
  useEffect(() => {
    if (!isCartOpen) return
    const onKey = (e) => { if (e.key === 'Escape') requestClose() }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isCartOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cerrar consumiendo la entrada de historial que añadimos al abrir.
  const requestClose = () => {
    if (window.history.state?.sqfCartOpen) window.history.back()
    else closeCart()
  }

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const irAPagar = () => {
    closeCart()
    router.push('/cart?step=2')
  }

  if (!isClient) return null

  const overlay = (
    <div
      className={`fixed inset-0 z-[100] ${isCartOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isCartOpen}
    >
      {/* Fondo */}
      <div
        onClick={requestClose}
        className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panel. En móvil deja asomar la página por la izquierda (como el menú),
          en vez de taparla entera. En escritorio el 86% supera el tope de
          420px, así que ahí no cambia nada. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        className={`absolute right-0 top-0 h-full w-[86%] max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-secondary text-xl font-extrabold">
            Tu carrito{totalItems > 0 && <span className="text-slate-400 font-semibold"> ({totalItems})</span>}
          </h2>
          <button onClick={requestClose} aria-label="Cerrar carrito" className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Aviso de deshacer: aparece al eliminar y se mantiene mientras el
            carrito esté abierto (o hasta pulsar Deshacer). */}
        {lastRemoved && (
          <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-secondary/5 border-b border-secondary/10">
            <span className="text-sm text-slate-600 min-w-0 truncate">
              «{lastRemoved.item.name}» eliminado
            </span>
            <button
              onClick={undoRemove}
              className="shrink-0 inline-flex items-center gap-1.5 text-secondary font-bold text-sm hover:underline active:scale-95 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Deshacer
            </button>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <p className="text-slate-500">Tu carrito está vacío.</p>
            <button
              onClick={() => { closeCart(); router.push('/cocina') }}
              className="bg-secondary text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-50">
                    <Image src={item.image || '/LibrosFisicos.png'} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-primary font-bold text-sm">€{item.price.toFixed(2).replace('.', ',')}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        aria-label={`Quitar una unidad de ${item.name}`}
                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.quantity >= 9}
                        aria-label={`Añadir una unidad de ${item.name}`}
                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Eliminar ${item.name}`}
                    className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-slate-100 px-5 py-4 flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-secondary text-xl font-extrabold">€{subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className="text-slate-400 text-xs">Los gastos de envío se calculan al finalizar.</p>
              <button
                onClick={irAPagar}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
              >
                Finalizar compra
              </button>
              <button
                onClick={requestClose}
                className="w-full text-slate-500 font-semibold py-1 hover:text-slate-700 transition cursor-pointer"
              >
                Seguir comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )

  return createPortal(overlay, document.body)
}
