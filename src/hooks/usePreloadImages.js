'use client';

import { useEffect } from 'react';

/**
 * Precarga en caché una lista de URLs de imagen al montar, para que los
 * carruseles no muestren la foto cargándose a mitad de clic (se veía "cutre").
 * Al calentar la caché del navegador, cuando slick muestra un slide la imagen
 * ya está lista y pinta al instante.
 */
export default function usePreloadImages(srcs = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const list = (srcs || []).filter(Boolean);
    for (const src of list) {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = src;
    }
  }, [JSON.stringify(srcs)]);
}
