'use client';

import React, { useState } from 'react';
import { Video, Mic, ChefHat } from 'lucide-react';
import Image from 'next/image';

// Recetas reales del documento "Lista de recetas para landing":
// 4 por categoría; la quinta del documento pasa a engordar el contador "y X más".
const vol1Steps = [
  { number: 1, title: 'Desayunos', items: ['Tortitas de vainilla o chocolate', 'French toast + crema cacahuete casera', 'Quesadillas al pesto (+ tomate y queso)', 'Cereal proteico chocolate y cacahuete'], more: 11 },
  { number: 2, title: 'Comidas', items: ['Boniato burger', 'KFC fit (pavo empanado estilo americano)', 'Ensalada burrito (pollo fajitas, aguacate y maíz)', 'Mega-wrap fit (pollo bbq y tortilla casera)'], more: 10 },
  { number: 3, title: 'Cenas', items: ['Pizzas fit (barbacoa o jamón y queso)', 'Patatas supremas (ternera, queso y salsa burger)', 'Canelones de berenjena y pollo bbq', '"Slim" pasta carbonara'], more: 9 },
  { number: 4, title: 'Snacks', items: ['Nachos al horno con guacamole y queso', 'Pan de ajo crunchy al airfryer', 'Croquetas cremosas de queso', 'Cinnamon rolls de choco blanco y canela'], more: 10 },
  { number: 5, title: 'Postres', items: ['Tarta de queso casera (fresa u Oreo)', 'Volcán de chocolate', 'Brownie muerte por chocolate', 'Tarta pantera rosa Squad Fit'], more: 9 },
];

const vol2Steps = [
  { number: 1, title: 'Desayunos', items: ['French toast frutos del bosque y choco blanco', 'Parfait de frutos rojos', 'Menú McMuffin fit', 'Porridge cookies & cream'], more: 8 },
  { number: 2, title: 'Comidas', items: ['Chicken burger spicy', 'Poké bowl de salmón', 'Ensalada burger con salsa Fit Mac', 'Cielito lindo fit (nachos + lasaña)'], more: 9 },
  { number: 3, title: 'Cenas', items: ['Pita pizza (pesto, barbacoa o 3 quesos)', 'Musaka con queso fundido', 'Risotto de pollo y setas', 'Fondue del huerto (queso y verduras)'], more: 11 },
  { number: 4, title: 'Snacks', items: ['Mini croissants de pizza', 'Quesadillas de pollo con salsa rosa', 'Tofu-cheese fingers', 'Dónuts fit (Lotus o Banoffee)'], more: 10 },
  { number: 5, title: 'Postres', items: ['Tarta de tres chocolates', 'Coulant de pistacho', 'Tarta de kínder blanco', 'Red velvet con frosting de choco blanco'], more: 8 },
];

export default function Temario() {
  const [openStepVol1, setOpenStepVol1] = useState(null);
  const [openStepVol2, setOpenStepVol2] = useState(null);

  const handleToggleVol1 = (stepNumber) => {
    setOpenStepVol1(openStepVol1 === stepNumber ? null : stepNumber);
  };

  const handleToggleVol2 = (stepNumber) => {
    setOpenStepVol2(openStepVol2 === stepNumber ? null : stepNumber);
  };

  // Foto de la derecha: collage de la categoría abierta; si no hay ninguna, el libro.
  const openVol1 = vol1Steps.find((s) => s.number === openStepVol1);
  const vol1Image = openVol1 ? `/temario/vol1/${openVol1.title}.webp` : '/Libro1.png';
  const openVol2 = vol2Steps.find((s) => s.number === openStepVol2);
  const vol2Image = openVol2 ? `/temario/vol2/${openVol2.title}.webp` : '/Libro2.png';

  return (
    <section className="py-16 px-4 bg-white flex justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-indigo-900 mb-16">
          Explora las recetas por volumen
        </h2>

        {/* Vol. 1 Section */}
        {/* En móvil se apila (como Vol. 2): con flex-row + w-1/2 fijos, la foto
            de cada categoría salía diminuta y montada encima de la lista */}
        <div className="grid lg:grid-cols-2 gap-4 items-center mb-24">
          {/* Left Side - Timeline Vol 1 */}
          <div className="pl-6">
            <div className="flex justify-center mb-8 lg:justify-start lg:ml-12">
               <span className="text-secondary text-5xl font-extrabold inline-block border-b-4 border-primary pb-2">
                Vol. 1
              </span>
            </div>
           
            <ol className="relative border-l-4 border-[#FFB489] ml-6 lg:ml-16">
              {vol1Steps.map((step, index) => {
                const isOpen = openStepVol1 === step.number;
                return (
                  <li key={step.number} className={`ml-8 ${index === vol1Steps.length - 1 ? 'mb-0' : 'mb-8'}`}>
                    <div className="relative">
                      <span className="absolute -left-[58px] top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-white border-4 border-[#FFB489] rounded-full text-3xl font-bold text-primary">
                        {step.number}
                      </span>
                      <button
                        onClick={() => handleToggleVol1(step.number)}
                        className={`font-bold py-2.5 px-5 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-3xl ${isOpen ? 'bg-primary text-white scale-105 shadow-md border-2 border-primary' : 'bg-[#FFEDE0] text-primary hover:bg-[#FFDFC9] border-2 border-transparent'}`}
                      >
                        {step.title}
                      </button>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      <ul className="space-y-2 pl-2">
                        {step.items.map((item, i) => (
                          <li key={i} className="flex items-center text-xl text-gray-600">
                            <span className="flex-shrink-0 w-2 h-2 bg-[#FFB489] rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                        {step.more && (
                          <li className="flex items-center text-xl font-semibold text-primary pl-4">
                            → y {step.more} recetas más
                          </li>
                        )}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right Side - Content Vol 1 */}
          <div className="flex flex-col items-center justify-center lg:items-start text-center lg:text-left">
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
               <Image key={vol1Image} src={vol1Image} width={500} height={500} alt={openVol1 ? `Recetas de ${openVol1.title} - Vol. 1` : 'Libro Volumen 1'} className="object-contain transition-opacity duration-300" />
            </div>
          </div>
        </div>

        {/* Vol. 2 Section */}
        <div className="grid lg:grid-cols-2 gap-4 items-center">
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
               <Image key={vol2Image} src={vol2Image} width={500} height={500} alt={openVol2 ? `Recetas de ${openVol2.title} - Vol. 2` : 'Libro Volumen 2'} className="object-contain transition-opacity duration-300" />
            </div>
          </div>

          {/* Right Side - Timeline Vol 2 (Desktop Order) */}
          <div className="pl-6 order-1 lg:order-2">
            <div className="flex justify-center mb-8 lg:justify-start lg:ml-12">
               <span className="text-secondary text-5xl font-extrabold inline-block border-b-4 border-primary pb-2">
                Vol. 2
              </span>
            </div>
            <ol className="relative border-l-4 border-[#FFB489] ml-6 lg:ml-16">
              {vol2Steps.map((step, index) => {
                const isOpen = openStepVol2 === step.number;
                return (
                  <li key={step.number} className={`ml-8 ${index === vol2Steps.length - 1 ? 'mb-0' : 'mb-8'}`}>
                    <div className="relative">
                      <span className="absolute -left-[58px] top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-white border-4 border-[#FFB489] rounded-full text-3xl font-bold text-primary">
                        {step.number}
                      </span>
                      <button
                        onClick={() => handleToggleVol2(step.number)}
                        className={`font-bold py-2.5 px-5 rounded-2xl inline-block text-left w-auto cursor-pointer transition-all text-lg md:text-3xl ${isOpen ? 'bg-primary text-white scale-105 shadow-md border-2 border-primary' : 'bg-[#FFEDE0] text-primary hover:bg-[#FFDFC9] border-2 border-transparent'}`}
                      >
                        {step.title}
                      </button>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      <ul className="space-y-2 pl-2">
                        {step.items.map((item, i) => (
                          <li key={i} className="flex items-center text-lg text-gray-600">
                            <span className="flex-shrink-0 w-2 h-2 bg-[#FFB489] rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                        {step.more && (
                          <li className="flex items-center text-lg font-semibold text-primary pl-4">
                            → y {step.more} recetas más
                          </li>
                        )}
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
