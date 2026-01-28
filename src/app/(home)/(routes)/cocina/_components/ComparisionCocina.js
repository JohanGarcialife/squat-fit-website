'use client'
import React, { useState } from 'react'
import ImageComparisonSlider from './ImageComparisionSlider'
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComparisionCocina(props) {
  const { comparacion = [] } = props;
  const [currentIndex, setCurrentIndex] = useState(1); // Start at index 1 to show middle card

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === comparacion.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? comparacion.length - 1 : prevIndex - 1
    );
  };

  // Get previous, current, and next indices with wrapping
  const getPrevIndex = () => currentIndex === 0 ? comparacion.length - 1 : currentIndex - 1;
  const getNextIndex = () => currentIndex === comparacion.length - 1 ? 0 : currentIndex + 1;

  if (comparacion.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto px-16">
          {/* Previous Button - Positioned Absolutely */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-20"
            aria-label="Previous comparison"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Sliders Container - showing 3 cards */}
          <div className="flex items-center justify-center gap-6 w-full">
            {/* Previous Card (Left) */}
            <div 
              className="flex-1 opacity-50 scale-75 transition-all duration-500 cursor-pointer hover:opacity-70"
              onClick={handlePrev}
            >
              <ImageComparisonSlider
                beforeSrc={comparacion[getPrevIndex()].beforeSrc}
                afterSrc={comparacion[getPrevIndex()].afterSrc}
                text={comparacion[getPrevIndex()].text}
                isActive={false}
              />
            </div>

            {/* Current Card (Center) - Active */}
            <div className="flex-1 scale-100 transition-all duration-500 z-10">
              <ImageComparisonSlider
                beforeSrc={comparacion[currentIndex].beforeSrc}
                afterSrc={comparacion[currentIndex].afterSrc}
                text={comparacion[currentIndex].text}
                isActive={true}
              />
            </div>

            {/* Next Card (Right) */}
            <div 
              className="flex-1 opacity-50 scale-75 transition-all duration-500 cursor-pointer hover:opacity-70"
              onClick={handleNext}
            >
              <ImageComparisonSlider
                beforeSrc={comparacion[getNextIndex()].beforeSrc}
                afterSrc={comparacion[getNextIndex()].afterSrc}
                text={comparacion[getNextIndex()].text}
                isActive={false}
              />
            </div>
          </div>

          {/* Next Button - Positioned Absolutely */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-20"
            aria-label="Next comparison"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  )
}
