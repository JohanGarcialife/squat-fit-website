"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useRouter } from 'next/navigation';

import { useAuthStore } from "@/stores/auth.store";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

// Mock Data - Replace with real data or props later
const TOP_SALES = [
  { id: 1, title: "La Cocina Squat Fit - Vol.1", subtitle: "Libro", image: "/group32.png" },
  { id: 2, title: "Fuerte y Definid@", subtitle: "Cursos", image: "/group32.png" }, // Using placeholder, replace if better asset exists
  { id: 3, title: "La Cocina Squat Fit - Vol.2", subtitle: "Libro", image: "/group32.png" },
  { id: 4, title: "Pack Completo", subtitle: "Bundle", image: "/group32.png" },
];

const CONTINUE_WATCHING = [
  { id: 101, title: "Módulo 3: Nutrición", subtitle: "Curso Básico", image: "/group32.png", progress: 45 },
  { id: 102, title: "Entrenamiento de Fuerza", subtitle: "Rutina A", image: "/group32.png", progress: 80 },
  { id: 103, title: "Recetas Rápidas", subtitle: "Cocina", image: "/group32.png", progress: 10 },
];

const CarouselSection = ({ title, items, variant = 'default' }) => {
  const settings = {
    dots: true,
    infinite: items.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: true, // Navigate to slide on click
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="mb-16">
      <h2 className="text-[#3932C0] font-bold text-3xl mb-8">{title}</h2>
      <div className="slider-container overflow-hidden max-w-full mx-auto px-2">
        <Slider {...settings}>
          {items.map((item) => (
            <div key={item.id} className="px-3 pb-8 pt-2"> {/* Added padding for shadow */}
              {variant === 'progress' ? (
                 // --- Progress Card Variant ---
                 <div className="flex flex-col space-y-3">
                    <div className="bg-[#FFF6F0] rounded-[20px] p-6 shadow-md flex flex-col items-center justify-center space-y-4 hover:shadow-lg transition-shadow duration-300 h-full min-h-[300px]">
                        <div className="w-full flex justify-center mb-4 relative">
                            <Image src={item.image} width={180} height={180} alt={item.title} className="object-contain drop-shadow-xl" />
                        </div>
                        <div className="text-center">
                            <p className="text-[#FF690B] font-bold text-xl mb-1">{item.title}</p>
                            <p className="text-[#3932C0] text-lg font-medium">{item.subtitle}</p>
                        </div>
                    </div>
                    {/* Progress Bar Outside Card */}
                    <div className="flex items-center space-x-3 px-1">
                        <span className="text-[#FF690B] font-bold text-lg">{item.progress}%</span>
                        <div className="w-full bg-[#FFF6F0] rounded-full h-4">
                            <div 
                                className="bg-[#FF690B] h-4 rounded-full transition-all duration-500" 
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                    </div>
                 </div>
              ) : (
                // --- Default Card Variant ---
                <div className="bg-white rounded-[20px] p-6 shadow-md flex flex-col items-center justify-center space-y-4 hover:shadow-lg transition-shadow duration-300 h-full min-h-[300px]">
                    <div className="w-full flex justify-center mb-4 relative">
                    <Image src={item.image} width={180} height={180} alt={item.title} className="object-contain drop-shadow-xl" />
                    </div>
                    <div className="text-center">
                        <p className="text-[#FF690B] font-bold text-xl mb-1">{item.title}</p>
                        <p className="text-[#3932C0] text-lg font-medium">{item.subtitle}</p>
                    </div>
                </div>
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default function TopVentas() {
  const { logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleLogoutConfirmed = () => {
    logout();
    setIsModalOpen(false);
    router.push('/');
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-4">
      {/* Header with Cart and Title is handled here effectively as the page title section */}
      
      {/* 
          NOTE: The reference image shows a Header with just the Title "Nuestros top ventas" 
          and a Cart Icon on the right. 
          The actual component structure might expect the Header to be separate but 
          TopVentas seems to occupy the main slot. 
          I will render the header row HERE for simplicity as per current structure.
      */}
      
      <div className="flex items-center justify-between w-full mb-8">
        {/* Title is rendered inside the first CarouselSection? 
            Actually, the image has "Nuestros top ventas" as the section title. 
            The Header seems to be global. 
            Let's put the Cart Icon here at top right relative to the main content area.
        */}
        <div className="flex-grow"></div> {/* Spacer */}
        <div className="flex items-center space-x-6">
             <div onClick={() => setIsModalOpen(true)} className="cursor-pointer text-[#3932C0] hover:text-[#FF690B] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <path d="M9 12h12l-3 -3" />
                    <path d="M18 15l3 -3" />
                </svg>
             </div>
             
             {/* Cart Icon */}
             <div className="relative cursor-pointer text-[#3932C0] hover:text-[#FF690B] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M17 17h-11v-14h-2" />
                    <path d="M6 5l14 1l-1 7h-13" />
                </svg>
                {/* Badge example */}
                <span className="absolute -top-2 -right-2 bg-[#FF690B] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    3
                </span>
             </div>
        </div>
      </div>

      <CarouselSection title="Nuestros top ventas" items={TOP_SALES} />
      <CarouselSection title="Continua donde estabas" items={CONTINUE_WATCHING} variant="progress" />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogoutConfirmed}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />
    </div>
  );
}
