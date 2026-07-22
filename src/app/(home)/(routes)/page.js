import Image from "next/image";
import Comparision from "../_components/Comparision";
import HeroSection from "../_components/HeroSection";
import Progress from "../_components/Progress";
import TestimonialCarousel from "../_components/TestimonialCarousel";
import StartPlan from "../_components/StartPlan";
import FourPillars from "../_components/FourPillars";
import HowItWorks from "../_components/HowItWorks";
import Reveal from "../../components/Reveal";

export default function Home() {

  const comparacion = [
    { beforeSrc: "/transformaciones/ana-antes.jpg",    afterSrc: "/transformaciones/ana-despues.jpg",    text: "Ana Béjar, después de 6 meses" },
    { beforeSrc: "/transformaciones/diego-antes.jpg",  afterSrc: "/transformaciones/diego-despues.jpg",  text: "Diego Villarroel, después de 5 meses" },
    { beforeSrc: "/transformaciones/jesica-antes.jpg", afterSrc: "/transformaciones/jesica-despues.jpg", text: "Jésica Soto, después de 7 meses" },
    { beforeSrc: "/transformaciones/manuel-antes.jpg", afterSrc: "/transformaciones/manuel-despues.jpg", text: "Manuel López, después de 7 meses" },
    { beforeSrc: "/transformaciones/javier-contreras-antes.jpg", afterSrc: "/transformaciones/javier-contreras-despues.jpg", text: "Javier Contreras, después de 10 meses" },
  ]
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      {/* max-w + clip: si un hijo se pasa de ancho, se recorta en vez de
          descentrar toda la página (pasaba en iPhone) */}
      <div className="w-full max-w-[100vw] overflow-x-clip">
        <HeroSection />
        <Reveal><Comparision comparacion={comparacion} /></Reveal>
        <Reveal><Progress /></Reveal>
        <Reveal><FourPillars /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <Reveal><TestimonialCarousel /></Reveal>
        <Reveal><StartPlan /></Reveal>
      </div>
    </main>
  );
}
