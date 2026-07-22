import React from 'react';
import Reveal from '../../../components/Reveal';
import HeroPlanes from './_components/HeroPlanes';
import ThreePillars from './_components/ThreePillars';
import WhyWeFail from './_components/WhyWeFail';
import InvestmentSection from './_components/InvestmentSection';
import RelatableSection from './_components/RelatableSection';
import StepsSection from './_components/StepsSection';
import Transformaciones from './_components/Transformaciones';
import TrustpilotPrograma from './_components/TrustpilotPrograma';
import ProgramPricing from './_components/ProgramPricing';
import AgendaSection from './_components/AgendaSection';
import GuaranteeSection from './_components/GuaranteeSection';
import FinalCTA from './_components/FinalCTA';

export default function page() {
  return (
    <div className="min-h-screen bg-white">
      <HeroPlanes />
      <Reveal><ThreePillars /></Reveal>
      <Reveal><WhyWeFail /></Reveal>
      <Reveal><InvestmentSection /></Reveal>
      <Reveal><RelatableSection /></Reveal>
      <Reveal><StepsSection /></Reveal>
      <Reveal><Transformaciones /></Reveal>
      <Reveal><TrustpilotPrograma /></Reveal>
      <Reveal><ProgramPricing /></Reveal>
      <Reveal><AgendaSection /></Reveal>
      <Reveal><GuaranteeSection /></Reveal>
      <Reveal><FinalCTA /></Reveal>
    </div>
  );
}
