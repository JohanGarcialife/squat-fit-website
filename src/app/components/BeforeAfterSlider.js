'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// Comparador antes/después reutilizable (home y cocina comparten esto).
//
// Diferencias que se controlan por props (lo demás es idéntico):
//   - showTitles: badges descriptivos "versión clásica / versión Squad Fit"
//       (solo cocina; la home NO los lleva). Con ellos activos, la descripción
//       va ARRIBA y las etiquetas ANTES/DESPUÉS bajan ABAJO; sin ellos (home)
//       las etiquetas se quedan arriba como siempre.
//   - beforeGrayscale: B/N del lado "antes" (cocina 0.5; home 0 = color).
//   - El caption/subtítulo NO vive aquí: cada página lo coloca donde toca
//       (cocina ENCIMA, home DEBAJO).
//
// ANTES siempre a la IZQUIERDA (el 'después' es la base a la derecha y el
// 'antes' se recorta sobre él por la izquierda). El arrastre sobrevive aunque
// el dedo/cursor salga de la foto (escucha en toda la ventana mientras dura).
//
// Rendimiento: 'sizes' debe describir el ancho REAL de la foto en pantalla. Sin
// él, con 'fill', Next asume 100vw y sirve variantes de hasta 3840px para una
// foto que nunca pasa de ~460px. Y 'priority' solo debe ir en el primer slide:
// slick monta todos los slides (y clona con centerMode+infinite), así que
// ponerlo en todos hacía que el navegador precargara la galería entera.
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  isActive = true,
  beforeGrayscale = 0,
  showTitles = false,
  beforeTitle = 'Versión clásica',
  afterTitle = 'Versión Squad Fit',
  widthClass = 'w-full',
  shadow = true,
  shadowClass = 'shadow-2xl',
  sizes = '(min-width: 1024px) 60vw, 90vw',
  priority = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

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
    const stop = () => setIsDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stop);
    };
  }, [isDragging]);

  const startDragging = (e) => {
    if (!isActive) return;
    if (e.cancelable) e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${widthClass} h-[385px] sm:h-[485px] lg:h-[570px] rounded-[32px] overflow-hidden ${shadow ? shadowClass : ''} select-none touch-none`}
    >
      {/* Base: 'Después' (lado derecho) */}
      <Image
        src={afterSrc}
        alt="Después"
        fill
        sizes={sizes}
        className="object-cover pointer-events-none"
        priority={priority}
      />

      {/* Etiquetas del 'Después': recortadas al lado derecho del divisor, así
          desaparecen si arrastras del todo a la derecha */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <span className={`absolute ${showTitles ? 'bottom-5' : 'top-5'} right-6 text-white font-bold text-sm sm:text-base uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)] select-none`}>
          Después
        </span>
        {showTitles && (
          <span className="absolute top-5 right-4 text-white font-semibold text-[11px] sm:text-sm bg-black/60 px-3 py-1 rounded-full drop-shadow select-none">
            {afterTitle}
          </span>
        )}
      </div>

      {/* 'Antes' recortado al lado izquierdo, con sus etiquetas */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt="Antes"
          fill
          sizes={sizes}
          className="object-cover"
          style={beforeGrayscale ? { filter: `grayscale(${beforeGrayscale})` } : undefined}
          priority={priority}
        />
        <span className={`absolute ${showTitles ? 'bottom-5' : 'top-5'} left-6 text-white font-bold text-sm sm:text-base uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)] select-none`}>
          Antes
        </span>
        {showTitles && (
          <span className="absolute top-5 left-4 text-white font-semibold text-[11px] sm:text-sm bg-black/30 px-3 py-1 rounded-full drop-shadow select-none">
            {beforeTitle}
          </span>
        )}
      </div>

      {/* Divisor arrastrable */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30"
        style={{ left: `${sliderPosition}%`, touchAction: 'none' }}
        onPointerDown={startDragging}
        onTouchStart={startDragging}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 3l4 4l-4 4" /><path d="M10 7l10 0" /><path d="M8 13l-4 4l4 4" /><path d="M4 17l9 0" /></svg>
        </div>
      </div>
    </div>
  );
}
