"use client";

import React, { useState } from 'react';
import { Video, Mic } from 'lucide-react';
import Image from 'next/image';

const steps = [
  {
    number: 1,
    title: "Conceptos básicos",
    items: [
      "Fundamentos de nutrición saludable",
      "Cómo leer etiquetas nutricionales",
      "Planificación de comidas semanales",
      "Organización de tu cocina",
    ],
  },
  {
    number: 2,
    title: "Nutrición",
    items: [
      "Macronutrientes y micronutrientes",
      "Proteínas: cuánto y cuándo",
      "Carbohidratos inteligentes",
      "Grasas saludables",
    ],
  },
  {
    number: 3,
    title: "Entrenamiento",
    items: [
      "Nutrición pre-entrenamiento",
      "Nutrición post-entrenamiento",
      "Hidratación óptima",
      "Snacks saludables",
    ],
  },
  {
    number: 4,
    title: "Resultados",
    items: [
      "Seguimiento de progreso",
      "Ajustes personalizados",
      "Recetas de mantenimiento",
      "Hábitos sostenibles",
    ],
  },
];

export default function Temario() {
  const [openStep, setOpenStep] = useState(1);

  const handleToggle = (stepNumber) => {
    setOpenStep(openStep === stepNumber ? null : stepNumber);
  };

  return (
    <section className="py-16 px-4 bg-white flex justify-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Timeline */}
          <div className="pl-10">
            <ol className="relative border-l-4 border-orange-200">
              {steps.map((step, index) => {
                const isOpen = openStep === step.number;
                
                return (
                  <li 
                    key={step.number}
                    className={`ml-10 ${index === steps.length - 1 ? 'mb-0' : 'mb-12'}`}
                  >
                    {/* Numbered Circle */}
                    <span className="absolute -left-6 flex items-center justify-center w-12 h-12 bg-white border-4 border-orange-200 rounded-full text-2xl font-bold text-orange-200">
                      {step.number}
                    </span>

                    {/* Title Button */}
                    <button
                      onClick={() => handleToggle(step.number)}
                      aria-expanded={isOpen}
                      aria-controls={`step-content-${step.number}`}
                      className="bg-orange-100 text-black font-bold py-3 px-6 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-xl hover:bg-orange-200"
                    >
                      {step.title}
                    </button>

                    {/* Collapsible Content */}
                    {step.items.length > 0 && (
                      <div
                        id={`step-content-${step.number}`}
                        className={`
                          overflow-hidden transition-all duration-300 ease-in-out
                          ${isOpen ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0'}
                        `}
                      >
                        <ul className="space-y-3">
                          {step.items.map((item, i) => (
                            <li key={i} className="flex items-center">
                              <span className="flex-shrink-0 w-3 h-3 bg-orange-300 rounded-full mr-3"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right Side - Content Preview */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="mb-6">
              <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold inline-block">
                Contenido
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl max-w-[250px] font-bold text-orange-500 mb-8 leading-tight">
              Échale un vistazo al temario
            </h2>

            {/* Icons */}
            <div className="flex gap-4">
              <Image src="/temarioIcons.png" width={220} height={150} alt='icons' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
