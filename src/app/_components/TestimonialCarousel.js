"use client";
import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonials = [
    {
        name: 'Carmen López',
        text: 'Conocí a María a través de ICNS y comencé a seguirla ya que me cautivó desde primera hora su conocimiento y la facilidad con la que me hace aprender.',
        image: '/Ellipse-3.png',
        rating: 5,
    },
    {
        name: 'Juan Carcelén',
        text: 'Necesitaba ayuda para bajar de peso, ganar masa muscular y comer sano y encontré su libro de cocina; estoy encantado y lo mejor: mantengo una dieta sin pasar hambre.',
        image: '/Group31.png',
        rating: 5,
    },
    {
        name: 'Cristina Martínez',
        text: 'Gracias a sus cursos he mejorado mi físico y mi estado cardiovascular. He aprendido a combinar los alimentos para que seguir una alimentación saludable sea fácil.',
        image: '/IMG-Maria-Hamlet-.png',
        rating: 5,
    },
    {
        name: 'Carmen López',
        text: 'Conocí a María a través de ICNS y comencé a seguirla ya que me cautivó desde primera hora su conocimiento y la facilidad con la que me hace aprender.',
        image: '/Ellipse-3.png',
        rating: 5,
    },
    {
        name: 'Juan Carcelén',
        text: 'Necesitaba ayuda para bajar de peso, ganar masa muscular y comer sano y encontré su libro de cocina; estoy encantado y lo mejor: mantengo una dieta sin pasar hambre.',
        image: '/Group31.png',
        rating: 5,
    },
    {
        name: 'Cristina Martínez',
        text: 'Gracias a sus cursos he mejorado mi físico y mi estado cardiovascular. He aprendido a combinar los alimentos para que seguir una alimentación saludable sea fácil.',
        image: '/IMG-Maria-Hamlet-.png',
        rating: 5,
    },
];

const TestimonialCarousel = () => {
    const sliderRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

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
        slidesToShow: 3,
        speed: 500,
        arrows: false, // Desactivamos las flechas por defecto
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 2,
                    centerMode: false,
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
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '40px',
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '20px',
                },
            },
        ],
    };

    return ( 
        <div className="w-screen py-16 bg-white">
            <div className="w-full max-w-7xl mx-auto px-4">
                <div>
                    <div className="relative">
                        <Slider {...settings} ref={sliderRef}>
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="px-3 py-5 ">
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

export default TestimonialCarousel;