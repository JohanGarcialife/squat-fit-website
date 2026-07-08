"use client";
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useWindowSize from '@/hooks/UseWindowSize';
import useSlickWrapSpeed from '@/hooks/useSlickWrapSpeed';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

const testimonials = [
    {
        name: 'Elena Armada',
        text: 'Gracias a ver resultados con el curso he ganado seguridad en mí misma y motivación para superarme, disfrutando del proceso.',
        image: '/resenasAvatar/1 Elena Armada 1.png',
        rating: 5,
    },
    {
        name: 'Manuel López',
        text: 'Ahora sé entrenar y comer de forma óptima para mis objetivos y me siento mucho más motivado.',
        image: '/resenasAvatar/2 Manuel Lopez 1.png',
        rating: 5,
    },
    {
        name: 'Ana Béjar',
        text: 'Me ha dado los conocimientos para diseñar mi dieta y entrenamiento adaptados a mi ritmo de vida.',
        image: '/resenasAvatar/3 Ana Bejar 1.png',
        rating: 5,
    },
    {
        name: 'Diego Villaroel',
        text: 'He logrado mis objetivos físicos por primera vez y, sobre todo, he adquirido el conocimiento para seguir mejorando por mi cuenta.',
        image: '/resenasAvatar/4 Diego Villaroel 1.png',
        rating: 5,
    },
    {
        name: 'Ane Ayerbe',
        text: 'No solo me ayudó a mejorar físicamente, también ha sido clave para mi bienestar físico y mental.',
        image: '/resenasAvatar/5 Ane Ayerbe 1.png',
        rating: 5,
    },
    {
        name: 'José Pascual',
        text: 'Un curso muy completo, con bases claras para ganar masa muscular y muchos ejemplos prácticos.',
        image: '/resenasAvatar/6 Jose Pascual 1.png',
        rating: 5,
    },
    {
        name: 'Susana Coll',
        text: 'Me ha servido mucho para guiar mejor a mis clientes y explicar cómo perder grasa con una alimentación equilibrada y sostenible.',
        image: '/resenasAvatar/7 Susana Coll 1.png',
        rating: 5,
    },
    {
        name: 'Eva Bernard',
        text: 'He aprendido a perder grasa sin pasar hambre y a entender cómo influye la alimentación en mi cuerpo.',
        image: '/resenasAvatar/8 Eva Bernard 1.png',
        rating: 5,
    },
];

const TestimonialCarousel = () => {
    const sliderRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
     const { width } = useWindowSize();
     const { speed, onBeforeChange, next, prev } = useSlickWrapSpeed(testimonials.length, sliderRef);

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

   // Configuración por ancho real (móvil primero): el motor "responsive" de
   // slick no aplicaba en móvil y salían 3 tarjetas con avatares aplastados.
   const w = width || 0;
   const settings = {
     className: 'center',
     centerMode: true,
     infinite: true,
     centerPadding: w >= 1024 ? '0px' : w >= 640 ? '60px' : '30px',
     slidesToShow: w >= 1024 ? 3 : 1,
     speed,
     beforeChange: onBeforeChange,
     arrows: false,
     cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
   };

    return ( 
        <div className="w-screen py-16 bg-white">
            <div className="w-full max-w-7xl mx-auto px-4">
                <div>
                   <h2 className="text-secondary font-bold text-center text-5xl md:text-6xl mb-12">Lo que dicen mis clientes</h2>
                    <div className="relative">
                        <Slider {...settings} ref={sliderRef}>
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer px-3 py-5 outline-none"
                                    onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
                                >
                                    <div className="bg-[#3932C01A] h-full w-full max-w-[420px] mx-auto p-8 rounded-3xl shadow-lg border border-[#3932C0]/15 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center min-h-[320px]">
                                        <div className="relative w-24 h-24 mb-6 flex-shrink-0 rounded-full overflow-hidden border-4 border-violet-100">
                                            <Image
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-gray-800">
                                            {testimonial.name}
                                        </h3>
                                        <div className="text-yellow-400 mb-4 text-lg">
                                            {'★'.repeat(testimonial.rating)}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed flex-grow">
                                            {testimonial.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </Slider>

                        {/* Flechas circulares laterales: fondo naranja suave, icono naranja principal */}
                        <button
                            onClick={prev}
                            aria-label="Anterior"
                            className="cursor-pointer absolute top-1/2 left-0 lg:left-[-10px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button
                            onClick={next}
                            aria-label="Siguiente"
                            className="cursor-pointer absolute top-1/2 right-0 lg:right-[-10px] -translate-y-1/2 z-20 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCarousel;
