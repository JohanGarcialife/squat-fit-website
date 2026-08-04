// /components/FaqAccordion.jsx
'use client'
import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

// 1. Datos de las preguntas
//
// ORDEN pensado para convertir, no para documentar: primero «¿esto es para
// mí?», que es lo que decide la compra; después qué se aprende y qué nivel
// hace falta; y al final la logística (dónde se ven, desde dónde, qué pasa si
// tengo dudas), que ya solo la lee quien está decidido.
//
// CORREGIDAS DOS RESPUESTAS QUE PROMETÍAN LO QUE NO HAY (3-ago-2026).
// Decían «guías en PDF, plantillas de seguimiento y una comunidad de apoyo» y
// «grupo privado (Discord/Telegram) y sesiones de Q&A en vivo». Comprobado:
// no existe ningún Discord en el proyecto; el módulo de Telegram del backend
// es un puente de SOPORTE con clasificación de mensajes, no una comunidad de
// alumnos; y las sesiones en vivo son del programa Premium, grupales, no de
// los cursos. Vender eso en una FAQ es fabricar una devolución. Se sustituye
// por lo que el curso sí trae: clases en vídeo y test después de cada clase y
// de cada módulo.
const faqs = [
  {
    question: "¿Este curso es para mí?",
    answer:
      "Si quieres entender por qué haces lo que haces —y dejar de saltar de dieta en dieta y de rutina en rutina— sí. Está pensado para quien busca mejorar su salud, aprender a entrenar de forma eficiente y sostener el resultado, no para quien busca un atajo de seis semanas.",
  },
  {
    question: "¿Qué nivel necesito? Nunca he entrenado en serio",
    answer:
      "Ninguno. El curso va de menos a más y cada ejercicio trae su progresión y su regresión, así que sirve tanto si empiezas de cero como si llevas años entrenando y quieres ordenar lo que ya sabes.",
  },
  {
    question: "¿Es apto para mujeres? No quiero ponerme enorme",
    answer:
      "Sí, y es la duda que más nos llega. Ponerse «enorme» no pasa por entrenar fuerza: pasa por años de trabajo específico y una alimentación dirigida a eso. Lo que consigues aquí es fuerza, tono y una figura más definida.",
  },
  {
    question: "¿Qué voy a aprender exactamente?",
    answer:
      "La técnica correcta de cada ejercicio, cómo montar y progresar tus propias rutinas, los principios de nutrición que de verdad mueven la aguja y cómo construir hábitos que aguanten cuando se complica la semana.",
  },
  {
    question: "¿Qué incluye el curso?",
    answer:
      "Las clases en vídeo, organizadas en módulos, y un test después de cada clase y al terminar cada módulo para que compruebes que lo has asimilado en vez de acumular vídeos vistos. Todo queda registrado en tu cuenta, así que sabes siempre por dónde ibas.",
  },
  {
    question: "¿Es presencial u online?",
    answer:
      "100 % online. Solo necesitas conexión a internet, y vas a tu ritmo: ni horarios ni clases a las que llegar tarde.",
  },
  {
    question: "¿Dónde veo los vídeos y hasta cuándo?",
    answer:
      "En tu cuenta de Squad Fit, desde el ordenador, la tablet o el móvil, cuando quieras. No hay que descargar nada ni instalar ninguna aplicación.",
  },
  {
    question: "¿Puedo hacerlo si vivo fuera de España?",
    answer:
      "Sí. Al ser online se accede desde cualquier país, y el contenido no depende de dónde vivas.",
  },
  {
    question: "¿Y si me surge una duda por el camino?",
    answer:
      "Escríbenos a hola@squadfit.es y te contestamos. Si lo que buscas es que alguien revise tu caso y te lleve de la mano —pauta propia, rutina propia y seguimiento—, eso es el programa, no el curso: lo tienes en la sección Programa.",
  },
];

// 2. Componente del Acordeón
export default function FAQ() {
  // 3. Estado para manejar qué item está abierto
  // Lo inicializamos en 0 para que el primero aparezca abierto, como en tu imagen.
  // Si quieres que todos estén cerrados, usa: useState(null)
  const [openIndex, setOpenIndex] = useState(0);

  // Función para cambiar el item abierto
  const toggleFAQ = (index) => {
    // Si hago clic en el que ya está abierto, lo cierro (null)
    // Si hago clic en otro, se abre (index)
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full  mx-auto py-12 px-4 md:px-32">
      {/* Título */}
      <h2 className="text-5xl lg:text-5xl font-bold text-center text-orange-500 mb-10">
        Preguntas frecuentes
      </h2>

      {/* Contenedor de las preguntas */}
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-blue-700 last:border-b-0"
          >
            {/* 4. Trigger (Pregunta) - Es un botón para accesibilidad */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center py-4 text-left"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="text-lg md:text-2xl font-bold text-blue-800 cursor-pointer">
                {faq.question}
              </span>
              <span className="text-blue-800 cursor-pointer font-bold">
                {openIndex === index ? (
                  <MinusIcon className="h-6 w-6" />
                ) : (
                  <PlusIcon className="h-6 w-6" />
                )}
              </span>
            </button>

            {/* 5. Contenido (Respuesta) - Se muestra condicionalmente */}
            <div
              id={`faq-answer-${index}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? 'max-h-screen opacity-100' // 'max-h-screen' es un truco para animar a una altura automática
                  : 'max-h-0 opacity-0'
              }`}
            >
              <p className="pt-0 pb-4 text-gray-700 text-base md:text-lg">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}