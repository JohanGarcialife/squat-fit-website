'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Achievements from '../../../(home)/_components/Achievements'

// Dashboard Info Page - Contains the same content as NosotrosPage + Política de Privacidad
export default function InfoPage() {
  const [activeTab, setActiveTab] = useState('sobre-nosotros')

  const tabs = [
    { id: 'sobre-nosotros', label: 'Sobre Nosotros' },
    { id: 'sobre-maria', label: 'Sobre María' },
    { id: 'sobre-hamlet', label: 'Sobre Hamlet' },
    { id: 'privacidad', label: 'Política de Privacidad' },
  ]

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto font-sans">
      <h1 className="text-3xl font-bold text-secondary mb-8">Información</h1>

      {/* NAV TABS */}
      <nav className="flex items-end w-full overflow-x-auto no-scrollbar mb-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-6 py-3 text-base sm:text-lg font-medium transition-all duration-200 rounded-t-2xl
                ${isActive
                  ? 'text-orange-500 bg-white border-t-2 border-l-2 border-r-2 border-orange-500 -mb-[2px] z-10 font-bold'
                  : 'text-[#3B3B98] hover:text-blue-800 mb-0 border-b-2 border-primary'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* CONTENT */}
      <section className="text-gray-800 leading-relaxed min-h-[500px]">

        {activeTab === 'sobre-nosotros' && (
          <div className="animate-fadeIn">
            <header className="py-10 text-center lg:text-left">
              <h2 className="text-5xl lg:text-7xl font-bold text-[#3B3B98]">¡Hola y bienvenido a Squat Fit!</h2>
            </header>
            <section className="py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-orange-500 mb-4">Sobre nosotros</h3>
                  <p className="mb-4 text-xl">Somos un equipo apasionado por el fitness y la salud, y estamos aquí para ayudarte a alcanzar tus metas de una manera divertida y sostenible.</p>
                  <p className="text-xl">En Squat Fit, creemos que el entrenamiento y una buena dieta son claves no sólo para un cuerpo en forma sino también para una mente sana, y una vida equilibrada y feliz.</p>
                </div>
                <div className="flex justify-center">
                  <Image src="/nosotros.png" alt="Equipo de Squat Fit" width={450} height={450} />
                </div>
              </div>
            </section>
            <section className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-3xl font-bold text-orange-500 mb-4">Nuestra misión</h3>
                  <p className="text-xl">Como uno de nuestros lemas: &ldquo;la mejor inversión que puedes hacer es: Aprender&rdquo;, nuestra misión es darte herramientas, conocimiento y apoyo para lograr tu mejor versión.</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-orange-500 mb-4">Nuestra visión</h3>
                  <p className="text-xl">Creemos que si todos entendiéramos las calorías tomaríamos las mejores decisiones, y si erradicamos el sedentarismo seremos más saludables.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'sobre-maria' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col lg:flex-row items-start gap-10">
              <div className="text-gray-800 leading-relaxed max-w-2xl">
                <h2 className="text-5xl font-bold text-secondary mb-6">Sobre María</h2>
                <p className="mb-4 text-xl">Soy María Casas, conocida también como María Squat Fit, tengo 31 años y vivo en Alicante, ES.</p>
                <p className="mb-4 text-xl">Mientras estudiaba farmacia, empecé a interesarme en el fitness: en el metabolismo, el ambiente hormonal, así como en el papel de la nutrición y el entrenamiento en el cuerpo humano.</p>
                <p className="mb-4 text-xl">Esta experiencia me llevó a cambiar mi trabajo de farmacéutica por mi nueva pasión: el fitness. Empecé a dar clases y a crecer exponencialmente en redes sociales.</p>
                <p className="mb-4 text-xl">A día de hoy, llevo 8 años entrenando y +5 años en el mundo de la nutrición. Me dedico al asesoramiento nutricional y deportivo.</p>
              </div>
              <Image src="/maria.png" alt="María de Squat Fit" width={400} height={400} className="object-cover rounded-2xl" />
            </div>
            <Achievements />
          </div>
        )}

        {activeTab === 'sobre-hamlet' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col lg:flex-row items-start gap-10">
              <div className="text-gray-800 leading-relaxed max-w-2xl">
                <h2 className="text-5xl font-bold text-secondary mb-6">Sobre Hamlet</h2>
                <p className="mb-4 text-xl">Soy Hamlet Sosa, conocido también como Hamlet Squat Fit, tengo 32 años y vivo en Alicante, ES.</p>
                <p className="mb-4 text-xl">Desde pequeño he estado metido en la cocina o el gimnasio lo cual me ha dado una tremenda ventaja para diseñar recetas fit y disfrutar lo que como mientras pierdo grasa.</p>
                <p className="mb-4 text-xl">Mi objetivo es inspirar a la mayor cantidad de personas a que vivan de una manera saludable, que se diviertan en el proceso y construyan la mejor versión de sí mismos.</p>
              </div>
              <Image src="/hamlet.png" alt="Hamlet de Squat Fit" width={400} height={400} className="object-cover rounded-2xl" />
            </div>
          </div>
        )}

        {activeTab === 'privacidad' && (
          <div className="animate-fadeIn">
            <h2 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Privacidad</h2>
            <p className="mb-6">En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos sobre el tratamiento de sus datos personales.</p>
            <h3 className="text-xl font-bold text-black mb-3">Responsable del tratamiento</h3>
            <div className="mb-6">
              <p>Empresa: Squat Fit SLU | CIF: B19463066</p>
              <p>Dirección: Av Maisonnave 41, 3 B, 03003, Alicante, España</p>
              <p>Contacto: hola@squatfit.es</p>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Datos que recabamos</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Datos de identificación: nombre, apellidos, correo electrónico.</li>
              <li>Datos de salud relacionados con los servicios de nutrición y entrenamiento.</li>
              <li>Datos de facturación y datos de navegación (cookies).</li>
            </ul>
            <h3 className="text-xl font-bold text-black mb-3">Finalidad del tratamiento</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Prestación del servicio contratado (planes, cursos, asesoramiento).</li>
              <li>Gestión de pagos, facturación y comunicaciones del servicio.</li>
              <li>Con consentimiento expreso: envío de comunicaciones comerciales.</li>
            </ul>
            <h3 className="text-xl font-bold text-black mb-3">Sus derechos</h3>
            <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hola@squatfit.es. También puede reclamar ante la AEPD (www.aepd.es).</p>
          </div>
        )}

      </section>
    </div>
  )
}
