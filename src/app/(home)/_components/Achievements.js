import React from 'react';
import { ABOUT } from './aboutStyles';

const Achievements = () => {
  const logros = [
    "Influencer fitness con +300k en Youtube y +400k en Instagram",
    "Autora de libro de recetas fitness",
    "He asesorado a +250 clientes a transformar su mentalidad y cambiar sus cuerpos",
    "Ponente en foros internacionales y universidades como:",
    "Experto en Nutrición Deportiva 2018 y 2019 (UCM)",
    "Evento Lifer 2019, (Campus PowerExplosive) entre otros"
  ];

  const meritos = [
    "Experta en nutrición, entrenamiento y formación",
    "Promotora del entrenamiento de fuerza y el fitness en la mujer",
    "Ayudado a cientos de personas a mejorar su relación con la comida / recuperar la menstruación / o perder el miedo a comer",
    "Formadora en plataformas nacionales: ICNS y FitGeneration"
  ];

  return (
    <section className="mt-12">
      <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
        <div>
          <h2 className={ABOUT.h2}>Logros</h2>
          <ul className="mt-4 space-y-2.5">
            {logros.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="text-[#FF690B] leading-7">•</span>
                <p className={ABOUT.p}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={ABOUT.h2}>Méritos</h2>
          <ul className="mt-4 space-y-2.5">
            {meritos.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="text-[#FF690B] leading-7">•</span>
                <p className={ABOUT.p}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
