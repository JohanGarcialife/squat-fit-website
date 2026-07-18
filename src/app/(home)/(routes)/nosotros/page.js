'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Achievements from '../../_components/Achievements';
import Education from '../../_components/Education';
import SobreHamlet from '../../_components/SobreHamlet';
import Empleo from '../../_components/Empleo';
import BrandTabs from '@/app/components/BrandTabs';
import { ABOUT, Portrait, Sheet } from '../../_components/aboutStyles';

// Página "Conócenos" con pestañas, formato hoja (aboutStyles). Estilo sobrio/legal.
export default function NosotrosPage() {
  const [activeTab, setActiveTab] = useState('la-empresa');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: 'la-empresa', label: 'Squad Fit' },
    { id: 'sobre-maria', label: 'María' },
    { id: 'sobre-hamlet', label: 'Hamlet' },
    { id: 'empleo', label: 'Únete al equipo' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const goEmpleo = () => { setActiveTab('empleo'); window.scrollTo(0, 0); };

  return (
    <Sheet>
      {/* Barra de navegación arriba del todo */}
      <BrandTabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-10" />

      <section className="min-h-[400px] text-gray-800">
        {activeTab === 'la-empresa' && <ContenidoEmpresa onGoToEmpleo={goEmpleo} />}
        {activeTab === 'sobre-maria' && <ContenidoSobreMaria />}
        {activeTab === 'sobre-hamlet' && <SobreHamlet />}
        {activeTab === 'empleo' && <Empleo />}
        {activeTab === 'contacto' && <ContenidoContacto />}
      </section>
    </Sheet>
  );
}

// ── Pestaña "Squad Fit" ──────────────────────────────────────────────────────
const ContenidoEmpresa = ({ onGoToEmpleo }) => {
  return (
    <div className="animate-fadeIn">
      <p className={ABOUT.eyebrow}>Squad Fit</p>
      <h1 className={`${ABOUT.h1} mt-2`}>¡Hola y bienvenido a Squad&nbsp;Fit!</h1>
      <p className={ABOUT.lead}>
        Somos un equipo apasionado por el fitness y la salud, y estamos aquí para ayudarte
        a alcanzar tus metas de una manera divertida y sostenible.
      </p>

      {/* Imagen de marca, contenida en el flujo */}
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
            Tenemos dos convicciones: 1: si todos entendiéramos las calorías tomaríamos mejores
            decisiones; y 2: si erradicamos el sedentarismo todos seremos más saludables.
          </p>
          <p className={ABOUT.p}>
            Por eso, ya sea que busques mejorar tu físico, tu rendimiento, tu mentalidad, tu salud
            o simplemente empezar tu viaje fitness, este es el equipo ideal para ti.
          </p>
        </div>
      </section>

      <section className={ABOUT.section}>
        <h2 className={ABOUT.h2}>Trabaja con nosotros</h2>
        <div className="mt-3 space-y-4">
          <p className={ABOUT.p}>
            En Squad Fit buscamos personas responsables, resolutivas y comprometidas con ayudar
            a los demás a mejorar su salud y sus hábitos.
          </p>
          <p className={ABOUT.p}>
            Valoramos la iniciativa, el trabajo en equipo y las ganas de seguir aprendiendo. Si
            crees que puedes aportar al proyecto, nos encantará conocerte.
          </p>
          <p className={ABOUT.p}>
            <button
              type="button"
              onClick={onGoToEmpleo}
              className="text-[#FF690B] font-semibold underline underline-offset-2 hover:text-[#363C98] transition-colors cursor-pointer"
            >
              Consulta nuestras vacantes o envíanos tu candidatura
            </button>.
          </p>
        </div>
      </section>

      {/* Foto del equipo, contenida y redondeada */}
      <div className="mt-12 relative w-full aspect-[16/7] rounded-2xl overflow-hidden shadow-sm">
        <Image src="/equipo.png" alt="El equipo de Squad Fit" fill sizes="768px" className="object-cover" />
      </div>
    </div>
  );
};

// ── Pestaña "María" ──────────────────────────────────────────────────────────
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
      <p className={ABOUT.eyebrow}>El equipo</p>
      <h1 className={`${ABOUT.h1} mt-2`}>Sobre María</h1>
      <div className="mt-6">
        <Portrait src="/Maria.png" alt="María de Squad Fit" />
      </div>
      <div className="mt-6 space-y-4">
        {parrafos.map((t, i) => <p key={i} className={ABOUT.p}>{t}</p>)}
      </div>

      <Achievements />
      <Education data={data} />
    </div>
  );
};

// ── Pestaña "Contacto" ───────────────────────────────────────────────────────
const ContenidoContacto = () => (
  <div className="animate-fadeIn">
    <p className={ABOUT.eyebrow}>Hablemos</p>
    <h1 className={`${ABOUT.h1} mt-2`}>Contacto</h1>
    <p className={ABOUT.lead}>
      ¿Tienes una duda o quieres empezar? Escríbenos y te respondemos lo antes posible.
    </p>

    {/* Vías de contacto: tarjetas-botón con icono y flecha (que se vea que son
        NUESTROS datos para escribirnos, no campos a rellenar). El número no
        recibe llamadas: se ofrece como WhatsApp, no como teléfono. */}
    <div className="mt-8 grid sm:grid-cols-2 gap-4">
      <a href="mailto:hola@squatfit.es" className="group flex items-center gap-4 rounded-2xl border-2 border-[#363C98]/15 p-5 hover:border-[#363C98] hover:shadow-md transition-all">
        <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#363C98] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" />
          </svg>
        </span>
        <span className="flex-1">
          <span className="block text-gray-800 font-bold">Escríbenos un email</span>
          <span className="block text-[#363C98] text-sm font-medium mt-0.5">hola@squatfit.es</span>
        </span>
        <span className="text-slate-300 group-hover:text-[#363C98] group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
      </a>
      <a href="https://wa.me/34623020494" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border-2 border-[#25D366]/30 p-5 hover:border-[#25D366] hover:shadow-md transition-all">
        <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.4c0-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6a11.2 11.2 0 0 0 4.3 3.8c.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2Z" />
          </svg>
        </span>
        <span className="flex-1">
          <span className="block text-gray-800 font-bold">Escríbenos por WhatsApp</span>
          <span className="block text-[#25D366] text-sm font-medium mt-0.5">+34 623 020 494</span>
        </span>
        <span className="text-slate-300 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
      </a>
    </div>

    <div className="mt-6">
      <Link href="/contacto" className="inline-block bg-primary hover:bg-[#e05b08] text-white font-bold px-7 py-3 rounded-2xl transition-colors">
        Ir al formulario de contacto
      </Link>
    </div>
  </div>
);
