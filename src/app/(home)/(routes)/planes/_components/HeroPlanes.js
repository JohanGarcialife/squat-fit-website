'use client';

import React from 'react';

export default function HeroPlanes() {
  const handleScrollToPlans = () => {
    // For now, it will scroll to a plans section if/when we add it, or can navigate to a shop section.
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28 md:py-36 px-6 sm:px-12 md:px-24 flex flex-col items-center justify-center text-center">
      
      {/* Decorative Top Background Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#363c98]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* --- Indicador: NUESTROS PLANES --- */}
      <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms] duration-700">
        <span className="w-10 sm:w-16 h-[2px] bg-primary rounded-full"></span>
        <span className="text-primary font-bold tracking-[0.2em] text-xs sm:text-sm uppercase">
          NUESTROS PLANES
        </span>
        <span className="w-10 sm:w-16 h-[2px] bg-primary rounded-full"></span>
      </div>

      {/* --- Título Principal --- */}
      <h1 className="text-[#363C98] font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight max-w-5xl mx-auto mb-8 animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms] duration-700">
        Tu cambio, esta vez <br /> <span className="text-[#363C98]">de verdad</span>
      </h1>

      {/* --- Subtítulo --- */}
      <p className="text-primary font-bold text-lg sm:text-2xl md:text-3xl max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:500ms] duration-700">
        Un programa de nutrición y entreno para lograr tu objetivo y mantener resultados.
      </p>

      {/* --- Botón con Degradado --- */}
      <div className="flex flex-col items-center justify-center animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:700ms] duration-700">
        <button
          onClick={handleScrollToPlans}
          className="relative group overflow-hidden bg-gradient-to-r from-[#FF690B] to-[#363C98] text-white px-10 sm:px-14 py-4 sm:py-5 rounded-full font-bold text-xl sm:text-2xl shadow-xl hover:shadow-[#FF690B]/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          {/* Inner hover flash effect */}
          <span className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          Reserva tu plaza
        </button>

        {/* --- Subtexto --- */}
        <span className="mt-4 text-slate-400 text-sm sm:text-base font-medium tracking-wide">
          Plazas limitadas
        </span>
      </div>

      {/* Simple animations injection */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
}
