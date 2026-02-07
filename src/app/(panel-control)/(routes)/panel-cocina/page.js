"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CocinaPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen">
      
      {/* Title */}
      <h1 className="text-[#3932C0] text-5xl font-bold mb-16">Cocina</h1>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        
        {/* Card 1 - Volumen 1 */}
        <div className="flex flex-col items-center">
             <h2 className="text-[#FF690B] text-2xl font-bold mb-6">Cocina Squat Fit</h2>
             
             {/* Image Container with background shape effect */}
             <div className="relative mb-6">
                <div className="absolute top-4 left-[-10px] w-full h-full bg-[#FFF6F0] rounded-[40px] -z-10 transform scale-105"></div>
                <Image 
                    src="/group32.png" // Using the generic book image found in TopVentas
                    width={300} 
                    height={300} 
                    alt="Cocina Squat Fit Volumen 1" 
                    className="object-contain"
                />
             </div>

             <Link href="#" className="text-[#FF690B] text-3xl mb-8 border-b-2 border-[#FF690B] pb-1 hover:text-[#FF690B]/80 transition-colors">
                Volumen 1
             </Link>

             <button className="bg-secondary text-white font-bold py-3 px-12 rounded-xl text-lg hover:bg-secondary/90 transition-colors shadow-lg">
                Ver mi libro 1
             </button>
        </div>

        {/* Card 2 - Volumen 2 */}
        <div className="flex flex-col items-center">
             <h2 className="text-[#FF690B] text-2xl font-bold mb-6">Cocina Squat Fit</h2>
             
             {/* Image Container with background shape effect */}
             <div className="relative mb-6">
                <div className="absolute top-4 left-[-10px] w-full h-full bg-[#FFF6F0] rounded-[40px] -z-10 transform scale-105"></div>
                 <Image 
                    src="/group32.png" // Reuse same image for now or placeholder
                    width={300} 
                    height={300} 
                    alt="Cocina Squat Fit Volumen 2" 
                    className="object-contain"
                />
             </div>

             <Link href="#" className="text-[#FF690B] text-3xl mb-8 border-b-2 border-[#FF690B] pb-1 hover:text-[#FF690B]/80 transition-colors">
                Volumen 2
             </Link>

             <button className="bg-secondary text-white font-bold py-3 px-12 rounded-xl text-lg hover:bg-secondary/90 transition-colors shadow-lg">
                Ver mi libro 2
             </button>
        </div>

      </div>

    </div>
  );
}
