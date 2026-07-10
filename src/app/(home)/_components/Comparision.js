'use client'
import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import BeforeAfterSlider from '../../components/BeforeAfterSlider'
import useWindowSize from '@/hooks/UseWindowSize';
import useResizeRemountKey from '@/hooks/useResizeRemountKey';
import useSlickWrapSpeed from '@/hooks/useSlickWrapSpeed';
import LandingButton from '../../components/LandingButton';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

export default function Comparision(props) {
  const { width } = useWindowSize();
  const { comparacion = [] } = props;
  const sliderRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const resizeKey = useResizeRemountKey();
  const { speed, onBeforeChange, next, prev } = useSlickWrapSpeed(comparacion.length, sliderRef);

  if (comparacion.length === 0) {
    return null;
  }

  // Mismo comportamiento que el comparador de recetas (cocina): centerMode con
  // escalado (la central grande, las laterales encogidas y asomándose) y fundido
  // en los bordes. Peek fino en iPhone (una línea) y ~1/4 en desktop.
  const w = width || 0;
  const settings = {
    className: 'center comparision-carousel',
    centerMode: true,
    infinite: true,
    centerPadding: w >= 1024 ? '20%' : w >= 640 ? '16%' : '15%',
    slidesToShow: 1,
    arrows: false,
    swipe: false,
    draggable: false,
    speed,
    cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    beforeChange: (cur, idx) => { setCurrent(idx); onBeforeChange(cur, idx); },
  };

  // Flechas grises (la sección tiene fondo crema), sobre el lateral difuminado.
  const arrowBtn = 'absolute top-1/2 -translate-y-1/2 z-20 cursor-pointer bg-slate-100 text-slate-500 rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200';

  const carousel = (
    <div className="w-full max-w-[520px] lg:max-w-none mx-auto">
      <div className="relative">
        <Slider key={resizeKey} ref={sliderRef} {...settings}>
          {comparacion.map((item, index) => (
            <div key={index} className="px-1 py-4 outline-none">
              <BeforeAfterSlider
                beforeSrc={item.beforeSrc}
                afterSrc={item.afterSrc}
                isActive={index === current}
                shadowClass="shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]"
                sizes="(min-width: 1024px) 55vw, (min-width: 640px) 365px, 70vw"
                priority={index === 0}
              />
            </div>
          ))}
        </Slider>

        {/* Fundido a crema sobre las laterales que asoman (más estrecho que el
            peek para que sí se vea el borde de la foto vecina) */}
        <div className="absolute inset-y-0 left-0 w-[4%] sm:w-[9%] lg:w-[12%] bg-gradient-to-r from-[#FFF9F2] via-[#FFF9F2]/60 to-transparent z-[15] pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 w-[4%] sm:w-[9%] lg:w-[12%] bg-gradient-to-l from-[#FFF9F2] via-[#FFF9F2]/60 to-transparent z-[15] pointer-events-none" aria-hidden="true" />

        <button onClick={prev} aria-label="Anterior" className={`${arrowBtn} left-1 sm:left-2`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button onClick={next} aria-label="Siguiente" className={`${arrowBtn} right-1 sm:right-2`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Caption debajo de la foto (no la tapa), más grande y centrado */}
      {comparacion[current]?.text && (
        <div className="mt-2 flex justify-center">
          <div className="bg-white text-secondary font-semibold text-center text-lg md:text-xl px-6 py-3.5 rounded-2xl shadow-lg border border-gray-200 max-w-[92%] select-none">
            {comparacion[current].text}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#FFF9F2] px-5 xl:px-32 w-full flex flex-col lg:flex-row items-center justify-between py-20">
      {width < 1024 ? (
        <>
          <div className="w-full flex flex-col items-center justify-center mb-10">
            <p className="text-primary text-center font-bold text-4xl">
              Un cambio físico que se mantiene
            </p>
            <p className="text-black text-center text-lg mt-8 max-w-[440px]">
              Aprende a mantenerte en forma, evitar el efecto rebote y progresar igual que cientos de miembros de nuestra comunidad 👇🏼
            </p>
          </div>
          <div className="w-full">
            {carousel}
          </div>
          {/* Botón debajo, con separación del comparador */}
          <div className="w-full flex justify-center mt-16">
            <LandingButton variant="orange" size="lg" autoShine className="w-[70%] max-w-[340px]">
              Reserva tu plaza
            </LandingButton>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-row items-center justify-between gap-10">
          <div className="lg:w-1/2 w-full">
            {carousel}
          </div>
          <div className="lg:w-1/2 h-full flex flex-col items-start justify-center lg:max-w-[510px] ">
            <p className="text-primary font-bold text-6xl">Un cambio físico que se mantiene</p>
            <p className="text-black text-2xl mt-10">Aprende a mantenerte en forma, evitar el efecto rebote y progresar igual que cientos de miembros de nuestra comunidad 👇🏼</p>
            <div className="w-full flex items-center justify-start gap-10">
              <LandingButton variant="orange" size="lg" autoShine className="mt-10 text-xl lg:text-2xl">
                Reserva tu plaza
              </LandingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
