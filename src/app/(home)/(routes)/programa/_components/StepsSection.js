'use client';

import React from 'react';
import { ClipboardList, Pencil, Calendar, Phone, CheckCircle2, Dumbbell, ArrowRight, Check } from 'lucide-react';
import LandingButton from '../../../../components/LandingButton';
import useInView from '@/hooks/useInView';

// Cada tarjeta tiene su propio detector: anima al entrar ELLA en pantalla.
// Ratio bajo (0.6): la tarjeta anima cuando está más centrada, DESPUÉS de que
// el conector de arriba (ratio alto) ya haya revelado su check.
function StepCard({ step }) {
  const [ref, visible] = useInView(0.6);
  return (
    <div
      ref={ref}
      className={`relative w-full lg:w-[30%] bg-white border border-slate-100 rounded-[32px] p-8 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(54,60,152,0.04)] z-10 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <span className="text-[#FF690B] font-extrabold text-2xl sm:text-3xl mb-6">
        {step.number}
      </span>

      {/* Icono: aparece con un pequeño rebote tras la tarjeta */}
      <div
        style={{ transitionDelay: visible ? '200ms' : '0ms' }}
        className={`mb-6 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {step.icon}
      </div>

      <p className="text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
        <span className="font-extrabold text-slate-900">{step.title}</span> {step.subtitle}
      </p>
    </div>
  );
}

// Conectores: la línea se revela desde el centro y el check aparece con rebote.
// Ratio alto (0.9) para que el check salga ANTES que la tarjeta siguiente.
// Van en componentes separados (uno por breakpoint) porque el que está oculto
// mide 0 y su detector nunca dispara, igual que en el HowItWorks de la home.
function DesktopConnector() {
  const [ref, visible] = useInView(0.9);
  return (
    <div ref={ref} className="hidden lg:flex items-center justify-center flex-1 h-8 relative mx-4 min-w-[50px]">
      <div
        className={`w-full h-[4px] bg-[#FF690B] origin-center transition-transform duration-500 ease-out ${
          visible ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
      <div
        style={{ transitionDelay: visible ? '120ms' : '0ms' }}
        className={`w-8 h-8 rounded-full bg-[#FF690B] flex items-center justify-center shadow-md border-2 border-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          visible ? 'scale-100' : 'scale-0'
        }`}
      >
        <Check className="text-white w-4 h-4" strokeWidth={3} />
      </div>
    </div>
  );
}

function MobileConnector() {
  const [ref, visible] = useInView(0.9);
  return (
    <div ref={ref} className="flex lg:hidden flex-col items-center justify-center h-16 w-8 relative my-2">
      <div
        className={`h-full w-[4px] bg-[#FF690B] origin-center transition-transform duration-500 ease-out ${
          visible ? 'scale-y-100' : 'scale-y-0'
        }`}
      />
      <div
        style={{ transitionDelay: visible ? '120ms' : '0ms' }}
        className={`w-8 h-8 rounded-full bg-[#FF690B] flex items-center justify-center shadow-md border-2 border-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          visible ? 'scale-100' : 'scale-0'
        }`}
      >
        <Check className="text-white w-4 h-4" strokeWidth={3} />
      </div>
    </div>
  );
}

export default function StepsSection() {
  const handleScrollToPlans = () => {
    const element = document.getElementById('shop-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Diferenciado de la home ("¿Cómo funciona el programa?"): aquí el flujo va
  // alineado con el funnel de llamada (reserva → plan → seguimiento semanal).
  const steps = [
    {
      number: 'Paso 1',
      title: 'Reservas tu llamada',
      subtitle: 'y nos cuentas tu caso',
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#FF690B]/30" />
          <Calendar className="w-14 h-14 text-slate-600" strokeWidth={1.2} />
          <div className="absolute bottom-1 right-0 bg-white p-1 rounded-full shadow-md border border-slate-100">
            <div className="bg-[#363C98] text-white p-1.5 rounded-full">
              <Phone className="w-4 h-4" />
            </div>
          </div>
        </div>
      )
    },
    {
      number: 'Paso 2',
      title: 'Diseñamos tu plan',
      subtitle: 'a tu medida',
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#FF690B]/30" />
          <ClipboardList className="w-14 h-14 text-slate-600" strokeWidth={1.2} />
          <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-sm">
            <Pencil className="w-6 h-6 text-[#FF690B]" strokeWidth={2} />
          </div>
        </div>
      )
    },
    {
      number: 'Paso 3',
      title: 'Empezamos juntos',
      subtitle: 'con seguimiento cada semana',
      icon: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#FF690B]/30" />
          <CheckCircle2 className="w-14 h-14 text-slate-600" strokeWidth={1.2} />
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
              <StepCard step={step} />

              {/* Conector (solo entre pasos) */}
              {idx < steps.length - 1 && (
                <>
                  <DesktopConnector />
                  <MobileConnector />
                </>
              )}
            </React.Fragment>
          ))}

        </div>

        {/* --- Botón CTA --- */}
        <LandingButton variant="orange" size="lg" autoShine onClick={handleScrollToPlans}>
          Unirme al programa
        </LandingButton>

        {/* --- Subtexto --- */}
        <span className="mt-4 text-slate-400 text-sm sm:text-base font-semibold tracking-wide text-center">
          Revisamos cada solicitud personalmente en 24-48 h.
        </span>

      </div>
    </section>
  );
}
