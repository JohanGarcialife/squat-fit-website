import React from 'react'
import HeroSection from './_components/HeroSection'
import Benefits from './_components/Benefits'
import Testimonials from './_components/Testimonials'
import CourseContent from './_components/CourseContent'
import CoursesCarousel from './_components/CoursesCarousel'
import Content from './_components/Content'
import GoalsAndBenefits from './_components/GoalsAndBenefits'
import CTO from './_components/CTO'
import FAQ from './_components/FAQ'

export default function page() {
  return (
    <div className='min-h-screen'>
        <HeroSection />
        <Benefits />
        <Testimonials />
        <CourseContent />
        <CoursesCarousel />
       <GoalsAndBenefits />
       <Content />
       <CTO />
       <FAQ />
    </div>
  )
}
