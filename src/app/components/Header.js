'use client';
import React from 'react'
import MenuHeader from './MenuHeader'
import useWindowSize from '../../hooks/UseWindowSize';
import BurgerMenu from './BurgerMenu';

export default function Header() {
  const { width } = useWindowSize();
  
  
  return (
    <>
    
    {/* Móvil primero: mientras el ancho es desconocido (SSR/carga), mostramos
        el menú móvil — el 85% de la audiencia entra desde el teléfono. */}
    {width >= 1024 ? <MenuHeader /> : <BurgerMenu />}
    </>
  )
}
