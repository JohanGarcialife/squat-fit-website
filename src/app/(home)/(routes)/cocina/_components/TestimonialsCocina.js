'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '0px',
    slidesToShow: 3,
    speed: 500,
    arrows: false,
    responsive: [
      { breakpoint: 640, settings: { slidesToShow: 1, centerMode: true, centerPadding: '20px' } },
      { breakpoint: 1024, settings: { slidesToShow: 1, centerMode: true, centerPadding: '60px' } },
    ],
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Antetítulo */}
        <div className="w-full flex flex-col items-center mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 sm:w-20 h-[2px] bg-primary rounded-full"></span>
            <p className="text-primary font-bold tracking-[0.2em] text-xl sm:text-3xl uppercase">Testimonios</p>
            <span className="w-12 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-center text-secondary">
            Que te lo digan ellos
          </h2>
        </div>

        {/* Carrusel */}
        <div className="relative max-w-6xl mx-auto">
          <Slider {...settings} ref={sliderRef}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="cursor-pointer px-2 py-6 outline-none"
                onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
              >
                {/* Altura fija para que el carrusel no salte entre reseñas */}
                <div className="bg-[#3932C01A] rounded-3xl p-8 md:p-10 shadow-sm min-h-[280px] w-full max-w-[460px] mx-auto flex flex-col items-center justify-center text-center">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-md text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-200 z-20 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-md text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-200 z-20 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCocina;
