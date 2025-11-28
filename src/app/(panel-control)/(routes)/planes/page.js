"use client";

import React from "react";
import { 
  Dumbbell, 
  Heart, 
  Apple, 
  ChevronRight, 
  ChevronDown, 
  Footprints 
} from "lucide-react";

export default function Page() {
  // Datos simulados para el gráfico
  const chartData = Array.from({ length: 18 }).map((_, i) => ({
    date: `Jun ${i + 1}`,
    val1: (Math.sin(i) + 2) * 10,
    val2: (Math.cos(i) + 2) * 15,
    val3: (Math.sin(i * 2) + 2) * 8,
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-sans text-slate-800 w-full">
      
      {/* --- Navegación Superior (Tabs) --- */}
      <nav className="flex border-b border-slate-200 mb-8">
        <div className="flex gap-2 px-2 md:px-0">
          <button type="button" className="px-5 py-3 border-b-2 border-blue-600 text-primary font-semibold whitespace-nowrap">
            Plan de hoy
          </button>
          <button type="button" className="px-5 py-3 text-slate-500 hover:text-primary font-medium transition-colors whitespace-nowrap">
            Mis recursos
          </button>
          <button type="button" className="px-5 py-3 text-slate-500 hover:text-primary font-medium transition-colors whitespace-nowrap">
            Seguimiento
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        
        {/* === COLUMNA IZQUIERDA === */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Sección: Acciones diarias */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">Acciones diarias</h2>
            
            <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-slate-500">33% completado</span>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[33%] rounded-full"></div>
                </div>
            </div>

            {/* Lista de Tarjetas */}
            <div className="space-y-4">
              
              {/* Card 1: Entrenamiento (Completado) */}
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3}/>
                </div>
                <button type="button" className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all group text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Dumbbell className="text-primary w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Día 1 - Lunes - Torso</h3>
                      <p className="text-slate-500 text-sm">5 ejercicios</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-400 w-5 h-5 group-hover:text-primary transition-colors" />
                </button>
              </div>

              {/* Card 2: Cardio (Pendiente) */}
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                <button type="button" className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all group text-left">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Heart className="text-primary w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                        <h3 className="font-semibold text-slate-800">Día 1 - Lunes - Cardio</h3>
                        <p className="text-slate-500 text-sm">10 minutos</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-400 w-5 h-5 group-hover:text-primary transition-colors" />
                </button>
              </div>

              {/* Card 3: Nutrición (Pendiente) */}
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                <button type="button" className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all group text-left">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Apple className="text-primary w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                        <h3 className="font-semibold text-slate-800">Día 1 - Lunes - Nutrición</h3>
                        <p className="text-slate-500 text-sm">Carga</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-400 w-5 h-5 group-hover:text-primary transition-colors" />
                </button>
              </div>

            </div>
          </section>

          {/* Sección: Pasos diarios */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">Pasos diarios</h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-end justify-between mb-2">
                <div>
                    <span className="text-4xl font-bold text-primary">2,146</span>
                    <span className="text-lg text-slate-500 ml-2">de 10,000 pasos</span>
                </div>
                <Footprints size={40} className="text-slate-300" strokeWidth={1.5} />
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-primary w-[21%] rounded-full"></div>
                </div>
            </div>
          </section>

        </div>

        {/* === COLUMNA DERECHA (Vista General / Gráfico) === */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">Vista general</h2>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 h-full">
            
            <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-slate-800">Progreso Mensual</span>
                <button type="button" className="flex items-center text-sm border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50">
                    <span>Jun 2025</span>
                    <ChevronDown size={16} className="ml-2" />
                </button>
            </div>

            {/* Mock del Gráfico */}
            <div className="relative h-64 w-full select-none">
              {/* Ejes Y (Líneas de fondo) */}
              <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 z-0 pr-4">
                {[100, 80, 60, 40, 20, 0].map((val) => (
                  <div key={val} className="w-full border-t border-slate-200/80 flex items-center relative h-0">
                    <span className="absolute left-0 -top-2.5 text-[10px] bg-white px-1 text-slate-400">{val}%</span>
                  </div>
                ))}
              </div>

              {/* Barras del gráfico */}
              <div className="absolute bottom-6 left-8 right-0 h-full flex items-end gap-6 px-2 z-10 overflow-x-auto">
                  {chartData.map((data, i) => (
                     <div key={i} className="flex-none flex flex-col items-center gap-2 group w-4 h-full justify-end cursor-pointer">
                        <div className="w-full h-full flex flex-col items-center justify-end">
                            <div className="w-full rounded-t-lg bg-blue-200 hover:bg-blue-300 transition-colors" style={{ height: `${data.val1}%` }}></div>
                            <div className="w-full rounded-t-lg bg-blue-600 hover:bg-blue-700 transition-colors mt-px" style={{ height: `${data.val2}%` }}></div>
                            <div className="w-full rounded-t-lg bg-orange-400 hover:bg-orange-500 transition-colors mt-px" style={{ height: `${data.val3}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                           {data.date}
                        </span>
                      </div>
                   ))}
              </div>
            </div>

            {/* Leyenda del gráfico */}
            <div className="flex items-center gap-6 mt-6 justify-center text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Entreno
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Dieta
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span> Cardio
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Check icon component used in the completed task
const Check = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={props.strokeWidth || 1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );