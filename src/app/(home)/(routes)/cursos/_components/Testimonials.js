"use client";
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

const Testimonials = () => {
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
 slidesToShow: isMobile ? 1 : 3,         // valor por defecto para pantallas grandes
  speed: 500,
  arrows: false,

  responsive: [
    /* Breakpoint más pequeño primero */
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
        slidesToShow: 2,
        centerMode: false,
      },
    },
  ],
};

    return ( 
        <div className="w-screen py-16 bg-white">
            <div className="w-full max-w-7xl mx-auto px-4">
                <div>
                    <div className='w-full flex flex-col items-center mb-12'>
                        <div className='bg-primary rounded-full w-fit px-4 py-1 mb-4'>
                            <p className='text-white font-bold text-2xl'>Testimonios</p>
                        </div>
                        <p className='font-bold text-secondary text-6xl'>Que te lo digan ellos</p>
                    </div>
                    <div className="relative">
                        {width < 480 ? <Slider {...settings} ref={sliderRef}>
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-5 "
                                    onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
                                >
                                    <div className="bg-[#3932C01A] h-full w-full lg:w-[420px] p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300  flex flex-col items-center text-center">
                                        <div className="relative  mb-6">
                                            <Image
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                width={80}
                                                height={80}
                                                className="rounded-full h-24 w-24 mx-auto border-4 border-violet-100"
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

                        :

                        <Slider {...settings} ref={sliderRef}>
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-5 "
                                    onClick={() => sliderRef.current && sliderRef.current.slickGoTo(index)}
                                >
                                    <div className="bg-[#3932C01A] h-full w-full lg:w-[420px] p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300  flex flex-col items-center text-center">
                                      <div className='flex gap-5 flex-row items-center '>

                                        <div className="relative  mb-6">
                                            <Image
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                width={80}
                                                height={80}
                                                className="rounded-full h-24 w-24 mx-auto border-4 border-violet-100"
                                            />
                                        </div>
                                        <div className='flex flex-col items-start'>


                                        <h3 className="text-xl font-bold  text-[#3932C0] ">
                                            {testimonial.name}
                                        </h3>
                                        <div className="text-primary mb-4 text-4xl">
                                            {'★'.repeat(testimonial.rating)}
                                        </div>
                                        </div>
                                      </div>

                                        <p className="text-gray-600 leading-relaxed flex-grow">
                                            {testimonial.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                        
                        }

                        {isMobile ? (
                            <div className="flex  items-center justify-between mt-4">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => sliderRef.current.slickPrev()}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40"
                                        height="40"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-left"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M13 20l-3 -8l3 -8" />
                                    </svg>
                                </div>
                                <div
                                    className="cursor-pointer"
                                    onClick={() => sliderRef.current.slickNext()}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40"
                                        height="40"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-right"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M11 4l3 8l-3 8" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="cursor-pointer absolute top-1/2 left-[-50px] -translate-y-1/2 z-10"
                                    onClick={() => sliderRef.current.slickPrev()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 20l-3 -8l3 -8" /></svg>
                                </div>
                                <div
                                    className="cursor-pointer absolute top-1/2 right-[-50px] -translate-y-1/2 z-10"
                                    onClick={() => sliderRef.current.slickNext()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 4l3 8l-3 8" /></svg>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
