'use client'
import React, { useState } from 'react';
import Image from 'next/image';

// Componente principal de la página "Nosotros" con Tabs
export default function NosotrosPage() {
  const [activeTab, setActiveTab] = useState('la-empresa');

  // Definición de las tabs según el diseño
  const tabs = [
    { id: 'la-empresa', label: 'La empresa' },
    { id: 'sobre-maria', label: 'Sobre María' },
    { id: 'sobre-hamlet', label: 'Sobre Hamlet' },
    { id: 'empleo', label: 'Empleo' },
  ];

  return (
    <> {/* Fragmento para permitir múltiples elementos hermanos */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        
        {/* Navegación de TABS */}
        <nav className="flex items-end w-full overflow-x-auto no-scrollbar mb-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap px-6 py-3 text-base sm:text-lg font-medium transition-all duration-200 rounded-t-2xl
                  ${isActive 
                    ? 'text-orange-500 bg-white border-t-2 border-l-2 border-r-2 border-orange-500 -mb-[2px] z-10 font-bold' 
                    : 'text-[#3B3B98] hover:text-blue-800 mb-0 border-b-2 w-full border-primary'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Contenido dinámico según la tab activa */}
        <section className="text-gray-800 leading-relaxed min-h-[500px] bg-white">
          
          {activeTab === 'la-empresa' && <ContenidoEmpresa />}
          
          {activeTab === 'sobre-maria' && <ContenidoSobreMaria />}

          {activeTab === 'sobre-hamlet' && (
            <div className="animate-fadeIn p-4">
              <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Sobre Hamlet</h1>
              <p>Contenido sobre Hamlet pendiente...</p>
            </div>
          )}

          {activeTab === 'empleo' && (
            <div className="animate-fadeIn p-4">
              <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Empleo</h1>
              <p>Contenido sobre oportunidades de empleo pendiente...</p>
            </div>
          )}
        </section>
      </main>
      
      {/* La imagen grande del equipo al final, ahora fuera del main para ancho completo */}
      {activeTab === 'la-empresa' && (
        <div className="w-full mt-10">
          <Image 
            src="/equipo.png"
            alt="El equipo de Squat Fit"
            width={1920}
            height={600}
            className="w-full object-cover"
          />
        </div>
      )}
    </>
  );
}

// Componente con el contenido de la pestaña "La empresa"
const ContenidoEmpresa = () => {
  return (
    <div className="animate-fadeIn">
      {/* Sección del Título Principal */}
      <header className="py-12 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3B3B98]">
          ¡Hola y bienvenido a Squat Fit!
        </h1>
      </header>

      {/* Sección "Sobre Nosotros" con imagen */}
      <section className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">Sobre nosotros</h2>
            <p className="mb-4 text-lg">
              Somos un equipo apasionado por el fitness y la salud, y estamos aquí para ayudarte a alcanzar tus metas de una manera divertida y sostenible.
            </p>
            <p className="text-lg">
              En Squat Fit, creemos que el entrenamiento y una buena dieta son claves no sólo para un cuerpo en forma sino también para una mente sana, y una vida equilibrada y feliz.
            </p>
          </div>
          <div className="flex justify-center">
            <Image 
              src="/IMG-Maria-Hamlet-.png" // Corregido a IMG-Maria-Hamlet-.png
              alt="Equipo de Squat Fit"
              width={500}
              height={500}
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Sección Misión y Visión */}
      <section className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">Nuestra misión</h2>
            <p className="mb-4 text-lg">
              Como uno de nuestros lemas: “la mejor inversión que puedes hacer es: Aprender”, nuestra misión es darte herramientas, conocimiento y apoyo para lograr tu mejor versión.
            </p>
            <p className="text-lg">
              Aquí cada miembro es parte de nuestra familia, y nos aseguramos de que te sientas valorado y motivado.
            </p>
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">Nuestra visión</h2>
            <p className="mb-4 text-lg">
              Tenemos dos convicciones principales: 1º si todos entendiéramos las calorías tomaríamos las mejores decisiones y 2º si erradicamos el sedentarismo todos seremos más saludables.
            </p>
            <p className="text-lg">
              Por eso, ya sea que busques mejorar tu físico, tu rendimiento, tu mentalidad, tu salud, o simplemente empezar tu viaje fitness, este es el equipo ideal para ti.
            </p>
          </div>
        </div>
      </section>

      {/* Sección "Únete al equipo" */}
      <section className="py-10 text-center">
        <h2 className="text-4xl font-bold text-[#3B3B98] mb-6">Únete al equipo</h2>
        <p className="mb-4 text-lg max-w-3xl mx-auto">
          Si estás listo para transformar tu vida y divertirte mientras lo haces, ¡estás en la comunidad perfecta! Únete y descubre con nosotros cómo alcanzar tus objetivos de fitness y salud.
        </p>
        <p className="mb-8 text-lg max-w-3xl mx-auto">
          Gracias por confiar en nosotros y por permitirnos ser parte de tu viaje hacia una vida más saludable y activa. Juntos, haremos que cada Squat cuente. ¡Nos vemos en Squat Fit!
        </p>
      </section>
    </div>
  );
};

// Nuevo componente con el contenido de la pestaña "Sobre María"
const ContenidoSobreMaria = () => {
  return (
    <div className="animate-fadeIn p-4 text-gray-800 leading-relaxed">
      <h1 className="text-8xl font-bold text-[#3B3B98] mb-6">Sobre María</h1>
      <p className="mb-4 text-lg">
        Soy María Casas, conocida también como María Squat Fit, tengo 31 años y vivo en Alicante, ES.
      </p>
      <p className="mb-4 text-lg">
        Mientras estudiaba farmacia, empecé a interesarme en el fitness: en el metabolismo, el ambiente hormonal, así como en el papel de la nutrición y el entrenamiento en el cuerpo humano.
      </p>
      <p className="mb-4 text-lg">
        A raíz de esto, decidí empezar a formar parte del equipo PowerExplosive, redactando artículos en su blog y divulgando en su Canal de YouTube.
      </p>
      <p className="mb-4 text-lg">
        Esta experiencia me llevó a cambiar mi trabajo de farmacéutica por mi nueva pasión: el fitness. Empecé a dar clases y a crecer exponencialmente en mi presencia en las redes sociales.
      </p>
      <p className="mb-4 text-lg">
        A día de hoy, llevo 8 años entrenando y +5 años en el mundo de la nutrición. Me dedico al asesoramiento nutricional y deportivo, así como creación de contenido online.
      </p>
      <p className="mb-4 text-lg">
        Soy profesora de formación online, anteriormente en los másteres del ICNS, y actualmente en la Formación Profesional de FitGeneration.
      </p>
    </div>
  );
};

