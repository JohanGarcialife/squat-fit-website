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
   beforeSrc: "https://images.unsplash.com/photo-1573879541250-58ae8b322b40?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
   afterSrc: "https://images.unsplash.com/photo-1605300287659-9ca1a156d7c8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
   text: "Transformación 1",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1565128933905-b30a29234804?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZhdHxlbnwwfDF8MHx8fDI%3D&auto=format&fit=crop&q=60&w=900",
   afterSrc: "https://images.unsplash.com/photo-1628869503963-6ce8de674c58?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=956",
   text: "Transformación 2",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1573878222998-40b24a653ac8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   afterSrc: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
   text: "Transformación 3",
},
{
   beforeSrc: "https://images.unsplash.com/photo-1562956335-14faa1a9aeeb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=986",
   afterSrc: "https://images.unsplash.com/photo-1708011108850-49646bd34503?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=927",
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
