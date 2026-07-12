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
      "Cómo funciona la composición corporal",
      "Qué es realmente la hipertrofia",
      "Metabolismo y adaptaciones al déficit",
      "Errores habituales que frenan resultados",
    ],
  },
  {
    number: 2,
    title: "Nutrición",
    items: [
      "Papel de los hidratos, grasas y proteínas",
      "Pasos de recomposición bien planteada",
      "Protocolos prácticos y enfoques reales",
      "Dietas populares: cuándo usarlas"
    ], 
  },
  {
    number: 3,
    title: "Entrenamiento",
    items: [
      "Bases del entrenamiento para hipertrofia",
      "Relación entre dieta y estímulo muscular",
      "Ejercicios prácticos y aplicación real",
      "Cómo entrenar según tu objetivo"
    ],
  },
  {
    number: 4,
    title: "Resultados",
    items: [
      "Planificación paso a paso",
      "Ajustes, seguimiento y errores comunes",
      "Casos reales y toma de decisiones",
      "Cómo lograr y mantener tus resultados"
    ],
  },
];

const TimelineStepper = ({ openStep: openStepProp, onToggle }) => {
  // Estado del paso abierto. Puede venir controlado desde fuera (Content.js
  // lo usa para cambiar la foto del temario al abrir cada bloque); si no,
  // se gestiona aquí como siempre, con "Conceptos básicos" abierto de inicio.
  const [openStepLocal, setOpenStepLocal] = useState(1);
  const openStep = openStepProp !== undefined ? openStepProp : openStepLocal;

  // Función para manejar el clic
  const handleToggle = (stepNumber) => {
    if (onToggle) {
      onToggle(stepNumber);
      return;
    }
    // Si se hace clic en el que ya está abierto, se cierra (set a null).
    // Si se hace clic en uno cerrado, se abre (set al stepNumber).
    setOpenStepLocal(openStep === stepNumber ? null : stepNumber);
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
                className={`font-bold py-2 px-5 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-2xl ${isOpen ? 'bg-primary text-white shadow-md border-2 border-orange-400' : 'bg-[#FF690B33] text-gray-800 border-2 border-transparent'}`}
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