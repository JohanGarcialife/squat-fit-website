'use client'
import React, { useState } from 'react'
import ImageComparisonSlider from './ImageComparisionSlider'
import useWindowSize from '@/hooks/UseWindowSize';
import LandingButton from '../../components/LandingButton';

export default function Comparision(props) {
  const { width } = useWindowSize();
  const { comparacion = [] } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < comparacion.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (comparacion.length === 0) {
    return null; // O un componente de carga/placeholder
  }

  const currentComparison = comparacion[currentIndex];

  const slider = (
    <ImageComparisonSlider
      beforeSrc={currentComparison.beforeSrc}
      afterSrc={currentComparison.afterSrc}
      text={currentComparison.text}
      onNext={handleNext}
      onPrev={handlePrev}
      currentIndex={currentIndex}
      totalSlides={comparacion.length}
    />
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
            {slider}
          </div>
          {/* Botón debajo de las fotos */}
          <div className="w-full flex justify-center mt-10">
            <LandingButton variant="orange" size="lg" autoShine className="w-[70%] max-w-[340px]">
              Reserva tu plaza
            </LandingButton>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-row items-center justify-between gap-10">
          <div className="lg:w-1/2 w-full">
            {slider}
          </div>
          <div className="lg:w-1/2 h-full flex flex-col items-start justify-center lg:max-w-[510px] ">
            <p className="text-primary font-bold text-6xl">Un cambio físico que se mantiene</p>
            <p className="text-black text-lg mt-10">Aprende a mantenerte en forma, evitar el efecto rebote y progresar igual que cientos de miembros de nuestra comunidad 👇🏼</p>
            <div className="w-full flex items-center justify-start gap-10">
              <LandingButton variant="orange" size="lg" autoShine className="mt-10 text-xl lg:text-2xl">
                Reserva tu plaza
              </LandingButton>
              <div className="hidden items-center text-secondary mt-10 justify-center gap-3 cursor-pointer text-2xl">
                <p className="">Saber más</p>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 12l14 0" />
                  <path d="M15 16l4 -4" />
                  <path d="M15 8l4 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
