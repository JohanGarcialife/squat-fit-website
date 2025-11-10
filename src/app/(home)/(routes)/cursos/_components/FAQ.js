// /components/FaqAccordion.jsx
'use client'
import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

// 1. Datos de las preguntas
// Puedes mover esto a un archivo JSON o pasarlo como prop
const faqs = [
  {
    question: "¿Es presencial u online?",
    answer:
      "Todos mis cursos son 100% online por lo que cualquier persona con internet podrá acceder a ellos.",
  },
  {
    question: "¿Este curso es para mí?",
    answer:
      "Este curso es para ti si buscas mejorar tu salud, aprender a entrenar de forma eficiente y quieres ver resultados duraderos.",
  },
  {
    question: "¿Es apto para mujeres? No quiero ponerme como un hombre...",
    answer:
      "¡Totalmente! Este entrenamiento está diseñado para tonificar y fortalecer, no para hipertrofiar de forma masculina. Lograrás una figura estilizada y fuerte.",
  },
  {
    question: "¿Qué aprenderé en el curso?",
    answer:
      "Aprenderás las técnicas correctas de cada ejercicio, cómo estructurar tus rutinas, principios de nutrición y a crear hábitos sostenibles.",
  },
  {
    question: "¿Qué nivel tiene el curso?",
    answer:
      "El curso es apto para todos los niveles, desde principiante hasta avanzado, con progresiones y regresiones para cada ejercicio.",
  },
  {
    question: "¿Hay material de apoyo?",
    answer:
      "Sí, además de los videos, tendrás acceso a guías en PDF, plantillas de seguimiento y una comunidad de apoyo.",
  },
  {
    question: "¿Dónde puedo ver los videos?",
    answer:
      "Todos los videos están alojados en nuestra plataforma privada. Podrás acceder desde tu computadora, tablet o móvil 24/7.",
  },
  {
    question: "¿Qué pasa si tengo dudas?",
    answer:
      "Tendrás acceso a un grupo privado (Discord/Telegram) y sesiones de Q&A en vivo para resolver todas tus preguntas.",
  },
  {
    question: "¿Puedo hacerlo si soy de fuera de España?",
    answer:
      "¡Por supuesto! Al ser 100% online, puedes acceder desde cualquier parte del mundo con una conexión a internet.",
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
      <h2 className="text-5xl lg:text-7xl font-bold text-center text-orange-500 mb-10">
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
              <span className="text-3xl md:text-4xl font-bold text-blue-800 cursor-pointer">
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
              <p className="pt-0 pb-4 text-gray-700 text-3xl">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}