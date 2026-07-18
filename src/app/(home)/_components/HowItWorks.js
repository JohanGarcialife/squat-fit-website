'use client'
import React from 'react'
import { FaPizzaSlice, FaDumbbell, FaGraduationCap } from 'react-icons/fa'
import LandingButton from '../../components/LandingButton';
import useInView from '@/hooks/useInView';

// La home transmite QUÉ vives en el programa (emoción + beneficio), no los pasos
// de alta (esos viven en /programa, "¿Cómo empezamos?"). Por eso son filas de
// beneficio horizontales con medallón de color alternando, no tarjetas-paso.
const BENEFITS = [
  {
    icon: FaPizzaSlice,
    title: 'Comes lo que te gusta',
    text: 'Sin dietas imposibles: un plan flexible con la comida real que disfrutas.',
    tint: 'bg-[#FFF6F0] border-[#FCE1CF]',
    medallion: 'bg-[#FF690B]',
  },
  {
    icon: FaDumbbell,
    title: 'Entrenas con criterio',
    text: 'Fuerza a tu nivel, entrenes en casa o en el gimnasio.',
    tint: 'bg-[#F3F3FC] border-[#E3E3F6]',
    medallion: 'bg-[#363C98]',
  },
  {
    icon: FaGraduationCap,
    title: 'Resultados que duran',
    text: 'Aprendes a mantenerlos por tu cuenta, con acompañamiento cada semana.',
    tint: 'bg-[#FFF6F0] border-[#FCE1CF]',
    medallion: 'bg-[#FF690B]',
  },
]

// Cada fila anima al entrar ELLA en pantalla, con un pequeño escalonado.
function BenefitRow({ benefit, index }) {
  const [ref, visible] = useInView(0.35)
  const { icon: Icon, title, text, tint, medallion } = benefit
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${visible ? index * 120 : 0}ms` }}
      className={`flex items-center gap-4 sm:gap-5 rounded-[18px] border p-4 sm:p-5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(54,60,152,0.06)] ${tint} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${medallion}`}>
        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight">{title}</h3>
        <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <div className='w-full py-16 sm:py-20 px-4 flex flex-col items-center bg-white'>
      <h2 className='text-[#3932C0] text-[34px] leading-[1.1] md:text-5xl font-bold text-center mb-4 max-w-[320px] md:max-w-none mx-auto'>
        ¿Cómo funciona <br className="md:hidden" /> el programa?
      </h2>
      <p className='text-slate-500 text-lg text-center mb-12 max-w-xl mx-auto'>
        Nutrición, entrenamiento y hábitos para transformar tu cuerpo y saber mantenerlo.
      </p>

      <div className='flex flex-col gap-3 w-full max-w-xl'>
        {BENEFITS.map((benefit, i) => (
          <BenefitRow key={benefit.title} benefit={benefit} index={i} />
        ))}
      </div>

      <LandingButton variant="orange" size="lg" autoShine href="/programa" className='mt-12 w-full max-w-[300px] md:max-w-none md:w-auto'>
        Unirme al programa
      </LandingButton>
    </div>
  )
}
