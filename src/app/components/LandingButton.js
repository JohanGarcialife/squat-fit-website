'use client';

import React from 'react';
import Link from 'next/link';

// Botón estándar de las landings SquadFit.
//
// Reúne el "lenguaje" de botones de la marca en un solo sitio:
//  - radio de 27px
//  - crecimiento 3% al posar el cursor + encogido al pulsar
//  - barrido de brillo de izquierda a derecha en hover
//  - cambio de color entre par principal ↔ claro:
//      naranja  #FF690B ↔ #FFEDE0
//      azul     #363C98 ↔ #E7E6FF
//  - autoShine: en pantallas táctiles el brillo cruza solo cada 4s
//    (para CTAs de venta; los hovers no existen en móvil)
//
// Uso:
//   <LandingButton variant="orange" size="lg" onClick={...}>Reserva tu plaza</LandingButton>
//   <LandingButton variant="blue" href="/cursos">Ver cursos</LandingButton>

// El barrido (sweep) usa un color que contraste con el fondo del botón:
// destello claro sobre botón oscuro, destello de color sobre botón claro.
const VARIANTS = {
  orange: {
    button: 'bg-[#FF690B] text-white hover:bg-[#FFEDE0] hover:text-[#FF690B] hover:shadow-[#FF690B]/30',
    sweep: 'bg-white/45',
  },
  'orange-light': {
    button: 'bg-[#FFEDE0] text-[#FF690B] hover:bg-[#FF690B] hover:text-white hover:shadow-[#FF690B]/30',
    sweep: 'bg-[#FF690B]/35',
  },
  blue: {
    button: 'bg-[#363C98] text-white hover:bg-[#E7E6FF] hover:text-[#363C98] hover:shadow-[#363C98]/30',
    sweep: 'bg-white/45',
  },
  'blue-light': {
    button: 'bg-[#E7E6FF] text-[#363C98] hover:bg-[#363C98] hover:text-white hover:shadow-[#363C98]/30',
    sweep: 'bg-[#363C98]/30',
  },
};

const SIZES = {
  md: 'px-6 py-2 text-lg sm:text-xl',
  lg: 'px-10 sm:px-12 py-4 text-lg sm:text-xl',
  xl: 'px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl',
};

export default function LandingButton({
  variant = 'orange',
  size = 'lg',
  autoShine = false,
  href,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.orange;
  const s = SIZES[size] ?? SIZES.lg;

  const buttonClass = `relative group overflow-hidden rounded-[27px] font-bold shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer ${v.button} ${s} ${className}`;

  const sweep = (
    <span
      className={`absolute inset-0 w-full h-full -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out ${v.sweep} ${
        autoShine ? 'landing-autoshine' : ''
      }`}
      aria-hidden="true"
    />
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={`inline-block text-center ${buttonClass}`} {...rest}>
        {sweep}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass} {...rest}>
      {sweep}
      {children}
    </button>
  );
}
