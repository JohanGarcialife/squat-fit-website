'use client';

import React from 'react';

export default function FinalCTA() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#363C98] py-20 sm:py-24 px-6 sm:px-12 md:px-24 flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-white/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
        
        {/* --- Título Principal --- */}
        <h2 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl leading-[1.2] tracking-tight">
          Tu transformación empieza hoy
        </h2>

        {/* --- Botón Blanco CTA --- */}
        <div>
          <button
            onClick={handleScrollToPlans}
            className="bg-white text-[#FF690B] px-10 sm:px-14 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl shadow-lg hover:shadow-white/10 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Reserva tu plaza
          </button>
        </div>

      </div>
    </section>
  );
}
