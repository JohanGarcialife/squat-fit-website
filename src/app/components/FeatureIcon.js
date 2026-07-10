'use client';
import React from 'react';

// Icono de característica ("Qué incluye el curso"): SVG vectorial (lucide) con
// trazo oscuro y puntito naranja de acento. Sustituye a los PNG antiguos, que
// mezclaban dos sets distintos y se veían borrosos en pantallas retina.
export default function FeatureIcon({ icon: Icon }) {
  return (
    <div className="relative w-[52px] h-[52px] flex items-center justify-center flex-shrink-0">
      <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-[#FF690B]/40" aria-hidden="true" />
      <Icon className="w-11 h-11 text-slate-700" strokeWidth={1.3} aria-hidden="true" />
    </div>
  );
}
