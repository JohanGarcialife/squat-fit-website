'use client';

import React from 'react';

export default function WhyWeFail() {
  return (
    <section className="relative w-full bg-[#363C98] py-24 sm:py-32 px-6 sm:px-12 md:px-24 flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* Subtle background glow to add depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
        
        {/* --- Título Principal --- */}
        <h2 className="text-white font-extrabold text-3xl sm:text-5xl md:text-6xl leading-[1.2] tracking-tight">
          No falla el plan. Falla todo lo demás
        </h2>

        {/* --- Subtítulo / Descripción --- */}
        <p className="text-white/90 font-medium text-lg sm:text-xl md:text-2xl max-w-2xl leading-relaxed">
          La mayoría no abandona por falta de información, sino por falta de estructura, mentalidad y acompañamiento.
        </p>

      </div>
    </section>
  );
}
