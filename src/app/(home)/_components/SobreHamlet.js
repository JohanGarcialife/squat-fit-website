import React from 'react';
import { Pill, ClipboardList, Utensils, Dumbbell, GraduationCap, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Education from './Education';

const SobreHamlet = () => {
     const data = [
    {
      icon: "Pills",
      title: "Doctor en Medicina",
      subtitle: "Universidad",
      detail: "Autónoma Dominicana (UASD)"
    },
    {
      icon: "ClipboardList",
      title: "+10 cursos de Nutrición",
      subtitle: "Nutrición y Dietética (UASD),",
      detail: "Nutrición Clínica (UCM), entre otros"
    },
    {
      icon: "Piramide",
      title: "Asesor nutricional",
      subtitle: "+150 clientes",
      detail: "satisfechos desde 2021"
    },
    {
      icon: "Seminario",
      title: "+10 Cursos de Powerlifting",
      subtitle: "En busca de la Fuerza (Powerlifting Technique),",
      detail: "entre otros"
    }
  ];
  return (
    <div className="bg-white text-gray-800 font-sans">
      <section className="max-w-6xl mx-auto  py-16">
        {/* Sección Superior: Texto e Imagen */}
         <div className='flex items-center w-full'>
        
              <div className="animate-fadeIn p-4 text-gray-800 leading-relaxed max-w-2xl">
                <h1 className="text-8xl font-bold text-secondary mb-6">Sobre Hamlet</h1>
                <p className="mb-4 text-2xl">
                  Soy Hamlet Sosa, conocido también como Hamlet Squat Fit, tengo 32 años y vivo en Alicante, ES.
                </p>
                <p className="mb-4 text-2xl">
                  Desde pequeño he estado metido en la cocina o el gimnasio lo cual me ha dado una tremenda ventaja para diseñar recetas fit y disfrutar lo que como mientras pierdo grasa.
                </p>
                <p className="mb-4 text-2xl">
                 Desde antes de entrar a la carrera de medicina ya me interesaba el área de nutrición y deporte y me he ido formando constantemente en esos temas.
                </p>
                <p className="mb-4 text-2xl">
                  Llegué hace 7 años a España, desde mi país natal República Dominicana, es ahí cuando conocí a María en el gimnasio haciendo sentadilla (no podía ser de otro modo) y la conexión fue inmediata. Antes del mes ya estábamos saliendo.
                </p>
                <p className="mb-4 text-2xl">
                 Mi objetivo es inspirar a la mayor cantidad de personas a que vivan de una manera saludable, que se diviertan en el proceso y construyan la mejor versión de sí mismos.
                </p>
                <p className="mb-4 text-2xl">
                   Hoy en día llevo más de 10 años entrenando y 5 años formándome en nutrición y entrenamiento para ayudar a los demás a alcanzar sus objetivos.
                </p>
                               <p className="mb-4 text-2xl">
                   Me considero un médico fit con espíritu fat, y creo firmemente que se puede tener equilibrio y disfrutar mientras se tiene una vida saludable.
                </p>
              </div>
        
              
        
              <Image 
                    src="/hamlet.png" 
                    alt="Hamlet de Squat Fit"
                    width={550}
                    height={528}
                    className="w-full object-cover"
                  />
              </div>

        {/* Sección Media: Logros y Méritos */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h3 className="text-4xl font-bold text-primary mb-6">Logros</h3>
            <ul className="space-y-3">
              {[
                "Influencer fitness con +200k en TikTok y +100k en Instagram",
                "Autor de libro de recetas fitness",
                "Graduado en medicina con mención de honor",
                "Powerlifter y Bodybuilder natural"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary text-xl leading-none">•</span>
                  <p className="text-gray-800 text-2xl leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary mb-6">Méritos</h3>
            <ul className="space-y-3">
              {[
                "Experto en nutrición, entrenamiento y formación deportiva",
                "Chef en casa con mas de 10 años de experiencia",
                "Promotor de que ser fit sea divertido y sostenible"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary text-xl leading-none">•</span>
                  <p className="text-gray-800 text-2xl leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sección Inferior: Formación */}
        <div>
         <Education data={data} />
        </div>
      </section>
    </div>
  );
};

export default SobreHamlet;