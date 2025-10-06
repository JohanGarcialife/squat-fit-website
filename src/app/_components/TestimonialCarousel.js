"use client";
import React from 'react';
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

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow before:!content-[""] !w-10 !h-10`}
      style={{ 
        ...style, 
        display: "block",
        right: "-50px",
        zIndex: 1
      }}
      onClick={onClick}
    >
      <div className=" flex items-center text-gris justify-center">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="40"  height="40"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 4l3 8l-3 8" /></svg>
      </div>
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow before:!content-[""] !w-10 !h-10`}
      style={{ 
        ...style, 
        display: "block",
        left: "-50px",
        zIndex: 1
      }}
      onClick={onClick}
    >
      <div className=" flex items-center text-gris justify-center">
       <svg  xmlns="http://www.w3.org/2000/svg"  width="40"  height="40"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 20l-3 -8l3 -8" /></svg>
      </div>
    </div>
  );
}

const TestimonialCarousel = () => {
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "60px",
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "40px",
          arrows: false,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "20px",
          arrows: false,
        }
      }
    ]
  };

  return (
    <div className="w-full py-16 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4">
       
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="px-3">
              <div className="bg-[#3932C01A] h-full w-[420px] p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300  flex flex-col items-center text-center">
                <div className="relative  mb-6">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    width={80} 
                    height={80} 
                    className="rounded-full h-24 w-24 mx-auto border-4 border-violet-100"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{testimonial.name}</h3>
                <div className="text-yellow-400 mb-4 text-lg">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="text-gray-600 leading-relaxed flex-grow">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default TestimonialCarousel;