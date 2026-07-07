'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const ImageComparisonSlider = (props) => {
  const {
    beforeSrc,
    afterSrc,
    text,
    isActive = true,
    beforeGrayscale = 0.5,
    beforeTitle = 'Versión clásica',
    afterTitle = 'Versión Squad Fit',
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  // El arrastre sigue vivo aunque el cursor/dedo salga de la foto:
  // mientras dura, escuchamos el movimiento en toda la ventana y solo
  // se suelta al levantar el botón o el dedo.
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!containerRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (clientX === undefined) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPosition = ((clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, newPosition)));
    };
    const handleStop = () => setIsDragging(false);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleStop);
    window.addEventListener('pointercancel', handleStop);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleStop);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleStop);
      window.removeEventListener('pointercancel', handleStop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleStop);
    };
  }, [isDragging]);

  const startDragging = (e) => {
    if (!isActive) return;
    if (e.cancelable) e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="relative mx-auto w-full sm:w-[390px] lg:w-[460px] group">
      {/* Subtítulo encima de la foto: acompaña a la tarjeta */}
      {text && (
        <div className="mb-4 mx-auto max-w-[92%] bg-white text-secondary font-semibold text-center text-base md:text-xl p-3 rounded-xl shadow-lg border border-gray-200 select-none">
          <p>{text}</p>
        </div>
      )}

      {/* Foto comparadora */}
      <div
        ref={containerRef}
        className="relative w-full h-[385px] sm:h-[485px] lg:h-[570px] rounded-[45px] overflow-hidden shadow-2xl select-none touch-none"
      >
        {/* Imagen del 'Después' (base, lado derecho) */}
        <Image
          src={afterSrc}
          alt="Después"
          fill
          className="object-cover pointer-events-none"
          priority
        />

        {/* Etiquetas del 'Después': viven en el lado derecho del divisor,
            así desaparecen si arrastras del todo a la derecha */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <span className="absolute top-6 right-7 text-white font-bold text-sm sm:text-base uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)] select-none">
            Después
          </span>
          <span className="absolute bottom-6 right-7 text-white font-semibold text-xs sm:text-sm bg-black/35 backdrop-blur-sm px-3 py-1 rounded-full drop-shadow select-none">
            {afterTitle}
          </span>
        </div>

        {/* Imagen del 'Antes' (recortada al lado izquierdo, con B/N suave)
            y sus etiquetas: desaparecen si arrastras del todo a la izquierda */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt="Antes"
            fill
            className="object-cover"
            style={{ filter: `grayscale(${beforeGrayscale})` }}
            priority
          />
          <span className="absolute top-6 left-7 text-white font-bold text-sm sm:text-base uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)] select-none">
            Antes
          </span>
          <span className="absolute bottom-6 left-7 text-white font-semibold text-xs sm:text-sm bg-black/35 backdrop-blur-sm px-3 py-1 rounded-full drop-shadow select-none">
            {beforeTitle}
          </span>
        </div>

        {/* Divisor arrastrable */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30"
          style={{ left: `${sliderPosition}%`, touchAction: 'none' }}
          onPointerDown={startDragging}
          onTouchStart={startDragging}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-300 ">
            {/* SVG para el ícono de flechas del divisor */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-switch-horizontal"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 3l4 4l-4 4" /><path d="M10 7l10 0" /><path d="M8 13l-4 4l4 4" /><path d="M4 17l9 0" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;
