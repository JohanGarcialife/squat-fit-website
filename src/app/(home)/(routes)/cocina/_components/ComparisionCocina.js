'use client'
import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import BeforeAfterSlider from '../../../../components/BeforeAfterSlider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useResizeRemountKey from '@/hooks/useResizeRemountKey'
import useWindowSize from '@/hooks/UseWindowSize'
import useSlickWrapSpeed from '@/hooks/useSlickWrapSpeed'
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
  // Re-montar el carrusel al terminar de redimensionar (slick no recalcula bien en vivo)
  const resizeKey = useResizeRemountKey()
  // Configuración según ancho real (móvil primero si aún es desconocido):
  // el motor "responsive" interno de slick no aplicaba bien en móvil.
  const { width } = useWindowSize()
  const w = width || 0
  // 200ms en los pasos normales y 300ms solo al dar la vuelta (último→primero)
  const { speed, onBeforeChange, next: goNext, prev: goPrev } = useSlickWrapSpeed(comparacion.length, sliderRef)
  // Efecto de "fin de scroll": al dar la vuelta, la tira rebota y se ilumina
  // brevemente el borde por el que se ha salido, para que se note el límite.
  const [edge, setEdge] = useState(null) // 'start' | 'end' | null
  const edgeTimer = useRef(null)

  if (comparacion.length === 0) {
    return null
  }

  const flashEdge = (side) => {
    setEdge(side)
    if (edgeTimer.current) clearTimeout(edgeTimer.current)
    edgeTimer.current = setTimeout(() => setEdge(null), 600)
  }

  const handleNext = () => {
    if (current === comparacion.length - 1) flashEdge('end')
    goNext()
  }

  const handlePrev = () => {
    if (current === 0) flashEdge('start')
    goPrev()
  }

  const settings = {
    className: 'center comparision-carousel',
    centerMode: true,
    infinite: true,
    // Móvil: la central grande (86%) y las laterales solo asomándose
    centerPadding: w >= 1024 ? '22%' : w >= 640 ? '14%' : '7%',
    slidesToShow: 1,
    speed,
    arrows: false,
    swipe: false,
    draggable: false,
    initialSlide: current,
    beforeChange: (cur, next) => { setCurrent(next); onBeforeChange(cur, next) },
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`relative max-w-6xl mx-auto ${edge === 'end' ? 'carousel-bounce-end' : ''} ${edge === 'start' ? 'carousel-bounce-start' : ''}`}>
          <Slider key={resizeKey} {...settings} ref={sliderRef}>
            {comparacion.map((item, index) => (
              <div key={index} className="px-1 py-4 outline-none">
                <BeforeAfterSlider
                  beforeSrc={item.beforeSrc}
                  afterSrc={item.afterSrc}
                  isActive={index === current}
                  beforeGrayscale={item.beforeGrayscale ?? 0.5}
                  showTitles
                  beforeTitle={item.beforeTitle}
                  afterTitle={item.afterTitle}
                  widthClass="w-full sm:w-[390px] lg:w-[460px]"
                  shadowClass="shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]"
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 390px, 86vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </Slider>

          {/* Fundido a blanco sobre las laterales */}
          <div className="absolute inset-y-0 left-0 w-[10%] sm:w-[15%] bg-gradient-to-r from-white via-white/60 to-transparent z-[15] pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-[10%] sm:w-[15%] bg-gradient-to-l from-white via-white/60 to-transparent z-[15] pointer-events-none" aria-hidden="true" />

          {/* Sombra de límite: se enciende un instante en el borde al llegar
              al final (o al principio) y dar la vuelta */}
          <div className={`absolute inset-y-4 right-0 w-16 bg-gradient-to-l from-[#FF690B]/25 to-transparent rounded-r-[32px] z-[16] pointer-events-none transition-opacity duration-300 ${edge === 'end' ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
          <div className={`absolute inset-y-4 left-0 w-16 bg-gradient-to-r from-[#FF690B]/25 to-transparent rounded-l-[32px] z-[16] pointer-events-none transition-opacity duration-300 ${edge === 'start' ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />

          {/* Flechas */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#FFEDE0] rounded-full p-1.5 text-[#FF690B] hover:scale-110 transition-transform duration-200 z-20 cursor-pointer"
            aria-label="Previous comparison"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FFEDE0] rounded-full p-1.5 text-[#FF690B] hover:scale-110 transition-transform duration-200 z-20 cursor-pointer"
            aria-label="Next comparison"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
