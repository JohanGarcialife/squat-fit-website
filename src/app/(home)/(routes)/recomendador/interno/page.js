import React from 'react';
import InternoClient from './_components/InternoClient';

// Generador interno del equipo. `robots: noindex` PROPIO además del noindex
// global temporal: cuando en el lanzamiento se retire el X-Robots-Tag de
// next.config.mjs, esta página debe seguir fuera de los buscadores.
export const metadata = {
  title: 'Generador de downsell · Uso interno',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <InternoClient />;
}
