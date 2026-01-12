import Image from 'next/image';
import React from 'react';


const EducationCard = ({ icon, title, subtitle, detail }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="relative mb-6">
      {/* Círculo decorativo suave detrás del icono */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-200 rounded-full opacity-50" />
      <Image src={`/icons/nosotros/${icon}.png`} alt={title} width={80} height={80} className="text-slate-400 stroke-1" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-400 rounded-full opacity-50" />
    </div>
    <h3 className="text-indigo-900 font-bold text-lg leading-tight mb-1">
      {title}
    </h3>
    <p className="text-gray-400 text-sm leading-tight">
      {subtitle}<br />
      {detail}
    </p>
  </div>
);

const Education = (props) => {
  const { data } = props;

  return (
    <section className="max-w-6xl mx-auto p-8">
      <h2 className="text-6xl font-bold text-indigo-900 mb-12">Formación</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.map((item, index) => (
          <EducationCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default Education;