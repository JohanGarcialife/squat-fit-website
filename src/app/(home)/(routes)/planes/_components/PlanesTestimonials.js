'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useWindowSize from '@/hooks/UseWindowSize';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

const testimonials = [
  {
    name: 'Elena Armada',
    text: '“Gracias a ver resultados con el curso he ganado seguridad en mí misma y motivación para superarme, disfrutando del proceso.”',
    image: '/resenasAvatar/1 Elena Armada 1.png',
    rating: 4.5,
  },
  {
    name: 'Manuel López',
    text: '“Aprendí muchísimo con el curso. Ahora puedo entrenar y comer de forma óptima para lograr mis objetivos y me siento mucho más motivado.”',
    image: '/resenasAvatar/2 Manuel Lopez 1.png',
    rating: 4.5,
  },
  {
    name: 'Ana Béjar',
    text: '“Es increíble lo que aprendo con el curso y los conocimientos que me da para enfocarme en mis objetivos y poder diseñar mi dieta y mi entrenamiento adaptandolos a mi ritmo de vida.”',
    image: '/resenasAvatar/3 Ana Bejar 1.png',
    rating: 4.5,
  },
  {
    name: 'Diego Villaroel',
    text: '“He logrado mis objetivos físicos por primera vez y, sobre todo, he adquirido el conocimiento para seguir mejorando por mi cuenta.”',
    image: '/resenasAvatar/4 Diego Villaroel 1.png',
    rating: 5,
  },
  {
    name: 'Ane Ayerbe',
    text: '“No solo me ayudó a mejorar físicamente, también ha sido clave para mi bienestar físico y mental.”',
    image: '/resenasAvatar/5 Ane Ayerbe 1.png',
    rating: 5,
  },
];

export default function PlanesTestimonials() {
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowSize();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Configuración según ancho real (móvil primero si aún es desconocido):
  // el motor "responsive" interno de slick no aplicaba bien en móvil y salían
  // 3 tarjetas apretadas. speed bajo para que registre clics rápidos seguidos.
  const w = width || 0;
  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: w >= 1280 ? '0px' : w >= 640 ? '48px' : '36px',
    slidesToShow: w >= 1280 ? 3 : 1,
    speed: 300,
    arrows: false,
    waitForAnimate: false, // registra clics rápidos sin esperar a que acabe la animación
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-[#FF690B] text-lg sm:text-xl">
        {[...Array(5)].map((_, idx) => {
          const starValue = idx + 1;
          if (rating >= starValue) {
            return <span key={idx}>★</span>;
          } else if (rating > idx && rating < starValue) {
            return <span key={idx} className="relative inline-block overflow-hidden w-[0.5em] select-none">★<span className="absolute left-[0.5em] overflow-hidden text-slate-300">☆</span></span>;
          } else {
            return <span key={idx} className="text-[#FF690B]/30">☆</span>;
          }
        })}
      </div>
    );
  };

  return (
    <section className="relative w-screen py-20 sm:py-28 bg-white overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* --- Cabecera --- */}
        <div className="w-full flex flex-col items-center mb-16 text-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
            <span className="text-primary font-bold tracking-[0.2em] text-base sm:text-3xl uppercase whitespace-nowrap">
              TESTIMONIOS
            </span>
            <span className="w-8 sm:w-20 h-[2px] bg-primary rounded-full"></span>
          </div>
          <h2 className="text-[#363C98] font-extrabold text-4xl sm:text-6xl tracking-tight mt-2">
            Que te lo digan ellos
          </h2>
        </div>

        {/* --- Slider Container --- */}
        <div className="relative px-2 sm:px-6">
          
          <Slider {...settings} ref={sliderRef}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="cursor-pointer px-2 py-6 outline-none"
                onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
              >
                <div className="testimonial-card h-full w-full max-w-[390px] sm:max-w-[420px] mx-auto p-6 sm:p-8 rounded-[28px] shadow-md border border-slate-100/50 flex flex-col justify-between min-h-[300px] text-left">
                  
                  {/* User Profile Info */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#363C98] truncate w-full">
                        {testimonial.name}
                      </h3>
                      <div className="mt-0.5">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-inherit leading-relaxed font-medium text-sm sm:text-base flex-grow">
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </Slider>

          {/* Flechas circulares laterales: fondo naranja suave, icono naranja principal */}
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickPrev()}
            aria-label="Anterior"
            className="cursor-pointer absolute top-1/2 left-0 lg:left-[-20px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-2 shadow-md hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickNext()}
            aria-label="Siguiente"
            className="cursor-pointer absolute top-1/2 right-0 lg:right-[-20px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-2 shadow-md hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

        </div>

      </div>

      {/* Dynamic styles to handle active/faded card styling */}
      <style jsx global>{`
        .testimonial-card {
          background-color: #F8F9FC;
          color: #64748B;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slick-slide.slick-current .testimonial-card {
          background-color: #ECEDFC;
          color: #363C98;
          box-shadow: 0 20px 40px rgba(54, 60, 152, 0.08);
          border-color: #ECEDFC;
        }
      `}</style>
    </section>
  );
}
