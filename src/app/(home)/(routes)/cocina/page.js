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
   beforeSrc: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1470&auto=format&fit=crop",
   afterSrc: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1480&auto=format&fit=crop",
   text: "De comida procesada a saludable",
},
    {
   beforeSrc: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1471&auto=format&fit=crop",
   afterSrc: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop",
   text: "Desayunos nutritivos y deliciosos",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1398&auto=format&fit=crop",
   afterSrc: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1587&auto=format&fit=crop",
   text: "Comidas balanceadas y sabrosas",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1481&auto=format&fit=crop",
   afterSrc: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1470&auto=format&fit=crop",
   text: "Proteínas saludables y ricas",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1472&auto=format&fit=crop",
   afterSrc: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=1470&auto=format&fit=crop",
   text: "Recetas que encajan en tu vida",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1374&auto=format&fit=crop",
   afterSrc: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop",
   text: "Transformación total de tu cocina",
},
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
