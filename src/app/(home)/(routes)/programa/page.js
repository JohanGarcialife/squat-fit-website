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
import FAQPrograma from './_components/FAQPrograma';

// Open Graph / Twitter específicos: reutiliza el titular y el subtítulo reales
// del hero de esta página (HeroPlanes.js). La imagen la hereda del layout de
// (home) — no hay ninguna pensada para compartir en public/, así que de
// momento usa la plantilla genérica del logo (ver PR: pendiente de diseño).
export const metadata = {
  // Sale como "Programa de nutrición y entreno · Squad Fit" (la marca la pone
  // la plantilla del layout de (home)).
  title: 'Programa de nutrición y entreno',
  description:
    'Un programa de nutrición y entreno para lograr tu objetivo y, sobre todo, mantener los resultados en el tiempo.',
  openGraph: {
    title: 'Squad Fit — Tu cambio, esta vez de verdad',
    description:
      'Un programa de nutrición y entreno para lograr tu objetivo y mantener resultados.',
    url: './',
    siteName: 'Squad Fit',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Squad Fit — Tu cambio, esta vez de verdad',
    description:
      'Un programa de nutrición y entreno para lograr tu objetivo y mantener resultados.',
  },
};

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
      {/* Las FAQ van ANTES del cierre a propósito: resuelven la última
          objeción y dejan el botón como el paso siguiente natural. Si van
          después, el cierre deja de ser el cierre. */}
      <Reveal><FAQPrograma /></Reveal>
      <Reveal><FinalCTA /></Reveal>
    </div>
  );
}
