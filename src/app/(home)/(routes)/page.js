import Image from "next/image";
import Comparision from "../_components/Comparision";
import HeroSection from "../_components/HeroSection";
import Progress from "../_components/Progress";
import TestimonialCarousel from "../_components/TestimonialCarousel";
import StartPlan from "../_components/StartPlan";
import Newsletter from "../_components/Newsletter";

export default function Home() {

  const comparacion = [
{
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Ana Béjar después de 6 meses",
},
    {
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Transformación 1",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Transformación 2",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Transformación 3",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Transformación 4",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Transformación 5",
},
  ]
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div >
        <HeroSection />
        <Comparision comparacion={comparacion} />
        <Progress />
      <TestimonialCarousel />
      <StartPlan />
      <Newsletter />
      </div>
    </main>
  );
}
