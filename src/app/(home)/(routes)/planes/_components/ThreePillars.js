'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, Brain, Heart } from 'lucide-react';
import LandingButton from '../../../../components/LandingButton';

// Detecta cuándo un elemento entra en pantalla (una sola vez).
// En móvil las tarjetas van apiladas, así que cada una se anima al llegar a ella.
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

const PILLARS = [
  {
    icon: Users,
    title: 'Cuerpo',
    text: 'Aprendes a comer y a entrenar con criterio.',
    cardClass: 'bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(54,60,152,0.05)]',
    textClass: 'text-slate-600',
  },
  {
    icon: Brain,
    title: 'Mente',
    text: 'Trabajas hábitos, mentalidad y constancia.',
    cardClass: 'bg-[#ECEDFC] shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(54,60,152,0.08)]',
    textClass: 'text-slate-700',
  },
  {
    icon: Heart,
    title: 'Entorno',
    text: 'Una comunidad activa que sostiene el cambio.',
    cardClass: 'bg-[#DBDCF8] shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(54,60,152,0.1)]',
    textClass: 'text-slate-700',
  },
];

function PillarCard({ icon: Icon, title, text, cardClass, textClass, index }) {
  const [ref, visible] = useInView();
  // Escalonado entre tarjetas solo en escritorio (en móvil cada una entra al hacer scroll)
  const cardDelay = index * 120;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${visible ? cardDelay : 0}ms` }}
      className={`group relative rounded-[36px] p-8 sm:p-10 flex flex-col items-start transition-all duration-500 ease-out hover:-translate-y-2 ${cardClass} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* 1º: icono (con rebote) + título */}
      <div className="flex items-center gap-4 mb-6">
        <div
          style={{ transitionDelay: `${visible ? cardDelay + 100 : 0}ms` }}
          className={`text-[#363C98] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6 ${
            visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <Icon className="w-10 h-10" strokeWidth={1.5} />
        </div>
        <h3
          style={{ transitionDelay: `${visible ? cardDelay + 150 : 0}ms` }}
          className={`text-[#363C98] font-extrabold text-2xl sm:text-3xl transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
          }`}
        >
          {title}
        </h3>
      </div>

      {/* 2º: la línea se dibuja de izquierda a derecha */}
      <div
        style={{ transitionDelay: `${visible ? cardDelay + 300 : 0}ms` }}
        className={`w-full h-[2px] bg-[#363C98]/20 mb-6 origin-left transition-transform duration-500 ease-out ${
          visible ? 'scale-x-100' : 'scale-x-0'
        }`}
      />

      {/* 3º: el cuerpo de texto */}
      <p
        style={{ transitionDelay: `${visible ? cardDelay + 450 : 0}ms` }}
        className={`${textClass} text-lg leading-relaxed font-medium transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default function ThreePillars() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white py-20 sm:py-28 px-6 sm:px-12 md:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">

        {/* --- Título Principal --- */}
        <h2 className="text-[#363C98] font-extrabold text-3xl sm:text-5xl md:text-6xl text-center mb-16 tracking-tight max-w-4xl">
          Tres pilares. Un cambio que dura.
        </h2>

        {/* --- Grid de Tarjetas (Pilares) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 w-full max-w-6xl mb-16">
          {PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.title} {...pillar} index={i} />
          ))}
        </div>

        {/* --- Subtexto --- */}
        <p className="text-[#363C98] font-semibold text-lg sm:text-xl text-center mb-10 max-w-2xl">
          Un método completo para cada etapa de tu transformación
        </p>

        {/* --- Botón CTA --- */}
        <LandingButton variant="orange" size="lg" autoShine onClick={handleScrollToPlans}>
          Reserva tu plaza
        </LandingButton>

      </div>
    </section>
  );
}
