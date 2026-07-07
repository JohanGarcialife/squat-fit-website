'use client';

import { useEffect, useState } from 'react';

// Devuelve una key que cambia cuando el usuario TERMINA de redimensionar la
// ventana (espera de 250ms). Sirve para re-montar los carruseles de react-slick,
// que calculan sus anchos en píxeles al iniciarse y no siempre los recalculan
// bien durante un resize en vivo (quedaban "anchados" hasta recargar).
export default function useResizeRemountKey() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setKey((k) => k + 1), 250);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return key;
}
