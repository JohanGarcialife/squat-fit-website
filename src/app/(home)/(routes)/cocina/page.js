import React from 'react'
import Reveal from '../../../components/Reveal'
import HeroSection from './_components/HeroSection'
import Benefits from './_components/Benefits'
import GoalsAndBenefits from './_components/GoalsAndBenefits'
import FAQ from './_components/FAQ'
import Shop from './_components/Shop'
import CourseContent from './_components/CourseContent'
import TestimonialsCocina from './_components/TestimonialsCocina'
import ComparisionCocina from './_components/ComparisionCocina'
import Description from './_components/Description'
import Temario from './_components/Temario'
import Extras from './_components/Extras'
export default function page() {

  // beforeGrayscale: intensidad del B/N del lado "antes", afinada foto a foto
  // para que el efecto se perciba igual en todas (base 0.5).
  const comparacion = [
    {
       // Avena
       beforeSrc: "/recetasImages/1 antes.jpg",
       afterSrc: "/recetasImages/1 despues.jpg",
       beforeTitle: "De comer aburrido",
       afterTitle: "A comer con gusto",
       beforeGrayscale: 0.62,
    },
    {
       // Sandwich
       beforeSrc: "/recetasImages/2 antes.jpg",
       afterSrc: "/recetasImages/2 despues.jpg",
       beforeTitle: "De un apaño",
       afterTitle: "A un plato de verdad",
       beforeGrayscale: 0.5,
    },
    {
       // French toast
       beforeSrc: "/recetasImages/3 antes.jpg",
       afterSrc: "/recetasImages/3 despues.jpg",
       beforeTitle: "De difícil de mantener",
       afterTitle: "A fácil de repetir",
       beforeGrayscale: 0.5,
    },
    {
       // Ensalada
       beforeSrc: "/recetasImages/4 antes.jpg",
       afterSrc: "/recetasImages/4 despues.jpg",
       beforeTitle: "De comidas penosas",
       afterTitle: "A un plato que apetece",
       beforeGrayscale: 0.38,
    },
    {
       // Burger
       beforeSrc: "/recetasImages/5 antes.jpg",
       afterSrc: "/recetasImages/5 despues.jpg",
       beforeTitle: "De pequeña y grasienta",
       afterTitle: "A saciante y deliciosa",
       beforeGrayscale: 0.5,
    },
    {
       // Pancakes
       beforeSrc: "/recetasImages/6 antes.jpg",
       afterSrc: "/recetasImages/6 despues.jpg",
       beforeTitle: "De quemar el desayuno",
       afterTitle: "A clavar la receta",
       beforeGrayscale: 0.45,
    }
  ]

  return (
    <div className='min-h-screen'>
        <HeroSection />
        <Reveal><Benefits /></Reveal>
        <Reveal><TestimonialsCocina /></Reveal>
        <Reveal><CourseContent /></Reveal>
        <Reveal><ComparisionCocina comparacion={comparacion} /></Reveal>
        <Reveal><Description /></Reveal>
        <Reveal><Temario /></Reveal>
        <Reveal><Extras/></Reveal>
        <Reveal><Shop /></Reveal>
        <Reveal><GoalsAndBenefits /></Reveal>
        <Reveal><FAQ /></Reveal>
    </div>
  )
}
