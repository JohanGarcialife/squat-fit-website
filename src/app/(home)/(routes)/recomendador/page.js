import React, { Suspense } from 'react';
import RecomendadorClient from './_components/RecomendadorClient';

// Quiz del downsell. useSearchParams obliga al límite de Suspense para que el
// resto de la página pueda prerenderizarse.
export const metadata = {
  title: 'Tu recomendación · Squad Fit',
  description:
    'Puntúa qué necesitas ahora mismo (recetas, nutrición, entreno o guía) y te decimos qué encaja mejor contigo.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RecomendadorClient />
    </Suspense>
  );
}
