'use client';

import React, { useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

// Preguntas frecuentes del embudo del programa.
//
// Orden pensado para CONVERTIR, no para documentar. Va de menos a más
// compromiso: primero se quita de en medio el miedo a que la llamada sea una
// encerrona, después las objeciones de «no es para mí», y solo al final el
// dinero. El precio no se pone a propósito — esta landing es de llamada, no de
// carrito, y el número sin el contexto del caso de cada persona resta.
//
// Lo que se afirma aquí está contrastado con la spec de programas TMV
// (plan nutricional personalizado + rutina personalizada + seguimiento en
// TODOS; sesiones en vivo GRUPALES solo en Premium; nada de 1:1 fuera de las
// videoconsultas, que son producto aparte) y con la sección de garantía de
// esta misma página. NO se promete duración en meses: hoy se vende semestral y
// está sobre la mesa pasar a anual, así que la duración se decide en la
// llamada. Así la respuesta es cierta antes y después de ese cambio.
const faqs = [
  {
    question: '¿Qué pasa exactamente en la llamada?',
    answer:
      'Hablamos de tu caso: dónde estás, qué has probado y qué te está frenando. Al final te decimos con franqueza si el programa te encaja o no, y si no te encaja te lo decimos igual. No hay compromiso de compra ni coste por la llamada.',
  },
  {
    question: '¿Esto es para mí? Nunca he conseguido mantener un cambio',
    answer:
      'Es justo el punto de partida más habitual. La diferencia no está en la fuerza de voluntad, está en tener una pauta hecha para tu vida y a alguien revisándola contigo cuando algo deja de funcionar. Por eso el programa lleva seguimiento, y no solo un plan en PDF.',
  },
  {
    question: '¿Necesito gimnasio?',
    answer:
      'No. La rutina se construye con el material que tengas: gimnasio, casa o lo que haya. Si entrenas en casa, se diseña para eso desde el primer día, no es una versión recortada de la de gimnasio.',
  },
  {
    question: '¿Voy a tener que dejar de comer lo que me gusta?',
    answer:
      'No. La pauta se hace a partir de lo que ya comes y de tus horarios, con sustituciones para que puedas salir a cenar, viajar o tener una comida familiar sin tirarlo todo por la borda. Un plan que solo funciona si tu vida es perfecta no funciona.',
  },
  {
    question: '¿Qué incluye el programa?',
    answer:
      'Plan nutricional personalizado, rutina de entrenamiento personalizada y seguimiento continuo con el equipo. Según el programa que elijas se suman las formaciones grabadas de nutrición y entrenamiento, y en Premium además sesiones en vivo en grupo cada mes.',
  },
  {
    question: '¿En cuánto tiempo voy a ver cambios?',
    answer:
      'Las primeras semanas se notan en energía, hambre y descanso, que es lo que sostiene el resto. El cambio físico que se ve en el espejo y se queda necesita meses de trabajo constante: por eso el acompañamiento es largo y no un mes suelto.',
  },
  {
    question: '¿Cuánto tiempo tengo que dedicarle al día?',
    answer:
      'El entrenamiento se ajusta a los días y al rato del que dispongas de verdad, no al ideal. La parte de nutrición lleva más tiempo la primera semana, mientras coges el sistema; después es cuestión de minutos.',
  },
  {
    question: '¿Puedo hacerlo desde fuera de España?',
    answer:
      'Sí. Todo el seguimiento es online y trabajamos con personas de varios países. La pauta se adapta a los alimentos que encuentras donde vives.',
  },
  {
    question: '¿Y si no funciona?',
    answer:
      'Asumimos el riesgo contigo: si al terminar el programa has hecho tu parte —y eso se ve en los seguimientos, que quedan registrados— y no has obtenido resultados, se te devuelve el dinero.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      'Depende del programa y de lo que necesite tu caso, así que el precio se ve en la llamada, con todo sobre la mesa y sin compromiso. Se puede pagar a plazos con financiación, de forma que la cuota mensual sea asumible.',
  },
];

export default function FAQPrograma() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="w-full bg-white py-16 sm:py-20 px-6 sm:px-12 md:px-24">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-[#363C98] mb-4 tracking-tight">
          Antes de dar el paso
        </h2>
        <p className="text-slate-500 text-center text-lg mb-10">
          Lo que más nos preguntan quienes están donde estás tú ahora.
        </p>

        <div className="space-y-1">
          {faqs.map((faq, index) => {
            const abierta = openIndex === index;
            return (
              <div key={faq.question} className="border-b border-slate-200 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(abierta ? null : index)}
                  className="w-full flex justify-between items-center gap-4 py-4 text-left cursor-pointer group"
                  aria-expanded={abierta}
                  aria-controls={`faq-programa-${index}`}
                >
                  <span className="text-lg sm:text-xl font-bold text-[#363C98] group-hover:text-[#FF690B] transition-colors">
                    {faq.question}
                  </span>
                  <span className="text-[#FF690B] shrink-0">
                    {abierta ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                  </span>
                </button>
                <div
                  id={`faq-programa-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    // `max-h-screen`, el mismo que usan las FAQ de /cocina y de
                    // /cursos. Da 900 px de tope, de sobra para la respuesta
                    // más larga (108 px medidos).
                    abierta ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="pb-5 pr-8 text-slate-600 text-base sm:text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
