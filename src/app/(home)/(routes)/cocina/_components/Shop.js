'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'
import { BookOpen, FileText } from 'lucide-react'

export default function Shop() {
  const { addToCart } = useCartStore()
  
  // State to track selected products
  const [selectedDigital, setSelectedDigital] = useState('digital-annual') // Default to annual
  const [selectedPhysical, setSelectedPhysical] = useState('book-pack') // Default to pack
  
  // Digital Library Products
  const digitalProducts = [
    {
      id: 'digital-monthly',
      name: 'Mensual',
      price: 9.99,
      period: '/mes',
      description: 'Acceso completo a la biblioteca sin permanencia',
      type: 'digital',
      badge: null,
      recommended: false,
      features: [
        'Acceso completo a la biblioteca digital',
        'Todas las recetas de Vol. 1 y 2',
        'Contenido actualizado regularmente',
        'Sin compromiso de permanencia'
      ]
    },
    {
      id: 'digital-annual',
      name: 'Anual',
      price: 89.99,
      period: '/año',
      description: 'El más rentable si vas a usarlo de verdad',
      type: 'digital',
      badge: 'Recomendado',
      recommended: true,
      features: [
        'Acceso completo a la biblioteca digital',
        'Todas las recetas de Vol. 1 y 2',
        'Contenido actualizado regularmente',
        'Ahorra más de 30€ vs mensual'
      ]
    },
    {
      id: 'digital-permanent',
      name: 'Permanente',
      price: 159,
      period: '/pago único',
      description: 'Acceso para siempre a la biblioteca Vol. 1 y 2',
      type: 'digital',
      badge: null,
      recommended: false,
      features: [
        'Acceso de por vida',
        'Todas las recetas de Vol. 1 y 2',
        'Contenido actualizado',
        'Sin pagos recurrentes'
      ]
    }
  ]

  // Physical Book Products
  const physicalProducts = [
    {
      id: 'book-vol-1',
      name: 'Volumen 1',
      price: 49,
      description: 'Libro impreso del volumen 1',
      type: 'physical',
      badge: null,
      popular: false,
      features: [
        'Libro físico del volumen 1',
        '70+ recetas fit',
        'Guía de nutrición básica',
        'Envío incluido'
      ]
    },
    {
      id: 'book-vol-2',
      name: 'Volumen 2',
      price: 49,
      description: 'Libro impreso del volumen 2',
      type: 'physical',
      badge: null,
      popular: false,
      features: [
        'Libro físico del volumen 2',
        '70+ recetas fit',
        'Guía de planificación',
        'Envío incluido'
      ]
    },
    {
      id: 'book-pack',
      name: 'Pack Vol. 1 y 2',
      price: 89,
      description: 'Libros impresos del volumen 1 y 2',
      type: 'physical',
      badge: 'Más popular',
      popular: true,
      features: [
        'Ambos libros físicos',
        '140+ recetas fit',
        'Todas las guías incluidas',
        'Envío incluido'
      ]
    }
  ]

  const handleAddToCart = (product) => {
    addToCart(product)
    console.log('Producto añadido:', product.name)
  }
  
  // Get selected products
  const getSelectedDigitalProduct = () => digitalProducts.find(p => p.id === selectedDigital)
  const getSelectedPhysicalProduct = () => physicalProducts.find(p => p.id === selectedPhysical)

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-900 mb-4">
            Elige cómo quieres disfrutar<br />Cocina Squat Fit
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Acceso digital por suscripción o compra del libro impreso.<br />
            Dos experiencias distintas, sin líos.
          </p>
        </div>

        {/* Main Grid - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-8 mt-24">
          
          {/* BIBLIOTECA DIGITAL - Left Column */}
          <div className="bg-white rounded-3xl shadow-lg p-8 relative">
            {/* Header with Image */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-7xl font-bold text-indigo-900 mb-2">
                  Biblioteca<br />Digital
                </h3>
                <p className="text-indigo-700 text-3xl">
                  Todo el contenido en digital,<br />
                  siempre actualizado.
                </p>
              </div>
              <div className="flex-shrink-0 ">
                <Image 
                  src="/Mockuptelefono1.png" 
                  alt="Biblioteca Digital"
                  width={150}
                  height={300}
                  className="object-contain absolute -top-20 right-0 z-20"
                />
              </div>
            </div>

            {/* Digital Products */}
            <div className="space-y-4">
              {digitalProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedDigital(product.id)}
                  className={`
                    relative rounded-2xl p-4 border-2 transition-all cursor-pointer
                    ${selectedDigital === product.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                      : product.recommended 
                        ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {product.badge && (
                    <span className="absolute -top-2 left-4 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {/* Radio button indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedDigital === product.id 
                            ? 'border-indigo-600 bg-indigo-600' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedDigital === product.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-indigo-900">{product.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-7">{product.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-indigo-900">
                        {product.price} €
                        <span className="text-sm font-normal text-gray-600">{product.period}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => handleAddToCart(getSelectedDigitalProduct())}
              className="w-full cursor-pointer mt-6 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 rounded-2xl transition-colors text-lg"
            >
              Acceder a la biblioteca
            </button>
            <p className="text-center text-sm text-gray-600 mt-2">
              <span className="font-bold">Acceso inmediato.</span> Cancela cuando quieras en mensual.
            </p>
          </div>

          {/* LIBROS EN PAPEL - Right Column */}
          <div className="bg-white rounded-3xl shadow-lg p-8 relative">
            {/* Header with Image */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-7xl font-bold text-orange-600 mb-2">
                  Libros en<br />papel
                </h3>
                <p className="text-orange-600 text-3xl">
                  Libro impreso. Compra única.<br />
                  Sin suscripción.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Image 
                  src="/LibrosFisicos.png" 
                  alt="Libros en papel"
                  width={350}
                  height={350}
                  className="object-contain absolute -top-30 -right-20 z-20"
                />
              </div>
            </div>

            {/* Physical Products */}
            <div className="space-y-4">
              {physicalProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedPhysical(product.id)}
                  className={`
                    relative rounded-2xl p-4 border-2 transition-all cursor-pointer
                    ${selectedPhysical === product.id
                      ? 'border-orange-500 bg-orange-50 shadow-md' 
                      : product.popular 
                        ? 'bg-orange-50 border-orange-200 hover:border-orange-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {product.badge && (
                    <span className="absolute -top-2 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {/* Radio button indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPhysical === product.id 
                            ? 'border-orange-600 bg-orange-600' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedPhysical === product.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-orange-600">{product.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-7">{product.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-orange-600">
                        {product.price} €
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => handleAddToCart(getSelectedPhysicalProduct())}
              className="w-full cursor-pointer mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors text-lg"
            >
              Comprar libro impreso
            </button>
          </div>
        </div>

        {/* Difference Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-12">
            ¿Cuál es la diferencia?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Biblioteca Digital */}
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 p-6 rounded-2xl mb-4">
                <FileText className="w-16 h-16 text-indigo-700" strokeWidth={2} />
              </div>
              <h4 className="text-xl font-bold text-indigo-900 mb-3">Biblioteca digital</h4>
              <p className="text-gray-700 text-center">
                acceso online al contenido digital completo mientras dure la suscripción.
              </p>
            </div>

            {/* Libro Impreso */}
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-6 rounded-2xl mb-4">
                <BookOpen className="w-16 h-16 text-orange-600" strokeWidth={2} />
              </div>
              <h4 className="text-xl font-bold text-orange-600 mb-3">Libro impreso</h4>
              <p className="text-gray-700 text-center">
                el libro físico en papel, sin acceso digital y sin actualizaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
