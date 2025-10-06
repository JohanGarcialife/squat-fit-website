'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const ImageComparisonSlider = ({ beforeSrc, afterSrc, captionText }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

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
    <div
      ref={containerRef}
      className="relative  w-full max-w-2xl mx-auto h-[800px] md:h-[600px] overflow-hidden rounded-[3rem] shadow-2xl group"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={(e) => handleMouseMove(e.touches[0])}
      onTouchEnd={handleMouseUp}
    >
      {/* Flechas de navegación (solo visuales en este ejemplo) */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer z-20">
        <svg className="h-10 w-10 text-gray-400/80 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer z-20">
        <svg className="h-10 w-10 text-gray-400/80 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

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
        className="absolute top-0 left-0 h-full pointer-events-none overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-300 transform transition-transform group-hover:scale-110">
          {/* SVG para el ícono de play del divisor */}
          <svg   xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-switch-horizontal"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 3l4 4l-4 4" /><path d="M10 7l10 0" /><path d="M8 13l-4 4l4 4" /><path d="M4 17l9 0" /></svg>
        </div>
      </div>

      {/* Etiqueta de texto informativa */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm max-w-36 text-secondary text-center p-4 rounded-xl shadow-lg border border-gray-200">
        Ana Béjar
después de 6 meses
      </div>
    </div>
  );
};

export default ImageComparisonSlider;