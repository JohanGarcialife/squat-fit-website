'use client'
import Image from 'next/image'
import React from 'react'
import { FaCheck } from 'react-icons/fa'
import LandingButton from '../../components/LandingButton';
import useInView from '@/hooks/useInView';

const STEPS = [
  { n: 1, icon: '/icons/edit_document.png', alt: 'Formulario', strong: 'Rellenas el formulario', rest: ' y nos cuentas tu situación' },
  { n: 2, icon: '/icons/contract_edit.png', alt: 'Videollamada', strong: 'Revisamos tu caso', rest: ' y agendamos una llamada' },
  { n: 3, icon: '/icons/muscle.png', alt: 'Acompañamiento', strong: 'Diseñamos tu plan', rest: ' y empiezas con el acompañamiento' },
];

// Cada tarjeta tiene su propio detector: anima al entrar ELLA en pantalla.
function StepCard({ step }) {
  const [ref, visible] = useInView(0.8);
  return (
    <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
      <div
        ref={ref}
        className={`relative bg-white rounded-2xl md:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] md:shadow-xl p-8 flex flex-col items-center justify-center min-h-[260px] w-full max-w-[300px] md:max-w-none md:w-[90%] lg:w-[80%] border border-gray-100 mx-auto transition-all duration-500 ease-out hover:scale-105 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className='flex flex-row items-center justify-center gap-2 mb-4 md:mb-4'>
          <span className='w-8 h-8 rounded-full bg-primary/10 text-primary hidden md:flex items-center justify-center font-bold'>{step.n}</span>
          <p className='text-primary text-[32px] md:text-2xl font-bold'>Paso {step.n}</p>
        </div>
        {/* Icono: aparece con un pequeño rebote tras la tarjeta */}
        <div
          style={{ transitionDelay: `${visible ? 200 : 0}ms` }}
          className={`relative mb-5 w-[76px] h-[76px] md:w-16 md:h-16 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <Image src={step.icon} fill className='object-contain' alt={step.alt} />
        </div>
        <p className='text-black md:text-gray-800 font-normal md:font-medium text-[15px] md:text-lg leading-snug'>
          <strong>{step.strong}</strong>{step.rest}
        </p>
      </div>
    </div>
  );
}

// Conector móvil: la línea se revela desde el centro y el check aparece con
// rebote. Ratio bajo (0.65) para que dispare cuando el conector está más
// centrado en pantalla y se vea la animación al llegar a él con el scroll.
function MobileConnector() {
  const [ref, visible] = useInView(0.65);
  return (
    <div ref={ref} className="flex md:hidden items-center justify-center w-full py-3 relative z-0">
      <div
        className={`w-[160px] h-1.5 bg-primary rounded-full origin-center transition-transform duration-500 ease-out ${
          visible ? 'scale-x-100' : 'scale-x-0'
        }`}
      ></div>
      <div
        style={{ transitionDelay: `${visible ? 250 : 0}ms` }}
        className={`w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          visible ? 'scale-100' : 'scale-0'
        }`}
      >
        <FaCheck className="text-white text-[16px]" />
      </div>
    </div>
  );
}

export default function HowItWorks() {
  // Detector para la línea horizontal de escritorio
  const [lineRef, lineVisible] = useInView(0.5);

  return (
    <div className='w-full py-16 px-4 flex flex-col items-center bg-white'>
      <h2 className='text-[#3932C0] text-[34px] leading-[1.1] md:text-5xl font-bold text-center mb-12 max-w-[320px] md:max-w-none mx-auto'>
        ¿Cómo funciona <br className="md:hidden" /> el programa?
      </h2>

      <div ref={lineRef} className='flex flex-col md:flex-row justify-center items-center w-full max-w-6xl relative gap-2 md:gap-0'>

        {/* Línea conectora de escritorio: se revela desde el centro hacia los lados */}
        <div
          className={`hidden md:block absolute top-[58%] left-[15%] w-[70%] h-1 bg-primary z-0 origin-center transition-transform duration-700 ease-out ${
            lineVisible ? 'scale-x-100' : 'scale-x-0'
          }`}
        ></div>

        {/* Checks de escritorio: anclados a la línea, centrados en los huecos
            entre tarjetas (33% y 66% del ancho de la fila) */}
        {[33.33, 66.66].map((leftPct, i) => (
          <div
            key={i}
            style={{ left: `${leftPct}%`, transitionDelay: lineVisible ? `${450 + i * 130}ms` : '0ms' }}
            className={`hidden md:flex w-9 h-9 rounded-[12px] bg-primary shadow-md border-2 border-white items-center justify-center absolute top-[58%] -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              lineVisible ? 'scale-100' : 'scale-0'
            }`}
          >
            <FaCheck className='text-white text-sm' />
          </div>
        ))}

        <StepCard step={STEPS[0]} />
        <MobileConnector />
        <StepCard step={STEPS[1]} />
        <MobileConnector />
        <StepCard step={STEPS[2]} />

      </div>

      <LandingButton variant="orange" size="lg" autoShine className='mt-12 w-full max-w-[300px] md:max-w-none md:w-auto'>
        Aplicar al programa
      </LandingButton>
    </div>
  )
}
