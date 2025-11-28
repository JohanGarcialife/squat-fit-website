"use client";

import React from "react";

// Componente reutilizable para el Gráfico Circular (Donut Chart)
const CircularProgress = ({ value, max, label, sublabel, colorClass }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Calculamos el porcentaje
  // Nota: Si el valor supera el máximo (ej. pasos), llenamos el círculo completo
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;


  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        {/* Círculo de fondo (Gris/Naranja claro) */}
        <circle
          stroke="#ffedd5" // orange-100
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Círculo de progreso */}
        <circle
          stroke="currentColor"
          className={colorClass}
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Texto central */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold text-orange-600">{value}</span>
        <span className="text-sm text-orange-500 font-medium">{sublabel}</span>
      </div>
    </div>
  );
};

export default function page() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-12 w-full font-sans text-slate-800">
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* === TARJETA SUPERIOR: PERFIL === */}
        <section className="w-full border-2 border-orange-500 rounded-2xl p-6 md:p-8 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h1 className="text-3xl font-bold text-indigo-800">Completa tu perfil</h1>
            <button className="bg-orange-100 hover:bg-orange-200 text-orange-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Completar
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-orange-500 w-12">25%</span>
            <div className="w-full h-5 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full" 
                style={{ width: "25%" }}
              ></div>
            </div>
          </div>
        </section>


        {/* === GRID DE TARJETAS INFERIORES === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* TARJETA 1: CALORÍAS */}
          <div className="border-2 border-orange-500 rounded-2xl p-6 md:p-8 bg-white flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-indigo-800">Calorías</h2>
              <button className="bg-orange-100 hover:bg-orange-200 text-orange-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                Editar
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 h-full">
              {/* Gráfico Circular */}
              <div className="shrink-0">
                <CircularProgress 
                  value={1893} 
                  max={2000} 
                  sublabel="calorías" 
                  colorClass="text-orange-600"
                />
              </div>

              {/* Bloques de Datos */}
              <div className="flex flex-col gap-4 w-full">
                {/* Bloque Objetivo */}
                <div className="bg-orange-50 rounded-xl p-4 text-center w-full">
                  <span className="block text-2xl font-bold text-orange-600">2000</span>
                  <span className="text-sm text-orange-500">Objetivo diario</span>
                </div>
                
                {/* Bloque Restantes */}
                <div className="bg-orange-50 rounded-xl p-4 text-center w-full">
                  <span className="block text-2xl font-bold text-orange-600">-107</span>
                  <span className="text-sm text-orange-500">restantes</span>
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 2: PASOS */}
          <div className="border-2 border-orange-500 rounded-2xl p-6 md:p-8 bg-white flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-indigo-800">Pasos</h2>
              <button className="bg-orange-100 hover:bg-orange-200 text-orange-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                Editar
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 h-full">
              {/* Gráfico Circular */}
              <div className="shrink-0">
                <CircularProgress 
                  value={7896} 
                  max={10000} // Asumí 10k para que el gráfico tenga sentido visual
                  sublabel="pasos" 
                  colorClass="text-orange-600"
                />
              </div>

              {/* Bloques de Datos */}
              <div className="flex flex-col gap-4 w-full">
                {/* Bloque Objetivo */}
                <div className="bg-orange-50 rounded-xl p-4 text-center w-full">
                  <span className="block text-2xl font-bold text-orange-600">2000</span>
                  <span className="text-sm text-orange-500">Objetivo diario</span>
                </div>
                
                {/* Bloque Restantes */}
                <div className="bg-orange-50 rounded-xl p-4 text-center w-full">
                  <span className="block text-2xl font-bold text-orange-600">-107</span>
                  <span className="text-sm text-orange-500">restantes</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
