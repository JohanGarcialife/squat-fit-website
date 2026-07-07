'use client'
import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import ImageComparisonSlider from './ImageComparisionSlider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const Slider = dynamic(() => import('react-slick'), { ssr: false })

// Carrusel de comparaciones antes/después con deslizamiento real (react-slick,
// como los testimonios de Cursos). La receta central protagoniza y las
// laterales asoman por los bordes con un fundido a blanco.
// swipe/draggable desactivados para no interferir con el arrastre del
// comparador antes/después de la tarjeta central.
export default function ComparisionCocina(props) {
  const { comparacion = [] } = props
  const sliderRef = useRef(null)
  const [current, setCurrent] = useState(0)

  if (comparacion.length === 0) {
    return null
  }

  const settings = {
    className: 'center comparision-carousel',
    centerMode: true,
    infinite: true,
    centerPadding: '22%',
    slidesToShow: 1,
    speed: 500,
    arrows: false,
    swipe: false,
    draggable: false,
    beforeChange: (_, next) => setCurrent(next),
    responsive: [
      // Móvil: la central más grande y las laterales solo asomándose
      { breakpoint: 640, settings: { centerPadding: '7%', swipe: false, draggable: false } },
      { breakpoint: 1024, settings: { centerPadding: '14%', swipe: false, draggable: false } },
    ],
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative max-w-6xl mx-auto">
          <Slider {...settings} ref={sliderRef}>
            {comparacion.map((item, index) => (
              <div key={index} className="px-1 py-4 outline-none">
                <ImageComparisonSlider
                  beforeSrc={item.beforeSrc}
                  afterSrc={item.afterSrc}
                  text={item.text}
                  isActive={index === current}
                  beforeGrayscale={item.beforeGrayscale}
                  beforeTitle={item.beforeTitle}
                  afterTitle={item.afterTitle}
                />
              </div>
            ))}
          </Slider>

          {/* Fundido a blanco sobre las laterales */}
          <div className="absolute inset-y-0 left-0 w-[10%] sm:w-[15%] bg-gradient-to-r from-white via-white/60 to-transparent z-[15] pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-[10%] sm:w-[15%] bg-gradient-to-l from-white via-white/60 to-transparent z-[15] pointer-events-none" aria-hidden="true" />

          {/* Flechas */}
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-md text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-200 z-20 cursor-pointer"
            aria-label="Previous comparison"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => sliderRef.current && sliderRef.current.slickNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-md text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-200 z-20 cursor-pointer"
            aria-label="Next comparison"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  )
}
