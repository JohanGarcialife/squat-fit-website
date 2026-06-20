'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart.store'
import { BookOpen, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Shop() {
  const { addToCart, setDirectCheckoutItem, cart } = useCartStore()
  const router = useRouter()
  
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
      description: 'Muy rentable si lo usas de verdad',
      type: 'digital',
      badge: 'Recomendado',
      savings: 'Ahorra 50 €/año',
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
      period: '/único',
      description: 'Recetas actuales y futuras x siempre',
      type: 'digital',
      badge: null,
      savings: 'Ahorra +120 €',
      recommended: false,
      features: [
        'Acceso de por vida',
        'Todas las recetas de Vol. 1 y 2',
        'Contenido actualizado',
        'Sin pagos recurrentes'
      ]
    }
  ]

  // Dynamic Physical Book Products
  const [physicalProducts, setPhysicalProducts] = useState([])
  const [isLoadingPhysical, setIsLoadingPhysical] = useState(true)

  React.useEffect(() => {
    async function fetchPhysicalProducts() {
      try {
        const [booksRes, packsRes] = await Promise.all([
          fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/book/all'),
          fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/book/packs')
        ])
        const booksData = await booksRes.json()
        const packsData = await packsRes.json()

        const formattedProducts = []

        // Format Books (using their versions)
        if (Array.isArray(booksData)) {
          booksData.forEach((b) => {
            if (b.versions && b.versions.length > 0) {
              const version = b.versions[0]
              formattedProducts.push({
                id: version.version_id, // Mandatory UUID for Version
                name: b.title || version.version_title,
                price: version.version_price,
                description: b.subtitle || 'Libro físico impreso',
                type: 'version',
                badge: null,
                popular: false,
                image: version.version_image || b.image || '/LibrosFisicos.png',
                features: ['Libro físico', 'Recetas fit', 'Envío incluido']
              })
            }
          })
        }

        // Format Packs
        if (Array.isArray(packsData)) {
          packsData.forEach((p) => {
            formattedProducts.push({
              id: p.id, // Mandatory UUID for Pack
              name: p.name,
              price: parseFloat(p.price),
              description: p.description || 'Pack de libros impresos',
              type: 'pack',
              badge: 'Más popular',
              savings: 'Ahorra 10 €',
              popular: true,
              image: p.image || '/LibrosFisicos.png',
              features: ['Libros físicos', 'Recetas fit', 'Envío incluido']
            })
          })
        }

        setPhysicalProducts(formattedProducts)
        if (formattedProducts.length > 0) {
          // Find popular one, fallback to first
          const defaultProd = formattedProducts.find(p => p.popular) || formattedProducts[0]
          setSelectedPhysical(defaultProd.id)
        }
      } catch (error) {
        console.error("Error fetching physical products:", error)
        toast.error("Error cargando el catálogo de libros físicos")
      } finally {
        setIsLoadingPhysical(false)
      }
    }
    fetchPhysicalProducts()
  }, [])

  const handleAddToCart = (product) => {
    if (product.type === 'digital') {
      if (cart.length > 0 && !cart.some(item => item.isDirectCheckout)) {
          toast.error('Tus productos físicos fueron removidos por seguridad (no se pueden mezclar suscripciones y productos).', { duration: 5000 });
      }

      let subType = product.id.replace('digital-', '') // ej: 'annual'
      setDirectCheckoutItem({
        id: product.id,
        name: `Suscripción Digital - ${product.name}`,
        price: product.price,
        image: product.image || '/Group32.png',
        endpoint: '/api/v1/book/create-payment-intent-digital',
        payload: { subscription_type: subType }
      })
      toast.success('Suscripción añadida al carrito')
    } else {
      if (cart.some(item => item.isDirectCheckout)) {
          toast.error('Tu suscripción fue removida por seguridad (no se pueden mezclar productos físicos y suscripciones).', { duration: 5000 });
      }

      addToCart({
        id: product.id, 
        type: product.type || 'version',
        name: `Libro Físico - ${product.name}`,
        price: product.price,
        image: product.image || '/LibrosFisicos.png'
      })
      toast.success('Libro añadido al carrito')
    }
  }
  
  // Get selected products
  const getSelectedDigitalProduct = () => digitalProducts.find(p => p.id === selectedDigital)
  const getSelectedPhysicalProduct = () => physicalProducts.find(p => p.id === selectedPhysical)

  return (
    <section id="shop" className="py-16 px-4 bg-gray-50">
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
                    <div className="text-right ml-4 flex flex-col items-end justify-center">
                      <p className="text-2xl font-bold text-indigo-900">
                        {product.price.toString().replace('.', ',')} €
                        <span className="text-sm font-normal text-gray-600">{product.period}</span>
                      </p>
                      {product.savings && (
                        <div className="mt-1 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {product.savings}
                        </div>
                      )}
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
              {isLoadingPhysical ? (
                <>
                  <div className="animate-pulse flex items-center p-4 border-2 border-gray-200 rounded-2xl h-24 bg-gray-50">
                    <div className="rounded-full bg-gray-200 h-5 w-5 mr-4"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                       <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="animate-pulse flex items-center p-4 border-2 border-gray-200 rounded-2xl h-24 bg-gray-50">
                    <div className="rounded-full bg-gray-200 h-5 w-5 mr-4"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                       <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </>
              ) : (
                physicalProducts.map((product) => (
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
                      <div className="text-right ml-4 flex flex-col items-end justify-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {product.price.toString().replace('.', ',')} €
                      </p>
                      {product.savings && (
                        <div className="mt-1 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {product.savings}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => handleAddToCart(getSelectedPhysicalProduct())}
              disabled={isLoadingPhysical || !getSelectedPhysicalProduct()}
              className="w-full cursor-pointer mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors text-lg"
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
