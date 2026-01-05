import React from 'react'
import { ChevronLeft, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

export default function Summary(props) {
    const {
        cart,
        totalItems,
        subtotal,
        shipping,
        total,
        freeShippingThreshold,
        remainingForFreeShipping,
        addToCart,
        decrementQuantity,
        removeFromCart,
        setStep
    } = props;

  return (
     <div className="min-h-screen bg-white flex flex-row justify-between font-sans">
        <>
          {/* Columna Izquierda: Lista de Productos */}
          <div className="w-1/2 space-y-6 min-h-screen py-14 px-40 ">
            <div>
            <span className="text-secondary text-2xl  mb-10">Paso 1 de 3</span>
            <Link
              href="/cocina"
              className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 hover:text-indigo-700">
              <ChevronLeft size={24} />
              <h1 className="text-3xl font-bold">Carrito ({totalItems})</h1>
            </Link>
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-shadow hover:shadow-md">
                <div className="relative w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    layout="fill"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                  <h3 className="text-orange-500 font-bold text-lg leading-tight mb-4">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                          <button onClick={() => decrementQuantity(item.id)} className="bg-indigo-900 text-white p-2 cursor-pointer rounded-md hover:bg-indigo-800 transition-colors">
                              <Minus size={16} />
                          </button>
                          <span className="px-2 font-medium text-indigo-900">{item.quantity} ud.</span>
                          <button onClick={() => addToCart(item)} className="bg-indigo-900 text-white p-2 cursor-pointer rounded-md hover:bg-indigo-800 transition-colors">
                              <Plus size={16} />
                          </button>
                      </div>
                      {/* Remove Button */}
                      <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={20} />
                      </button>
                  </div>                </div>
                <div className="flex flex-col justify-end h-full mt-4 sm:mt-0">
                  <span className="text-indigo-900 font-bold whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(2).replace(".", ",")}{" "}
                    EUR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Resumen */}
        <div className="w-1/2 min-h-screen ">
          <div className="bg-[#FFF5F3] w-full min-h-screen sticky top-10">
            <div className="py-14 px-40 ">
              <div className="flex flex-col items-center mb-6">
                <Image
                  src="/LogotipoSquatfit.png"
                  width={120}
                  height={50}
                  alt="Logo Squat Fit"
                />
              </div>
              <div className="flex justify-end mb-8">
                <button className="flex items-center gap-1 text-indigo-400 text-sm border-b border-indigo-200 pb-0.5 hover:text-indigo-600">
                  Cambiar moneda
                  <div className="border-2 border-indigo-900 rounded-full w-6 h-6 flex items-center justify-center text-indigo-900 font-bold text-xs">
                    €
                  </div>
                </button>
              </div>
              <div className="text-center mb-8">
                {remainingForFreeShipping > 0 ? (
                  <p className="text-indigo-900 text-sm">
                    *Añade{" "}
                    <span className="font-bold">
                      {remainingForFreeShipping.toFixed(2).replace(".", ",")} €
                    </span>{" "}
                    para tener envío{" "}
                    <span className="text-orange-400 font-bold">gratis</span>
                  </p>
                ) : (
                  <p className="text-green-600 text-sm font-bold">
                    ¡Tienes envío gratis!
                  </p>
                )}
              </div>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-indigo-900">
                  <span className="text-lg">Envío</span>
                  <span className="text-lg">
                    {subtotal >= freeShippingThreshold
                      ? "0,00"
                      : shipping.toFixed(2).replace(".", ",")}{" "}
                    EUR
                  </span>
                </div>
                <div className="flex justify-between items-center text-indigo-900 font-bold text-xl">
                  <span>Total</span>
                  <span>
                    {(
                      subtotal +
                      (subtotal >= freeShippingThreshold ? 0 : shipping)
                    )
                      .toFixed(2)
                      .replace(".", ",")}{" "}
                    EUR
                  </span>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full cursor-pointer bg-indigo-800 text-white font-bold py-4 rounded-xl hover:bg-indigo-900 transition-colors shadow-lg shadow-indigo-200">
                Continuar
              </button>
            </div>
          </div>
        </div>
      </>
    </div>
  )
}
