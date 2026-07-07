'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useResizeRemountKey from '@/hooks/useResizeRemountKey';
import useWindowSize from '@/hooks/UseWindowSize';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

const testimonials = [
  { quote: "Lo mejor no es que estén ricas. Es que ahora sé qué cenar sin improvisar cada día.", author: "Paloma Malagón" },
  { quote: "Antes me costaba comer suficiente proteína sin aburrirme. Ahora lo tengo fácil y rico.", author: "Pablo Guerra" },
  { quote: "Por fin tengo desayunos y postres que me quitan el antojo sin sentirme ‘a dieta’", author: "Silvia Cascos" },
  { quote: "Es el libro que uso de verdad. No el típico que compras y se queda en una estantería.", author: "Silvia Maqueda Ara" },
  { quote: "Me ha simplificado la semana. Repito 4–5 recetas, y aun así siento variedad.", author: "Cristina Pérez" },
  { quote: "Recetas prácticas y saciantes. Así mantengo el déficit sin pelearme con el hambre.", author: "Mariluz González" },
  { quote: "Me encanta tener opción de todo: dulce, salado, cenas rápidas y platos más completos.", author: "Estrella Haro" },
  { quote: "Cocino en 10–20 minutos y tengo comidas que encajan perfecto en mi día.", author: "Sonia Duarte" },
  { quote: "Pasé de comer ‘triste’ a platos que de verdad disfruto. Esa diferencia me cambió la constancia.", author: "Laura Molina" },
];

const TestimonialsCocina = () => {
  const sliderRef = useRef(null);
  const [current, setCurrent] = useState(0);
  // Re-montar el carrusel al terminar de redimensionar (slick no recalcula bien en vivo)
  const resizeKey = useResizeRemountKey();
  // Configuración según ancho real (móvil primero si aún es desconocido):
  // el motor "responsive" interno de slick no aplicaba bien en móvil.
  const { width } = useWindowSize();
  const w = width || 0;

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: w >= 1024 ? '0px' : w >= 640 ? '48px' : '38px',
    slidesToShow: w >= 1024 ? 3 : 1,
    speed: 500,
    arrows: false,
    cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    initialSlide: current,
    beforeChange: (_, next) => setCurrent(next),
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Antetítulo */}
        <div className="w-full flex flex-col items-center mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
            <p className="text-primary font-bold tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap">Testimonios</p>
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-center text-secondary">
            Que te lo digan ellos
          </h2>
        </div>

        {/* Carrusel */}
        <div className="relative max-w-6xl mx-auto">
          <Slider key={resizeKey} {...settings} ref={sliderRef}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="cursor-pointer px-2 py-6 outline-none"
                onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
              >
                {/* Altura fija para que el carrusel no salte entre reseñas */}
                <div className="bg-[#3932C01A] border border-[#3932C0]/15 rounded-3xl p-8 md:p-10 shadow-sm min-h-[280px] w-full max-w-[460px] mx-auto flex flex-col items-center justify-center text-center">
                  <blockquote>
                    <p className="text-lg md:text-xl text-secondary font-medium mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <footer className="text-indigo-700 font-semibold">
                      — {testimonial.author}
                    </footer>
                  </blockquote>
                </div>
              </div>
            ))}
          </Slider>

          {/* Flechas */}
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#FFEDE0] rounded-full p-1.5 text-[#FF690B] hover:scale-110 transition-all duration-200 z-20 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#FFEDE0] rounded-full p-1.5 text-[#FF690B] hover:scale-110 transition-all duration-200 z-20 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCocina;
