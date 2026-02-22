import React from 'react'
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

  const comparacion = [
    {
       beforeSrc: "/recetasImages/1 antes.jpg",
       afterSrc: "/recetasImages/1 despues.jpg",
       text: "Recetas que encajan en tu vida real.",
    },
    {
       beforeSrc: "/recetasImages/2 antes.jpg",
       afterSrc: "/recetasImages/2 despues.jpg",
       text: "De improvisar a tener un sistema.",
    },
    {
       beforeSrc: "/recetasImages/3 antes.jpg",
       afterSrc: "/recetasImages/3 despues.jpg",
       text: "Más saciedad + menos kcal = más disfrute.",
    },
    {
       beforeSrc: "/recetasImages/4 antes.jpg",
       afterSrc: "/recetasImages/4 despues.jpg",
       text: "Comer bien no debería ser aburrido.",
    },
    {
       beforeSrc: "/recetasImages/5 antes.jpg",
       afterSrc: "/recetasImages/5 despues.jpg",
       text: "Tu dieta flexible ejecutada a la perfección.",
    },
    {
       beforeSrc: "/recetasImages/6 antes.jpg",
       afterSrc: "/recetasImages/6 despues.jpg",
       text: "Menos fricción en cocina = más constancia.",
    }
  ]

  return (
    <div className='min-h-screen'>
        <HeroSection />
        <Benefits />
        <TestimonialsCocina />
        <CourseContent />
        <ComparisionCocina comparacion={comparacion} />
        <Description />
        <Temario />
        <Extras/>
        <Shop />
       <GoalsAndBenefits />
     
       <FAQ />
    </div>
  )
}
