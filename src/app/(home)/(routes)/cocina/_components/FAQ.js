// /components/FaqAccordion.jsx
'use client'
import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

// 1. Datos de las preguntas
// Traídas y actualizadas de la web antigua (squatfit.es/libro-de-cocina) y
// ordenadas por impacto de compra: primero qué incluye y para quién es,
// después formatos/envío y al final las dudas de dieta y el acceso digital.
const faqs = [
  {
    question: "¿Qué incluye la Cocina Squad Fit?",
    answer:
      "Los volúmenes 1 y 2 suman más de 155 recetas fit —desayunos, comidas, cenas, snacks y postres— todas con sus calorías y macros incluidos. Y de regalo, los extras: +30 salsas fit, +15 guarniciones y 6 recetas tropicales para que no repitas plato ni de casualidad.",
  },
  {
    question: "¿Este recetario es para mí aunque no entrene?",
    answer:
      "¡Por supuesto! Da igual tu edad, sexo o condición física: comes todos los días, ¿no? Pues este libro te enseña a hacerlo rico y saludable. Y si además entrenas, mejor todavía: cada receta te ayuda a cuadrar tus objetivos sin aburrirte comiendo.",
  },
  {
    question: "¿En qué formatos puedo conseguirlo?",
    answer:
      "Como prefieras: el Volumen 1 impreso, el pack con los dos volúmenes en papel, la biblioteca digital de por vida (con el Volumen 3 ya en camino) o el pack completo con todo. Elige el tuyo en la sección de precios de esta misma página.",
  },
  {
    question: "¿Cuándo recibo el libro?",
    answer:
      "El digital, en 24-48 horas en tu cuenta. El impreso, en 2-4 días laborables si estás en Europa y en 5-7 para el resto del mundo. Hacemos envíos a todo el planeta.",
  },
  {
    question: "¿Puedo comprarlo si vivo fuera de España?",
    answer:
      "Sí. Tenemos envío internacional a todo el mundo, y la versión digital la tienes disponible estés donde estés.",
  },
  {
    question: "¿Y si no me convence? Devoluciones y garantía",
    answer:
      "Compra tranquilo: con el libro impreso tienes 30 días naturales desde que lo recibes para devolverlo, siempre que esté en las mismas condiciones en las que llegó (solo los gastos del envío de vuelta van por tu cuenta). Escríbenos a hola@squatfit.es con tu nombre y los datos de la compra y te reembolsamos por el mismo método de pago en un máximo de 14 días. Condiciones completas en nuestra política de devoluciones.",
  },
  {
    question: "Estoy a dieta para perder grasa, ¿me sirve?",
    answer:
      "Es que NECESITAS este libro. Lo creamos en plena definición: casi todas las recetas rondan las 200-500 calorías, la mayoría son bajas en grasa y altas en proteína, así que encajan perfectamente en un protocolo de pérdida de grasa sin pasar hambre.",
  },
  {
    question: "¿Los ingredientes son fáciles de conseguir en mi país?",
    answer:
      "La mayoría los encuentras en cualquier supermercado. Y para los más especiales te dejamos sustituciones, así que no te quedas sin tu receta vivas donde vivas.",
  },
  {
    question: "Tengo intolerancia (gluten, lactosa, huevo...), ¿hay recetas para mí?",
    answer:
      "¡Claro! Hay muchas recetas sin gluten y sin lactosa claramente indicadas, y casi todas admiten sustituciones muy sencillas siguiendo nuestras indicaciones.",
  },
  {
    question: "¿Hay opciones vegetarianas, veganas o keto?",
    answer:
      "Sí. Hay recetas directamente vegetarianas o veganas y muchísimas más con sustituciones fáciles. Y aunque somos amantes de los hidratos, también hemos incluido recetas keto y bajas en carbohidratos.",
  },
  {
    question: "¿Cómo accedo a la versión digital?",
    answer:
      "Nada más completar la compra la tienes en tu cuenta de Squad Fit, disponible 24/7 desde el móvil, la tablet o el ordenador. Es acceso de por vida: añadimos 5 recetas nuevas cada semana, y cada receta y volumen nuevo también será tuyo.",
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