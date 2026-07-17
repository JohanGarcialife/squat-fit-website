import Image from 'next/image';
import React from 'react';
import { ABOUT } from './aboutStyles';

const EducationCard = ({ icon, title, subtitle, detail }) => (
  <div className="flex flex-col items-center text-center p-2">
    <div className="relative mb-4">
      {/* Círculo decorativo suave detrás del icono */}
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-200 rounded-full opacity-50" />
      <Image src={`/icons/nosotros/${icon}.png`} alt={title} width={64} height={64} className="text-slate-400" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-400 rounded-full opacity-50" />
    </div>
    <h3 className="text-[#363C98] font-bold text-base leading-tight mb-1">
      {title}
    </h3>
    <p className="text-gray-400 text-sm leading-tight">
      {subtitle}<br />
      {detail}
    </p>
  </div>
);

const Education = ({ data }) => {
  return (
    <section className="mt-12">
      <h2 className={ABOUT.h2}>Formación</h2>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {data.map((item, index) => (
          <EducationCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default Education;
