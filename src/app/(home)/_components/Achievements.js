import React from 'react';

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
    "Ayudado a cientos de personas a mejorar su relación con la comida/ recuperar la menstruación/ o perder el miedo a comer",
    "Formadora en plataformas nacionales: ICNS y FitGeneration"
  ];

  return (
    <section className="max-w-6xl mx-auto p-8 font-sans">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Columna Logros */}
        <div>
          <h2 className="text-4xl font-bold text-primary mb-6">Logros</h2>
          <ul className="space-y-4">
            {logros.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2 text-xl">•</span>
                <p className="text-gray-800 text-2xl leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna Méritos */}
        <div>
          <h2 className="text-4xl font-bold text-primary mb-6">Méritos</h2>
          <ul className="space-y-4">
            {meritos.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2 text-xl">•</span>
                <p className="text-gray-800 text-2xl leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Achievements;