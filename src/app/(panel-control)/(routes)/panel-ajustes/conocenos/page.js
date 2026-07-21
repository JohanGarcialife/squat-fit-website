'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Achievements from '@/app/(home)/_components/Achievements'
import BrandTabs from '@/app/components/BrandTabs'

// «Conócenos» vive dentro de Ajustes (spec programas TMV). Contenido de marca
// que antes estaba en la página «Info», ahora sin mezclarse con lo legal.
const ABOUT_TABS = [
  { id: 'nosotros', label: 'Sobre Squad Fit' },
  { id: 'maria', label: 'Sobre María' },
  { id: 'hamlet', label: 'Sobre Hamlet' },
]

export default function ConocenosPage() {
  const [activeTab, setActiveTab] = useState('nosotros')

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/panel-ajustes"
          className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#FF690B] transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Ajustes
        </Link>
        <h1 className="text-3xl font-extrabold text-[#363C98] mb-6">Conócenos</h1>

        <BrandTabs tabs={ABOUT_TABS} active={activeTab} onChange={setActiveTab} className="mb-8" />

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 text-gray-800 leading-relaxed min-h-[500px]">
          {activeTab === 'nosotros' && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#3B3B98] mb-8">¡Hola y bienvenido a Squad Fit!</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#FF690B] mb-3">Sobre nosotros</h3>
                  <p className="mb-4 text-lg">
                    Somos un equipo apasionado por el fitness y la salud, y estamos aquí para ayudarte a alcanzar tus
                    metas de una manera divertida y sostenible.
                  </p>
                  <p className="text-lg">
                    En Squad Fit, creemos que el entrenamiento y una buena dieta son claves no sólo para un cuerpo en
                    forma sino también para una mente sana, y una vida equilibrada y feliz.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Image src="/nosotros.png" alt="Equipo de Squad Fit" width={420} height={420} className="rounded-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#FF690B] mb-3">Nuestra misión</h3>
                  <p className="text-lg">
                    Como uno de nuestros lemas: &ldquo;la mejor inversión que puedes hacer es: Aprender&rdquo;, nuestra
                    misión es darte herramientas, conocimiento y apoyo para lograr tu mejor versión.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#FF690B] mb-3">Nuestra visión</h3>
                  <p className="text-lg">
                    Creemos que si todos entendiéramos las calorías tomaríamos las mejores decisiones, y si erradicamos el
                    sedentarismo seremos más saludables.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maria' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col lg:flex-row items-start gap-10">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold text-[#363C98] mb-6">Sobre María</h2>
                  <p className="mb-4 text-lg">Soy María Casas, conocida también como María Squad Fit, tengo 31 años y vivo en Alicante, ES.</p>
                  <p className="mb-4 text-lg">Mientras estudiaba farmacia, empecé a interesarme en el fitness: en el metabolismo, el ambiente hormonal, así como en el papel de la nutrición y el entrenamiento en el cuerpo humano.</p>
                  <p className="mb-4 text-lg">Esta experiencia me llevó a cambiar mi trabajo de farmacéutica por mi nueva pasión: el fitness. Empecé a dar clases y a crecer exponencialmente en redes sociales.</p>
                  <p className="mb-4 text-lg">A día de hoy, llevo 8 años entrenando y +5 años en el mundo de la nutrición. Me dedico al asesoramiento nutricional y deportivo.</p>
                </div>
                <Image src="/Maria.png" alt="María de Squad Fit" width={360} height={360} className="object-cover rounded-2xl shrink-0" />
              </div>
              <Achievements />
            </div>
          )}

          {activeTab === 'hamlet' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col lg:flex-row items-start gap-10">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold text-[#363C98] mb-6">Sobre Hamlet</h2>
                  <p className="mb-4 text-lg">Soy Hamlet Sosa, conocido también como Hamlet Squad Fit, tengo 32 años y vivo en Alicante, ES.</p>
                  <p className="mb-4 text-lg">Desde pequeño he estado metido en la cocina o el gimnasio lo cual me ha dado una tremenda ventaja para diseñar recetas fit y disfrutar lo que como mientras pierdo grasa.</p>
                  <p className="mb-4 text-lg">Mi objetivo es inspirar a la mayor cantidad de personas a que vivan de una manera saludable, que se diviertan en el proceso y construyan la mejor versión de sí mismos.</p>
                </div>
                <Image src="/hamlet.png" alt="Hamlet de Squad Fit" width={360} height={360} className="object-cover rounded-2xl shrink-0" />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
