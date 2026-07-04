'use client';

import React from 'react';
import Link from 'next/link';
import { Star, BookOpen, Utensils, Users, Play, RefreshCw, Compass, Award } from 'lucide-react';

export default function RichProductCards({ onVerifyAccess, verifyLoading }) {
  const cards = [
    {
      id: 'cocina',
      title: (
        <>
          La Cocina <br />
          <span className="text-[#FF690B]">Squat Fit</span>
        </>
      ),
      textColor: 'text-[#FF690B]',
      subtitle: 'Tus recetas fit con sabor brutal para perder grasa sin sufrir.',
      rating: '4.7',
      ratingText: '+1000 lectores',
      imageUrl: '/Group32.png',
      phoneTag: 'La Cocina',
      phoneSubTag: 'Vol. 1',
      ideal: 'quieres comer rico y seguir perdiendo grasa.',
      benefits: 'Aprende a calcular tus macros sin liarte.',
      bullets: [
        'Recetas listas en 10-15 min con ingredientes del supermercado.',
        'Plan estructurado para marcar y ganar forma muscular.'
      ],
      footerIcons: [
        { icon: Compass, text: 'Navegación fácil' },
        { icon: Utensils, text: '+150 recetas' }
      ],
      btnText: 'Explorar el libro',
      btnBg: 'bg-[#FF690B] hover:bg-[#e05b08]',
      btnLink: '/cocina#shop'
    },
    {
      id: 'mejor-version',
      title: (
        <>
          Tu Mejor <br />
          <span className="text-[#FF690B]">Versión</span>
        </>
      ),
      textColor: 'text-[#FF690B]',
      subtitle: 'El programa para transformar tu físico paso a paso.',
      rating: '5.0',
      ratingText: '+2000 transformaciones',
      imageUrl: '/Group32.png',
      phoneTag: 'Tu Mejor Versión',
      ideal: 'necesitas estructura, dirección y acompañamiento para cambiar de verdad.',
      benefits: 'aprende qué hacer en cada fase para mantener los resultados sin vivir a dieta.',
      bullets: [
        'Método guiado para dejar de improvisar con la comida y el entrenamiento.',
        'Seguimiento para ajustar el rumbo según tu evolución real.'
      ],
      footerIcons: [
        { icon: Award, text: 'Método paso a paso' },
        { icon: Users, text: 'Acompañamiento' }
      ],
      btnText: 'Empezar mi cambio',
      btnBg: 'bg-[#FF690B] hover:bg-[#e05b08]',
      btnLink: '/planes'
    },
    {
      id: 'fuerte-definido',
      title: (
        <>
          Fuerte y <br />
          <span className="text-[#363C98]">Definid@</span>
        </>
      ),
      textColor: 'text-[#363C98]',
      subtitle: 'El curso que te enseña a construir tu mejor físico paso a paso.',
      rating: '4.8',
      ratingText: '+260 alumnos',
      imageUrl: '/cursosheronew.png',
      phoneTag: 'Fuerte y Definid@',
      phoneTopTag: 'Formación',
      ideal: 'entrenas pero no ves cambios diarios.',
      benefits: '+50 vídeos didácticos con progresión semanal.',
      bullets: [
        'Acceso a tests y autoevaluación del aprendizaje.',
        'Entiende la ciencia sin tecnicismos y aplícala desde el día 1.'
      ],
      footerIcons: [
        { icon: Play, text: 'Vídeos paso a paso' },
        { icon: RefreshCw, text: 'Actualizaciones' }
      ],
      btnText: 'Conocer el curso',
      btnBg: 'bg-[#363C98] hover:bg-[#2c317c]',
      btnLink: '/cursos'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Botón de verificación superior */}
      <div className="w-full flex justify-center mb-12">
        <button
          onClick={onVerifyAccess}
          disabled={verifyLoading}
          className="flex items-center justify-center gap-3 bg-white text-[#FF690B] border-2 border-[#FF690B] font-bold py-4 px-10 rounded-2xl text-lg hover:bg-orange-50/50 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifyLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF690B]"></div>
              Verificando...
            </>
          ) : (
            <>
              🔄 Verificar mi pago / acceso
            </>
          )}
        </button>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4 md:px-0">
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 w-full"
            >
              <div>
                {/* Cabecera: Título + Mockup de Teléfono */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-2/3 pr-2">
                    <h3 className={`text-3xl font-black tracking-tight leading-tight mb-2 ${card.textColor}`}>
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3 font-medium leading-tight">
                      {card.subtitle}
                    </p>
                    
                    {/* Estrellas */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star size={16} className="fill-[#FF690B] stroke-[#FF690B]" />
                      <span className="text-sm font-bold text-slate-800">{card.rating}</span>
                      <span className="text-gray-400 text-xs">| {card.ratingText}</span>
                    </div>
                  </div>

                  {/* Mockup de Teléfono CSS */}
                  <div className="w-1/3 flex justify-end shrink-0 relative pt-1">
                    <div className="relative w-[95px] h-[165px] border-[3px] border-black rounded-[20px] overflow-hidden bg-slate-900 shadow-md transform rotate-[-2deg]">
                      {/* Speaker / Dynamic Island */}
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-1.5 bg-black rounded-full z-20"></div>
                      
                      {/* Tag superior (opcional) */}
                      {card.phoneTopTag && (
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#3932C0] text-white text-[7px] font-bold py-0.5 px-1.5 rounded-full z-20 whitespace-nowrap leading-none scale-90">
                          {card.phoneTopTag}
                        </div>
                      )}

                      {/* Screen Image */}
                      <img src={card.imageUrl} className="w-full h-full object-cover" alt="phone mockup screen" />
                      
                      {/* Tag inferior */}
                      <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[90%] text-white text-[7px] font-bold py-1 px-0.5 rounded text-center leading-none z-20 shadow ${
                        card.textColor.includes('363C98') ? 'bg-[#363C98]' : 'bg-[#FF690B]'
                      }`}>
                        {card.phoneTag}
                        {card.phoneSubTag && (
                          <div className="text-[6px] font-normal opacity-90 mt-0.5">{card.phoneSubTag}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separador */}
                <div className="h-px bg-slate-100 w-full mb-5" />

                {/* Contenido principal */}
                <div className="space-y-4 text-sm mb-8">
                  <p className="text-slate-600 leading-snug">
                    <span className="font-bold text-[#FF690B]">Ideal si:</span> {card.ideal}
                  </p>
                  
                  <p className="text-slate-600 leading-snug">
                    <span className="font-bold text-[#363C98]">Beneficios:</span> {card.benefits}
                  </p>

                  <ul className="space-y-2 mt-4">
                    {card.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 leading-tight">
                        <span className="text-[#FF690B] mt-0.5 font-bold shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botón de acción y características en el pie */}
              <div className="space-y-5">
                {/* Iconos del pie */}
                <div className="flex items-center gap-6 text-xs text-gray-500 font-semibold border-t border-slate-50 pt-4">
                  {card.footerIcons.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Icon size={16} className={card.textColor.includes('363C98') ? 'text-[#363C98]' : 'text-[#FF690B]'} />
                        <span>{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Botón */}
                <Link href={card.btnLink} className="block w-full">
                  <button className={`w-full text-white font-bold py-3.5 px-6 rounded-2xl text-base transition-all shadow-md cursor-pointer ${card.btnBg}`}>
                    {card.btnText}
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Texto de suscripción inferior */}
      <p className="text-gray-400 text-sm mt-12 text-center">Desde 9,99€/mes • Cancela cuando quieras</p>
    </div>
  );
}
