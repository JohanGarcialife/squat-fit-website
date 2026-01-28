'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const ImageComparisonSlider = (props) => {
  const { beforeSrc, afterSrc, text, isActive = true } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!isActive) return; // Only allow dragging on active slider
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current || !isActive) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newPosition = ((e.clientX - rect.left) / rect.width) * 100;

    newPosition = Math.max(0, Math.min(100, newPosition));
    setSliderPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative mx-auto lg:w-[460px] sm:w-[390px] sm:h-[485px] w-[290px] h-[385px] lg:h-[570px] overflow-visible group">
      {/* Wrapper interior con border-radius y overflow-hidden */}
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-[70px] overflow-hidden shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={(e) => handleMouseMove(e.touches[0])}
        onTouchEnd={handleMouseUp}
      >
        {/* Imagen del 'Antes' */}
        <Image
          src={beforeSrc}
          alt="Antes"
          fill
          className="object-cover pointer-events-none"
          priority
        />

        {/* Imagen del 'Después' */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={afterSrc}
            alt="Después"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Divisor arrastrable */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-300 ">
            {/* SVG para el ícono de play del divisor */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-switch-horizontal"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 3l4 4l-4 4" /><path d="M10 7l10 0" /><path d="M8 13l-4 4l4 4" /><path d="M4 17l9 0" /></svg>
          </div>
        </div>

      </div>
        {/* Etiqueta de texto informativa */}
        <div className="absolute right-[25%] text-xs md:text-base -bottom-5 sm:-bottom-10 sm:right-[30%] md:bottom-20 z-40 md:-right-20 bg-white backdrop-blur-sm max-w-40 text-secondary text-center p-4 rounded-xl shadow-lg border border-gray-200 break-words">
          <p>

          {text}
          </p>
        </div>
    </div>
  );
};

export default ImageComparisonSlider;