'use client';

import React from 'react';
import Image from 'next/image';

export default function MethodSection() {
  return (
    <section className="relative bg-[#F8F9FC] py-20 sm:py-28 md:py-32 px-6 sm:px-12 md:px-24 overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#363c98]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* --- Columna Izquierda: Texto --- */}
        <div className="flex flex-col text-left space-y-6 sm:space-y-8 order-2 lg:order-1">
          <h2 className="text-[#363C98] font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.15] tracking-tight max-w-xl">
            El método para no volver a abandonar
          </h2>
          
          <p className="text-slate-700 text-lg sm:text-2xl font-medium leading-relaxed max-w-xl">
            Aprende a comer, a entrenar y a sostenerlo en el tiempo. Con estructura, entorno y acompañamiento real.
          </p>
        </div>

        {/* --- Columna Derecha: Imagen proporcionada --- */}
        <div className="flex justify-center items-center order-1 lg:order-2">
          
          <div className="relative w-full max-w-[420px] aspect-[4/5] sm:max-w-[500px]">
            <Image
              src="/PlanesHeroImage.png"
              alt="El método Squat Fit"
              fill
              priority
              sizes="(max-w-768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
