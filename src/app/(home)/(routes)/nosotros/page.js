'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Achievements from '../../_components/Achievements';
import Education from '../../_components/Education';
import SobreHamlet from '../../_components/SobreHamlet';
import Empleo from '../../_components/Empleo';
import BrandTabs from '@/app/components/BrandTabs';
import { ABOUT, Portrait } from '../../_components/aboutStyles';

// Página "Nosotros" con pestañas. Estilo unificado (sobrio/legal) en aboutStyles.
export default function NosotrosPage() {
  const [activeTab, setActiveTab] = useState('la-empresa');

  // Al entrar a Nosotros, empezar arriba (antes podía quedarse abajo)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: 'la-empresa', label: 'La empresa' },
    { id: 'sobre-maria', label: 'Sobre María' },
    { id: 'sobre-hamlet', label: 'Sobre Hamlet' },
    { id: 'empleo', label: 'Empleo' },
  ];

  return (
    <main className="w-full px-5 sm:px-6 py-10 sm:py-14 font-sans">
      {/* Todo comparte la misma columna estrecha: tabs y contenido alineados */}
      <div className={ABOUT.page}>
        <BrandTabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-12" />

        <section className="min-h-[400px] text-gray-800">
          {activeTab === 'la-empresa' && <ContenidoEmpresa />}
          {activeTab === 'sobre-maria' && <ContenidoSobreMaria />}
          {activeTab === 'sobre-hamlet' && <SobreHamlet />}
          {activeTab === 'empleo' && <Empleo />}
        </section>
      </div>
    </main>
  );
}

// ── Pestaña "La empresa" ─────────────────────────────────────────────────────
const ContenidoEmpresa = () => {
  return (
    <div className="animate-fadeIn">
      <p className={ABOUT.eyebrow}>Squad Fit</p>
      <h1 className={`${ABOUT.h1} mt-2`}>¡Hola y bienvenido a Squad&nbsp;Fit!</h1>
      <p className={ABOUT.lead}>
        Somos un equipo apasionado por el fitness y la salud, y estamos aquí para ayudarte
        a alcanzar tus metas de una manera divertida y sostenible.
      </p>

      {/* Imagen de marca, contenida (antes 500 px sueltos) */}
      <div className="mt-8 relative w-full aspect-[16/9] max-w-2xl mx-auto">
        <Image src="/nosotros.png" alt="Equipo de Squad Fit" fill sizes="(max-width:768px) 100vw, 672px" className="object-contain" />
      </div>

      <section className={ABOUT.section}>
        <h2 className={ABOUT.h2}>Sobre nosotros</h2>
        <div className="mt-3 space-y-4">
          <p className={ABOUT.p}>
            En Squad Fit creemos que el entrenamiento y una buena dieta son claves no solo para un
            cuerpo en forma, sino también para una mente sana y una vida equilibrada y feliz.
          </p>
        </div>
      </section>

      <section className={ABOUT.section}>
        <h2 className={ABOUT.h2}>Nuestra misión</h2>
        <div className="mt-3 space-y-4">
          <p className={ABOUT.p}>
            Como dice uno de nuestros lemas, «la mejor inversión que puedes hacer es aprender».
            Nuestra misión es darte herramientas, conocimiento y apoyo para lograr tu mejor versión.
          </p>
          <p className={ABOUT.p}>
            Aquí cada miembro es parte de nuestra familia, y nos aseguramos de que te sientas
            valorado y motivado.
          </p>
        </div>
      </section>

      <section className={ABOUT.section}>
        <h2 className={ABOUT.h2}>Nuestra visión</h2>
        <div className="mt-3 space-y-4">
          <p className={ABOUT.p}>
            Tenemos dos convicciones: 1.º, si todos entendiéramos las calorías tomaríamos mejores
            decisiones; y 2.º, si erradicamos el sedentarismo todos seremos más saludables.
          </p>
          <p className={ABOUT.p}>
            Por eso, ya sea que busques mejorar tu físico, tu rendimiento, tu mentalidad, tu salud
            o simplemente empezar tu viaje fitness, este es el equipo ideal para ti.
          </p>
        </div>
      </section>

      <section className={ABOUT.section}>
        <h2 className={ABOUT.h2}>Únete al equipo</h2>
        <div className="mt-3 space-y-4">
          <p className={ABOUT.p}>
            Si estás listo para transformar tu vida y divertirte mientras lo haces, ¡estás en la
            comunidad perfecta! Únete y descubre cómo alcanzar tus objetivos de fitness y salud.
          </p>
          <p className={ABOUT.p}>
            Gracias por confiar en nosotros y por permitirnos ser parte de tu viaje hacia una vida
            más saludable y activa. Juntos, haremos que cada Squat cuente. ¡Nos vemos en Squad Fit!
          </p>
        </div>
      </section>

      {/* Foto del equipo, contenida y redondeada (antes a sangre 1920×600) */}
      <div className="mt-12 relative w-full aspect-[16/7] rounded-2xl overflow-hidden shadow-sm">
        <Image src="/equipo.png" alt="El equipo de Squad Fit" fill sizes="768px" className="object-cover" />
      </div>
    </div>
  );
};

// ── Pestaña "Sobre María" ────────────────────────────────────────────────────
const ContenidoSobreMaria = () => {
  const data = [
    { icon: 'Pills', title: 'Licenciatura en Farmacia', subtitle: 'Universidad', detail: 'Complutense de Madrid (UCM)' },
    { icon: 'ClipboardList', title: 'Grado Superior en Dietética', subtitle: 'Instituto Técnico de Estudios', detail: 'Profesionales (ITEP)' },
    { icon: 'Piramide', title: 'Asesora Nutricional', subtitle: '+350 clientes', detail: 'satisfechos desde 2019' },
    { icon: 'Seminario', title: '+10 Seminarios de Fitness', subtitle: 'Seminario de Fuerza e Hipertrofia 2018', detail: '(NSCA), entre otros' },
  ];

  const parrafos = [
    'Soy María Casas, conocida también como María Squad Fit, tengo 31 años y vivo en Alicante, ES.',
    'Mientras estudiaba Farmacia, empecé a interesarme en el fitness: el metabolismo, el ambiente hormonal y el papel de la nutrición y el entrenamiento en el cuerpo humano.',
    'A raíz de esto, decidí formar parte del equipo PowerExplosive, redactando artículos en su blog y divulgando en su canal de YouTube.',
    'Esta experiencia me llevó a cambiar mi trabajo de farmacéutica por mi nueva pasión: el fitness. Empecé a dar clases y a crecer en redes sociales.',
    'A día de hoy llevo 8 años entrenando y +5 años en la nutrición. Me dedico al asesoramiento nutricional y deportivo, y a la creación de contenido online.',
    'Soy profesora de formación online, antes en los másteres del ICNS y actualmente en la Formación Profesional de FitGeneration.',
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
        <div className="flex-1 order-2 md:order-1">
          <p className={ABOUT.eyebrow}>El equipo</p>
          <h1 className={`${ABOUT.h1} mt-2`}>Sobre María</h1>
          <div className="mt-4 space-y-4">
            {parrafos.map((t, i) => <p key={i} className={ABOUT.p}>{t}</p>)}
          </div>
        </div>
        <div className="order-1 md:order-2 w-full md:w-auto">
          <Portrait src="/Maria.png" alt="María de Squad Fit" />
        </div>
      </div>

      <Achievements />
      <Education data={data} />
    </div>
  );
};
