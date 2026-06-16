'use client';

import React from 'react';
import { ClipboardList, Pencil, Calendar, Phone, CheckCircle2, Dumbbell, ArrowRight, Check } from 'lucide-react';

export default function StepsSection() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      number: 'Paso 1',
      title: 'Rellenas el formulario',
      subtitle: 'y nos cuentas tu situación',
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background Decorative Accent */}
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#FF690B]/30" />
          {/* Main Document Icon */}
          <ClipboardList className="w-14 h-14 text-slate-600" strokeWidth={1.2} />
          {/* Pencil overlay */}
          <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-sm">
            <Pencil className="w-6 h-6 text-[#FF690B]" strokeWidth={2} />
          </div>
        </div>
      )
    },
    {
      number: 'Paso 2',
      title: 'Revisamos tu caso',
      subtitle: 'y agendamos una llamada',
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background Decorative Accent */}
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#FF690B]/30" />
          {/* Calendar Icon */}
          <Calendar className="w-14 h-14 text-slate-600" strokeWidth={1.2} />
          {/* Phone overlay */}
          <div className="absolute bottom-1 right-0 bg-white p-1 rounded-full shadow-md border border-slate-100">
            <div className="bg-[#363C98] text-white p-1.5 rounded-full">
              <Phone className="w-4 h-4" />
            </div>
          </div>
        </div>
      )
    },
    {
      number: 'Paso 3',
      title: 'Entras al programa',
      subtitle: 'y arrancamos',
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background Decorative Accent */}
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#FF690B]/30" />
          {/* Check List Icon */}
          <CheckCircle2 className="w-14 h-14 text-slate-600" strokeWidth={1.2} />
          {/* Dumbbell overlay */}
          <div className="absolute bottom-1 right-1 bg-[#363C98] p-1.5 rounded-full shadow-md text-white border border-white">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative bg-[#F8F9FC] py-20 sm:py-28 px-6 sm:px-12 md:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* --- Título Principal --- */}
        <h2 className="text-[#363C98] font-extrabold text-3xl sm:text-5xl md:text-6xl text-center mb-20 tracking-tight">
          ¿Cómo empezamos?
        </h2>

        {/* --- Contenedor de Pasos y Conectores --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl mb-16 relative gap-8 lg:gap-0">
          
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              {/* Tarjeta de Paso */}
              <div className="relative w-full lg:w-[30%] bg-white border border-slate-100 rounded-[32px] p-8 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(54,60,152,0.04)] z-10">
                <span className="text-[#FF690B] font-extrabold text-2xl sm:text-3xl mb-6">
                  {step.number}
                </span>
                
                <div className="mb-6 flex justify-center">
                  {step.icon}
                </div>

                <p className="text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
                  <span className="font-extrabold text-slate-900">{step.title}</span> {step.subtitle}
                </p>
              </div>

              {/* Conector (solo entre pasos) */}
              {idx < steps.length - 1 && (
                <>
                  {/* Desktop connector line */}
                  <div className="hidden lg:flex items-center justify-center flex-1 h-[4px] bg-[#FF690B] relative mx-4 min-w-[50px]">
                    <div className="w-8 h-8 rounded-full bg-[#FF690B] flex items-center justify-center shadow-md border-2 border-white">
                      <Check className="text-white w-4 h-4" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Mobile connector line */}
                  <div className="flex lg:hidden flex-col items-center justify-center h-16 w-[4px] bg-[#FF690B] relative my-2">
                    <div className="w-8 h-8 rounded-full bg-[#FF690B] flex items-center justify-center shadow-md border-2 border-white absolute top-1/2 -translate-y-1/2">
                      <Check className="text-white w-4 h-4" strokeWidth={3} />
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}

        </div>

        {/* --- Botón CTA --- */}
        <button
          onClick={handleScrollToPlans}
          className="bg-[#FF690B] text-white px-10 sm:px-12 py-4 rounded-full font-bold text-lg sm:text-xl shadow-lg hover:shadow-[#FF690B]/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          Reserva tu plaza
        </button>

        {/* --- Subtexto --- */}
        <span className="mt-4 text-slate-400 text-sm sm:text-base font-semibold tracking-wide text-center">
          Revisamos cada solicitud personalmente en 24-48 h.
        </span>

      </div>
    </section>
  );
}
