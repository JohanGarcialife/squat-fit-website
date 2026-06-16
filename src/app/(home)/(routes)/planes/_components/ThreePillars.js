'use client';

import React from 'react';
import { Users, Brain, Heart } from 'lucide-react';

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
          
          {/* Card 1: Cuerpo */}
          <div className="relative bg-white border border-slate-100 rounded-[36px] p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(54,60,152,0.05)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-[#363C98]">
                <Users className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#363C98] font-extrabold text-2xl sm:text-3xl">
                Cuerpo
              </h3>
            </div>
            {/* Divider */}
            <div className="w-full h-[2px] bg-[#363C98]/20 mb-6" />
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Aprendes a comer y a entrenar con criterio.
            </p>
          </div>

          {/* Card 2: Mente */}
          <div className="relative bg-[#ECEDFC] rounded-[36px] p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(54,60,152,0.08)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-[#363C98]">
                <Brain className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#363C98] font-extrabold text-2xl sm:text-3xl">
                Mente
              </h3>
            </div>
            {/* Divider */}
            <div className="w-full h-[2px] bg-[#363C98]/20 mb-6" />
            <p className="text-slate-700 text-lg leading-relaxed font-medium">
              Trabajas hábitos, mentalidad y constancia.
            </p>
          </div>

          {/* Card 3: Entorno */}
          <div className="relative bg-[#DBDCF8] rounded-[36px] p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(54,60,152,0.1)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-[#363C98]">
                <Heart className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#363C98] font-extrabold text-2xl sm:text-3xl">
                Entorno
              </h3>
            </div>
            {/* Divider */}
            <div className="w-full h-[2px] bg-[#363C98]/20 mb-6" />
            <p className="text-slate-700 text-lg leading-relaxed font-medium">
              Una comunidad activa que sostiene el cambio.
            </p>
          </div>

        </div>

        {/* --- Subtexto --- */}
        <p className="text-[#363C98] font-semibold text-lg sm:text-xl text-center mb-10 max-w-2xl">
          Un método completo para cada etapa de tu transformación
        </p>

        {/* --- Botón CTA --- */}
        <button
          onClick={handleScrollToPlans}
          className="bg-[#FF690B] text-white px-10 sm:px-12 py-4 rounded-full font-bold text-lg sm:text-xl shadow-lg hover:shadow-[#FF690B]/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          Reserva tu plaza
        </button>

      </div>
    </section>
  );
}
