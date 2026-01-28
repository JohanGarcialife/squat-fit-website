'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsCocina = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at index 1 to show middle card

  const testimonials = [
    {
      quote: "Por fin tengo desayunos y postres que me quitan el antojo sin sentirme a dieta",
      author: "Silvia Cascos"
    },
    {
      quote: "Lo mejor no es que estén ricas. Es que ahora sé que cenar sin improvisar cada día.",
      author: "Paloma Malagón"
    },
    {
      quote: "Antes me costaba comer suficiente proteína sin aburrirme. Ahora lo tengo fácil y rico.",
      author: "Pablo Guerra"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Get previous, current, and next indices with wrapping
  const getPrevIndex = () => currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
  const getNextIndex = () => currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold ">
            Reseñas reales
          </span>
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-indigo-900 mb-12">
          Que te lo digan ellos
        </h2>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-6">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Testimonials Container - showing 3 cards */}
            <div className="flex items-center justify-center gap-4 w-full max-w-5xl">
              {/* Previous Card (Left) */}
              <div 
                className="flex-1 opacity-50 scale-90 transition-all duration-500 cursor-pointer hover:opacity-70"
                onClick={prevSlide}
              >
                <div className="bg-indigo-50 rounded-2xl p-6 md:p-8 shadow-sm">
                  <blockquote className="text-center">
                    <p className="text-base md:text-lg text-indigo-900 font-medium mb-4">
                      "{testimonials[getPrevIndex()].quote}"
                    </p>
                    <footer className="text-sm text-indigo-700 font-semibold">
                      — {testimonials[getPrevIndex()].author}
                    </footer>
                  </blockquote>
                </div>
              </div>

              {/* Current Card (Center) - Active */}
              <div className="flex-1 scale-105 transition-all duration-500 z-10">
                <div className="bg-indigo-50 rounded-2xl p-8 md:p-12 shadow-lg">
                  <blockquote className="text-center">
                    <p className="text-lg md:text-xl text-indigo-900 font-medium mb-6">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    <footer className="text-indigo-700 font-semibold">
                      — {testimonials[currentIndex].author}
                    </footer>
                  </blockquote>
                </div>
              </div>

              {/* Next Card (Right) */}
              <div 
                className="flex-1 opacity-50 scale-90 transition-all duration-500 cursor-pointer hover:opacity-70"
                onClick={nextSlide}
              >
                <div className="bg-indigo-50 rounded-2xl p-6 md:p-8 shadow-sm">
                  <blockquote className="text-center">
                    <p className="text-base md:text-lg text-indigo-900 font-medium mb-4">
                      "{testimonials[getNextIndex()].quote}"
                    </p>
                    <footer className="text-sm text-indigo-700 font-semibold">
                      — {testimonials[getNextIndex()].author}
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCocina;
