"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- Icons ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6F6AF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF690B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
);

// --- Mock Data ---
const TOPICS = [
  { id: 1, name: "Tema 1: nombre", status: "completed" },
  { id: 2, name: "Tema 2: nombre", status: "completed" },
  { id: 3, name: "Tema 3: nombre", status: "pending" },
  { id: 4, name: "Tema 4: nombre", status: "pending" },
];

export default function CursosPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 min-h-screen">
      
      {/* Header / Breadcrumb */}
      <div className="flex items-center space-x-2 mb-2">
           <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded-full transition-colors">
             <BackIcon />
           </button>
      </div>
      <p className="text-[#FF690B] font-bold text-sm mb-2 ml-1">Curso</p>
      
      {/* Title */}
      <h1 className="text-[#3932C0] text-4xl md:text-5xl font-bold mb-8">Fuerte y definid@</h1>

      {/* Progress Card */}
      <div className="bg-white border-2 border-gray-100 rounded-[20px] p-6 mb-12 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
             <span className="text-[#FF690B] font-bold text-lg whitespace-nowrap">25% completado</span>
             <div className="w-full bg-[#FFF6F0] rounded-full h-4">
                <div 
                    className="bg-[#FF690B] h-4 rounded-full transition-all duration-500" 
                    style={{ width: "25%" }}
                ></div>
             </div>
        </div>
        <p className="text-[#FF690B] text-sm mt-3 font-medium">Última actividad el 31/01/2026</p>
      </div>

      {/* Content Section */}
      <h2 className="text-[#3932C0] text-2xl font-bold mb-6">Contenido del curso</h2>

      <div className="space-y-4">
        {TOPICS.map((topic) => (
            <div key={topic.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                     <ChevronRightIcon />
                     <span className="text-[#FF690B] text-lg font-medium">{topic.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    {topic.status === 'completed' ? (
                        <>
                            <span className="text-[#22C55E] text-sm font-medium">Completado</span>
                            <CheckCircleIcon />
                        </>
                    ) : (
                        <>
                             <span className="text-gray-300 text-sm font-medium">Siguiente</span>
                             <CircleIcon />
                        </>
                    )}
                </div>
            </div>
        ))}
      </div>

    </div>
  );
}
