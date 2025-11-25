// Es OBLIGATORIO agregar esto al inicio del archivo en Next.js
// ya que usamos estado (useState) y eventos (onClick).
"use client"; 

import React, { useState } from 'react';

// Los datos siguen siendo los mismos
const steps = [
  {
    number: 1,
    title: "Conceptos básicos",
    items: [
      "Lorem ipsum vitae sans jude memorials day",
      "Lorem ipsum vitae sans jude memorials day",
      "Lorem ipsum vitae sans jude memorials day",
      "Lorem ipsum vitae sans jude memorials day",
    ],
  },
  {
    number: 2,
    title: "Nutrición",
    // Agregué contenido de ejemplo para probar el clic
    items: ["Sub-item de Nutrición 1", "Sub-item de Nutrición 2"], 
  },
  {
    number: 3,
    title: "Entrenamiento",
    items: [], // Sin sub-items (no mostrará nada)
  },
  {
    number: 4,
    title: "Resultados",
    items: ["Sub-item de Resultados"], // Con un solo sub-item
  },
];

const TimelineStepper = () => {
  // --- CAMBIO CLAVE ---
  // Estado para rastrear el ID del paso abierto.
  // Lo inicializamos en 1 para que "Conceptos básicos" esté abierto por defecto.
  // Usa 'null' si quieres que todos estén cerrados al inicio.
  const [openStep, setOpenStep] = useState(1);

  // Función para manejar el clic
  const handleToggle = (stepNumber) => {
    // Si se hace clic en el que ya está abierto, se cierra (set a null).
    // Si se hace clic en uno cerrado, se abre (set al stepNumber).
    setOpenStep(openStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className=" pl-10 md:pl-72">
      <ol className="relative border-l-4 border-[#FF690B33]">
        
        {steps.map((step, index) => {
          // Determinamos si este paso es el que está abierto
          const isOpen = openStep === step.number;
          
          return (
            <li 
              key={step.number}
              className={`ml-10 ${index === steps.length - 1 ? 'mb-0' : 'mb-12'}`}
            >
              {/* Círculo numerado (sin cambios) */}
              <span className="absolute -left-6 flex items-center justify-center w-12 h-12 bg-white border-4 border-[#FF690B33] rounded-full text-2xl font-bold text-[#FF690B33]">
                {step.number}
              </span>

              {/* --- CAMBIO CLAVE ---
                  Convertimos el título en un <button> para accesibilidad
                  y le agregamos el evento onClick.
              */}
              <button
                onClick={() => handleToggle(step.number)}
                // Controla la sección de contenido para lectores de pantalla
                aria-expanded={isOpen}
                aria-controls={`step-content-${step.number}`}
                className="bg-[#FF690B33] text-gray-800 font-bold py-2 px-5 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-2xl"
              >
                {step.title}
              </button>

              {/* --- CAMBIO CLAVE ---
                  Contenido colapsable con transición de altura y opacidad.
              */}
              {step.items.length > 0 && (
                <div
                  id={`step-content-${step.number}`}
                  // Clases para la transición suave
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0'}
                  `}
                >
                  <ul className="space-y-3">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-center">
                        <span className="flex-shrink-0 w-4 h-4 bg-[#FF690B33] rounded-full mr-3"></span>
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
  );
};

export default TimelineStepper;