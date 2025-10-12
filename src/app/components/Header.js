'use client';
import React from 'react'
import MenuHeader from './MenuHeader'
import useWindowSize from '../../hooks/UseWindowSize';
import BurgerMenu from './BurgerMenu';

export default function Header() {
  const { width } = useWindowSize();
  
  
  return (
    <>
    
    {width < 1024 ? <BurgerMenu /> : <MenuHeader />}
    </>
  )
}
