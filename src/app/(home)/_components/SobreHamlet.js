import React from 'react';
import Education from './Education';
import { ABOUT, Portrait } from './aboutStyles';

const SobreHamlet = () => {
  const data = [
    { icon: 'Pills', title: 'Doctor en Medicina', subtitle: 'Universidad', detail: 'Autónoma Dominicana (UASD)' },
    { icon: 'ClipboardList', title: '+10 cursos de Nutrición', subtitle: 'Nutrición y Dietética (UASD),', detail: 'Nutrición Clínica (UCM), entre otros' },
    { icon: 'Piramide', title: 'Asesor nutricional', subtitle: '+150 clientes', detail: 'satisfechos desde 2021' },
    { icon: 'Seminario', title: '+10 Cursos de Powerlifting', subtitle: 'En busca de la Fuerza (Powerlifting Technique),', detail: 'entre otros' },
  ];

  const parrafos = [
    'Soy Hamlet Sosa, conocido también como Hamlet Squad Fit, tengo 32 años y vivo en Alicante, ES.',
    'Desde pequeño he estado metido en la cocina o el gimnasio, lo cual me ha dado una gran ventaja para diseñar recetas fit y disfrutar de lo que como mientras pierdo grasa.',
    'Ya antes de entrar en la carrera de Medicina me interesaba el área de nutrición y deporte, y me he ido formando constantemente en esos temas.',
    'Llegué hace 7 años a España desde mi país natal, República Dominicana. Fue entonces cuando conocí a María en el gimnasio haciendo sentadilla (no podía ser de otro modo) y la conexión fue inmediata.',
    'Mi objetivo es inspirar a la mayor cantidad de personas a que vivan de forma saludable, se diviertan en el proceso y construyan la mejor versión de sí mismas.',
    'Hoy llevo más de 10 años entrenando y 5 años formándome en nutrición y entrenamiento para ayudar a los demás a alcanzar sus objetivos.',
    'Me considero un médico fit con espíritu fat, y creo firmemente que se puede tener equilibrio y disfrutar mientras se lleva una vida saludable.',
  ];

  const logros = [
    'Influencer fitness con +200k en TikTok y +100k en Instagram',
    'Autor de libro de recetas fitness',
    'Graduado en Medicina con mención de honor',
    'Powerlifter y bodybuilder natural',
  ];
  const meritos = [
    'Experto en nutrición, entrenamiento y formación deportiva',
    'Chef en casa con más de 10 años de experiencia',
    'Promotor de que ser fit sea divertido y sostenible',
  ];

  return (
    <div className="animate-fadeIn">
      <p className={ABOUT.eyebrow}>El equipo</p>
      <h1 className={`${ABOUT.h1} mt-2`}>Sobre Hamlet</h1>
      <div className="mt-6">
        <Portrait src="/hamlet.png" alt="Hamlet de Squad Fit" />
      </div>
      <div className="mt-6 space-y-4">
        {parrafos.map((t, i) => <p key={i} className={ABOUT.p}>{t}</p>)}
      </div>

      {/* Logros y méritos */}
      <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 mt-12">
        <div>
          <h2 className={ABOUT.h2}>Logros</h2>
          <ul className="mt-4 space-y-2.5">
            {logros.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-[#FF690B] leading-7">•</span>
                <p className={ABOUT.p}>{t}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={ABOUT.h2}>Méritos</h2>
          <ul className="mt-4 space-y-2.5">
            {meritos.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-[#FF690B] leading-7">•</span>
                <p className={ABOUT.p}>{t}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Education data={data} />
    </div>
  );
};

export default SobreHamlet;
