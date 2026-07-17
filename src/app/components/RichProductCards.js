'use client';

import React from 'react';
import Link from 'next/link';
import { Star, BookOpen, Utensils, Users, Video, RefreshCw, Compass, Award, ClipboardList } from 'lucide-react';

export default function RichProductCards({ onVerifyAccess, verifyLoading, show }) {
  const allCards = [
    {
      id: 'cocina',
      title: (
        <>
          La Cocina <br />
          Squad Fit
        </>
      ),
      textColor: 'text-[#FF690B]',
      subtitle: 'Tus recetas fit con sabor brutal para perder grasa sin sufrir.',
      rating: '4.7',
      ratingText: '+1000 lectores',
      imageUrl: '/mockup_cocina.png',
      ideal: 'quieres comer rico y seguir perdiendo grasa.',
      benefits: 'Aprende a calcular tus macros sin liarte.',
      bullets: [
        'Recetas listas en 10-15 min con ingredientes del supermercado.',
        'Plan estructurado para marcar y ganar forma muscular.'
      ],
      footerIcons: [
        { icon: ClipboardList, text: 'Navegación fácil' },
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
          Versión
        </>
      ),
      textColor: 'text-[#FF690B]',
      subtitle: 'El programa para transformar tu físico paso a paso.',
      rating: '5.0',
      ratingText: '+2000 transformaciones',
      imageUrl: '/mockup_mejor_version.png',
      ideal: 'necesitas estructura, dirección y acompañamiento para cambiar de verdad.',
      benefits: 'aprende qué hacer en cada fase para mantener los resultados sin vivir a dieta.',
      bullets: [
        'Método guiado para dejar de improvisar con la comida y el entrenamiento.',
        'Seguimiento para ajustar el rumbo según tu evolución real.'
      ],
      footerIcons: [
        { icon: ClipboardList, text: 'Método paso a paso' },
        { icon: Users, text: 'Acompañamiento' }
      ],
      btnText: 'Empezar mi cambio',
      btnBg: 'bg-[#FF690B] hover:bg-[#e05b08]',
      btnLink: '/programa'
    },
    {
      id: 'fuerte-definido',
      title: (
        <>
          Fuerte y <br />
          Definid@
        </>
      ),
      textColor: 'text-[#363C98]',
      subtitle: 'El curso que te enseña a construir tu mejor físico paso a paso.',
      rating: '4.8',
      ratingText: '+260 alumnos',
      imageUrl: '/mockup_fuerte_definido.png',
      ideal: 'entrenas pero no ves cambios diarios.',
      benefits: '+50 vídeos didácticos con progresión semanal.',
      bullets: [
        'Acceso a tests y autoevaluación del aprendizaje.',
        'Entiende la ciencia sin tecnicismos y aplícala desde el día 1.'
      ],
      footerIcons: [
        { icon: Video, text: 'Vídeos paso a paso' },
        { icon: RefreshCw, text: 'Actualizaciones' }
      ],
      btnText: 'Conocer el curso',
      btnBg: 'bg-[#363C98] hover:bg-[#2c317c]',
      btnLink: '/cursos'
    }
  ];

  // Cada pestaña muestra solo su(s) producto(s): antes salían las 3 juntas
  // aunque no correspondiera. `show` es un array de ids; sin él, se ven todas.
  const cards = show ? allCards.filter((c) => show.includes(c.id)) : allCards;
  const gridCols = cards.length === 1 ? 'md:grid-cols-1 max-w-md' : cards.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3 max-w-7xl';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Grid de Tarjetas */}
      <div className={`grid grid-cols-1 ${gridCols} gap-10 w-full px-4 md:px-0`}>
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white rounded-[36px] border border-slate-100 p-9 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 w-full"
            >
              <div>
                {/* Cabecera: Título + Mockup de Teléfono */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-[60%] pr-2">
                    <h3 className={`text-4xl font-extrabold tracking-tight leading-tight mb-3 ${card.textColor}`}>
                      {card.title}
                    </h3>
                    <p className={`text-[15px] font-semibold leading-snug mb-4 ${card.textColor}`}>
                      {card.subtitle}
                    </p>
                    
                    {/* Estrellas */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-sm text-gray-400 font-medium">
                      <Star size={18} className="fill-[#FF690B] stroke-[#FF690B] shrink-0" />
                      <span className="font-bold text-slate-800">{card.rating}</span>
                      <span className="text-gray-300">|</span>
                      <span>{card.ratingText}</span>
                    </div>
                  </div>

                  {/* Imagen de Teléfono Maquetado */}
                  <div className="w-[125px] shrink-0 relative flex justify-end">
                    <img 
                      src={card.imageUrl} 
                      className="w-full h-auto object-contain drop-shadow-md" 
                      alt="phone mockup" 
                    />
                  </div>
                </div>

                {/* Separador */}
                <div className="h-px bg-slate-100 w-full mb-5" />

                {/* Contenido principal */}
                <div className="space-y-4 text-base mb-8">
                  <p className="text-slate-600 leading-snug">
                    <span className={`font-bold ${card.textColor}`}>Ideal si:</span> {card.ideal}
                  </p>
                  
                  <p className="text-slate-600 leading-snug">
                    <span className={`font-bold ${card.textColor}`}>Beneficios:</span> {card.benefits}
                  </p>

                  <ul className="space-y-3 mt-4">
                    {card.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-800 text-[15px] leading-snug">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2"></div>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botón de acción y características en el pie */}
              <div className="space-y-5">
                {/* Iconos del pie */}
                <div className="flex items-center justify-between text-[13px] font-bold border-t border-slate-100 pt-4">
                  {card.footerIcons.map((item, idx) => {
                    const Icon = item.icon;
                    const iconColor = card.id === 'fuerte-definido' ? 'text-[#FF690B]' : 'text-[#363C98]';
                    const textColor = card.id === 'fuerte-definido' ? 'text-[#363C98]' : 'text-[#FF690B]';
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Icon size={18} className={`${iconColor} shrink-0`} />
                        <span className={`${textColor} leading-none`}>{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Botón */}
                <Link href={card.btnLink} className="block w-full">
                  <button className={`w-full text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all shadow-md cursor-pointer ${card.btnBg}`}>
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

      {/* Enlace discreto para refrescar el acceso tras comprar (reemplaza al
          botón grande; en Fase 3 esta acción vivirá también en Ajustes). */}
      {onVerifyAccess && (
        <button
          onClick={onVerifyAccess}
          disabled={verifyLoading}
          className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF690B] transition-colors disabled:opacity-50"
        >
          {verifyLoading ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-current"></span>
              Actualizando…
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              ¿Acabas de comprar y no ves tu acceso? Actualizar
            </>
          )}
        </button>
      )}
    </div>
  );
}
