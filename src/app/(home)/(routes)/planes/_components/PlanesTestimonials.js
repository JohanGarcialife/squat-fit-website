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

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '0px',
    slidesToShow: isMobile ? 1 : 3,
    speed: 500,
    arrows: false,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '20px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '40px',
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '60px',
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          centerMode: true,
          centerPadding: '0px',
        },
      },
    ],
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
            <span className="w-10 sm:w-16 h-[2px] bg-primary rounded-full"></span>
            <span className="text-primary font-bold tracking-[0.2em] text-xs sm:text-sm uppercase">
              TESTIMONIOS
            </span>
            <span className="w-10 sm:w-16 h-[2px] bg-primary rounded-full"></span>
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

          {/* --- Flechas de Navegación --- */}
          {isMobile ? (
            <div className="flex items-center justify-between mt-8 max-w-[200px] mx-auto">
              <button
                className="cursor-pointer p-3 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                onClick={() => sliderRef.current && sliderRef.current.slickPrev()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                className="cursor-pointer p-3 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                onClick={() => sliderRef.current && sliderRef.current.slickNext()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          ) : (
            <>
              <button
                className="cursor-pointer absolute top-1/2 left-[-20px] lg:left-[-40px] -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg border border-slate-100 hover:scale-110 active:scale-95 transition-all text-[#363C98]"
                onClick={() => sliderRef.current && sliderRef.current.slickPrev()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                className="cursor-pointer absolute top-1/2 right-[-20px] lg:right-[-40px] -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg border border-slate-100 hover:scale-110 active:scale-95 transition-all text-[#363C98]"
                onClick={() => sliderRef.current && sliderRef.current.slickNext()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </>
          )}

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
