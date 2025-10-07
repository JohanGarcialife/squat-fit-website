import Image from "next/image";
import Comparision from "./_components/Comparision";
import HeroSection from "./_components/HeroSection";
import Progress from "./_components/Progress";
import TestimonialCarousel from "./_components/TestimonialCarousel";
import StartPlan from "./_components/StartPlan";
import Newsletter from "./_components/Newsletter";

export default function Home() {
const beforeSrc = "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  const afterSrc = "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="">
        <HeroSection />
        <Progress />
        <Comparision beforeSrc={beforeSrc} afterSrc={afterSrc} />
      <TestimonialCarousel />
      <StartPlan />
      <Newsletter />
      </div>
    </main>
  );
}
