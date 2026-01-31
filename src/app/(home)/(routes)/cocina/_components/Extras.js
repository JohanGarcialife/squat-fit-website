import React from 'react'
import { Palmtree, Utensils, Pizza } from 'lucide-react'
import Image from 'next/image'

export default function Extras() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-10">
          Extras incluidos en ambos volúmenes
        </h2>

        {/* Main Card */}
        <div className="bg-[#FFF6ED] rounded-[50px] p-8 md:p-16 shadow-sm">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            
            {/* Column 1: Salsas */}
            <div className="flex flex-col justify-center items-center">
              <div className="mb-6">
                <Image src="/salsas.png" width={45} height={45} alt="Salsas fit" className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-orange-500 mb-4">
                +30 Salsas fit
              </h3>
              <p className="text-orange-400 font-medium leading-relaxed">
                (saladas y dulces) para no repetir como la salsa Big Mac, la Spicy mayo o la FitCream de pistacho.
              </p>
            </div>

            {/* Column 2: Guarniciones */}
            <div className="flex flex-col justify-center items-center">
              <div className="mb-6">
                <Image src="/guarniciones.png" width={60} height={60} alt="Guarniciones" className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-orange-500 mb-4">
                +15 Guarniciones
              </h3>
              <p className="text-orange-400 font-medium leading-relaxed">
                para completar cualquier menú como las Patatas airfryer con alioli casero, etc
              </p>
            </div>

            {/* Column 3: Tropicales */}
            <div className="flex flex-col justify-center items-center">
              <div className="mb-6">
                <Image src="/tropicales.png" width={60} height={60} alt="Tropicales" className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-orange-500 mb-4">
                +6 recetas tropicales
              </h3>
              <p className="text-orange-400 font-medium leading-relaxed">
                recetas caribeñas reinventadas en versión fit.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Text */}
        <p className="text-orange-400 text-xl font-medium mt-10">
          Y muchas más recetas dentro de cada volumen.
        </p>
      </div>
    </section>
  )
}
