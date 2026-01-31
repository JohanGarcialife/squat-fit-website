'use client';

import React, { useState } from 'react';
import { Video, Mic, ChefHat } from 'lucide-react';
import Image from 'next/image';

const vol1Steps = [
  { number: 1, title: 'Desayunos', items: ['Tortitas de avena', 'Huevos revueltos fit', 'Batido de proteínas casero'] },
  { number: 2, title: 'Comidas', items: ['Pollo al curry', 'Ensalada de quinoa', 'Pasta integral con atún'] },
  { number: 3, title: 'Cenas', items: ['Salmón al horno', 'Crema de verduras', 'Tortilla francesa con pavo'] },
  { number: 4, title: 'Postres', items: ['Mousse de chocolate fit', 'Helado de plátano', 'Yogur con frutas'] },
  { number: 5, title: 'Snacks', items: ['Frutos secos', 'Barritas energéticas', 'Fruta fresca'] },
];

const vol2Steps = [
  { number: 1, title: 'Desayunos', items: ['Tostadas de aguacate', 'Avena nocturna', 'Tortilla de claras'] },
  { number: 2, title: 'Comidas', items: ['Arroz con pavo', 'Lentejas estofadas', 'Wrap de pollo'] },
  { number: 3, title: 'Cenas', items: ['Merluza a la plancha', 'Ensalada caprese', 'Sopa de pollo'] },
  { number: 4, title: 'Postres', items: ['Brownie saludable', 'Galletas de avena', 'Batido de fresa'] },
  { number: 5, title: 'Snacks', items: ['Hummus con zanahoria', 'Queso fresco batido', 'Manzana con crema de cacahuete'] },
];

export default function Temario() {
  const [openStepVol1, setOpenStepVol1] = useState(1);
  const [openStepVol2, setOpenStepVol2] = useState(1);

  const handleToggleVol1 = (stepNumber) => {
    setOpenStepVol1(openStepVol1 === stepNumber ? null : stepNumber);
  };

  const handleToggleVol2 = (stepNumber) => {
    setOpenStepVol2(openStepVol2 === stepNumber ? null : stepNumber);
  };

  return (
    <section className="py-16 px-4 bg-white flex justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-indigo-900 mb-16">
          Explora las recetas por volumen
        </h2>

        {/* Vol. 1 Section */}
        <div className="flex flex-row gap-12 items-center mb-24">
          {/* Left Side - Timeline Vol 1 */}
          <div className="pl-6 w-1/2">
            <div className="flex justify-center mb-8 lg:justify-start lg:ml-12">
               <span className="bg-orange-500 text-white px-6 py-2 rounded-xl text-5xl font-bold inline-block">
                Vol. 1
              </span>
            </div>
           
            <ol className="relative border-l-4 border-orange-200 ml-4 lg:ml-16">
              {vol1Steps.map((step, index) => {
                const isOpen = openStepVol1 === step.number;
                return (
                  <li key={step.number} className={`ml-8 ${index === vol1Steps.length - 1 ? 'mb-0' : 'mb-8'}`}>
                    <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-white border-4 border-orange-200 rounded-full text-2xl font-bold text-orange-200">
                      {step.number}
                    </span>
                    <button
                      onClick={() => handleToggleVol1(step.number)}
                      className={`font-bold py-3 px-6 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-5xl ${isOpen ? 'bg-orange-200 text-secondary' : 'bg-orange-100 text-black hover:bg-orange-200'}`}
                    >
                      {step.title}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      <ul className="space-y-2 pl-2">
                        {step.items.map((item, i) => (
                          <li key={i} className="flex items-center text-xl text-gray-600">
                            <span className="flex-shrink-0 w-2 h-2 bg-orange-300 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right Side - Content Vol 1 */}
          <div className="flex w-1/2 flex-col items-center justify-center lg:items-start text-center lg:text-left">
            <h3 className="text-4xl md:text-6xl text-center font-bold text-orange-500 mb-4 leading-tight">
              Pensado para usarlo,<br />no para guardarlo
            </h3>
            <p className="text-orange-400 text-xl text-center w-full ">Variedad sin complicarte la vida.</p>
            <div className="relative">
                {/* Placeholder Icons - User will replace */}
               <div className="absolute top-12 right-8 flex gap-2 z-10">
                  <div className="bg-orange-500 p-3 rounded-xl shadow-lg transform rotate-6">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-indigo-900 p-3 rounded-xl shadow-lg transform -rotate-6">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
               </div>
               <Image src="/Libro1.png" width={500} height={500} alt="Libro Volumen 1" className="object-contain" />
            </div>
          </div>
        </div>

        {/* Vol. 2 Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           {/* Left Side - Content Vol 2 (Desktop Order) */}
           <div className="flex flex-col items-center lg:items-end text-center lg:text-right order-2 lg:order-1">
             <h3 className="text-4xl md:text-6xl text-center font-bold text-orange-500 mb-4 leading-tight">
              Recetas pensadas<br />para tu día real.
            </h3>
            <p className="text-orange-400 text-xl text-center w-full">No es un libro para mirar. Es para repetir.</p>
             <div className="relative">
                 <div className="absolute top-12 right-6 z-10 bg-indigo-900 p-3 rounded-xl shadow-lg transform rotate-12">
                     <ChefHat className="w-8 h-8 text-white" />
                 </div>
               <Image src="/Libro2.png" width={500} height={500} alt="Libro Volumen 2" className="object-contain" />
            </div>
          </div>

          {/* Right Side - Timeline Vol 2 (Desktop Order) */}
          <div className="pl-6 order-1 lg:order-2">
            <div className="flex justify-center mb-8 lg:justify-start lg:ml-12">
               <span className="bg-orange-500 text-white px-6 py-2 rounded-xl text-5xl font-bold inline-block">
                Vol. 2
              </span>
            </div>
            <ol className="relative border-l-4 border-orange-200 ml-4 lg:ml-16">
              {vol2Steps.map((step, index) => {
                const isOpen = openStepVol2 === step.number;
                return (
                  <li key={step.number} className={`ml-8 ${index === vol2Steps.length - 1 ? 'mb-0' : 'mb-8'}`}>
                    <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-white border-4 border-orange-200 rounded-full text-xl font-bold text-orange-200">
                      {step.number}
                    </span>
                    <button
                      onClick={() => handleToggleVol2(step.number)}
                      className={`font-bold py-3 px-6 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-5xl ${isOpen ? 'bg-orange-200 text-secondary' : 'bg-orange-100 text-black hover:bg-orange-200'}`}
                    >
                      {step.title}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      <ul className="space-y-2 pl-2">
                        {step.items.map((item, i) => (
                          <li key={i} className="flex items-center text-lg text-gray-600">
                            <span className="flex-shrink-0 w-2 h-2 bg-orange-300 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
