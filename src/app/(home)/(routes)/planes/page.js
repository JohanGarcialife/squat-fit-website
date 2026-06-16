import React from 'react';
import HeroPlanes from './_components/HeroPlanes';
import MethodSection from './_components/MethodSection';
import ThreePillars from './_components/ThreePillars';
import WhyWeFail from './_components/WhyWeFail';
import InvestmentSection from './_components/InvestmentSection';
import RelatableSection from './_components/RelatableSection';
import StepsSection from './_components/StepsSection';
import PlanesTestimonials from './_components/PlanesTestimonials';
import GuaranteeSection from './_components/GuaranteeSection';
import FinalCTA from './_components/FinalCTA';

export default function page() {
  return (
    <div className="min-h-screen bg-white">
      <HeroPlanes />
      <MethodSection />
      <ThreePillars />
      <WhyWeFail />
      <InvestmentSection />
      <RelatableSection />
      <StepsSection />
      <PlanesTestimonials />
      <GuaranteeSection />
      <FinalCTA />
    </div>
  );
}
