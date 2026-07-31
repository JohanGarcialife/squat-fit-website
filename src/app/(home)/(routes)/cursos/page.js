import React from 'react'
import Reveal from '../../../components/Reveal'
import HeroSection from './_components/HeroSection'
import Benefits from './_components/Benefits'
import Testimonials from './_components/Testimonials'
import CourseContent from './_components/CourseContent'
import CoursesCarousel from './_components/CoursesCarousel'
import Content from './_components/Content'
import GoalsAndBenefits from './_components/GoalsAndBenefits'
import CTO from './_components/CTO'
import FAQ from './_components/FAQ'

// Open Graph / Twitter específicos: reutiliza el titular y el copy reales del
// hero de esta página (HeroSection.js). La imagen la hereda del layout de
// (home) — no hay ninguna pensada para compartir en public/, así que de
// momento usa la plantilla genérica del logo (ver PR: pendiente de diseño).
export const metadata = {
  openGraph: {
    title: 'Squad Fit — Fuerte y definid@',
    description:
      'Transforma tu cuerpo y no solo llega al objetivo físico que siempre has querido, sino a cómo mantenerlo de por vida.',
    url: './',
    siteName: 'Squad Fit',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Squad Fit — Fuerte y definid@',
    description:
      'Transforma tu cuerpo y no solo llega al objetivo físico que siempre has querido, sino a cómo mantenerlo de por vida.',
  },
};

export default function page() {
  return (
    <div className='min-h-screen'>
        <HeroSection />
        <Reveal><Benefits /></Reveal>
        <Reveal><Testimonials /></Reveal>
        <Reveal><CourseContent /></Reveal>
        <Reveal><CoursesCarousel /></Reveal>
        <Reveal><GoalsAndBenefits /></Reveal>
        <Reveal><Content /></Reveal>
        <Reveal><CTO /></Reveal>
        <Reveal><FAQ /></Reveal>
    </div>
  )
}
