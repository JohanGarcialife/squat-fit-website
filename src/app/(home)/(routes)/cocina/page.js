import React from 'react'
import HeroSection from './_components/HeroSection'
import Benefits from './_components/Benefits'
import VideoPresentation from './_components/VideoPresentation'
import Testimonials from './_components/Testimonials'
import GoalsAndBenefits from './_components/GoalsAndBenefits'
import FAQ from './_components/FAQ'
import Gallery from './_components/Gallery'
import Shop from './_components/Shop'
import CourseContent from './_components/CourseContent'

export default function page() {
  return (
    <div className='min-h-screen'>
        <HeroSection />
        <Benefits />
        <Gallery />
        <Testimonials />
        <VideoPresentation />
        <CourseContent />
        <Shop />
       <GoalsAndBenefits />
     
       <FAQ />
    </div>
  )
}
