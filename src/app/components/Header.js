'use client';
import React, { useState, useEffect, useRef } from 'react'
import MenuHeader from './MenuHeader'
import useWindowSize from '../../hooks/UseWindowSize';
import BurgerMenu from './BurgerMenu';

export default function Header() {
  const { width } = useWindowSize();
  // Barra sticky ocultable: se esconde al bajar y reaparece al subir un poco.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) {
        setHidden(false); // siempre visible cerca del inicio
      } else if (y > lastY.current + 6) {
        setHidden(true); // bajando -> ocultar
      } else if (y < lastY.current - 6) {
        setHidden(false); // subiendo -> mostrar
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 bg-background transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Móvil primero: mientras el ancho es desconocido, mostramos el menú móvil */}
      {width >= 1024 ? <MenuHeader /> : <BurgerMenu />}
    </div>
  )
}
