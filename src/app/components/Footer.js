'use client'
import React, { useState } from 'react'
import MenuHeader from './MenuHeader'
import Link from 'next/link';
import Image from 'next/image';
import useWindowSize from '@/hooks/UseWindowSize';

export default function Footer() { 
  const { width } = useWindowSize();
  const [active, setActive] = useState('home')
  return (
    <>
    
    {width < 1024 ? 
    <div className='flex flex-col items-center justify-center py-12'>

    <Link href="/">
                <Image
                    src="/Logo-horizontal.png"
                    width={210}
                    height={50}
                    alt="Logo"
                />
            </Link> 

            <nav className='flex flex-col items-center justify-center'>
              <Link href="/" className={active === 'home' ? 'text-2xl text-primary': 'text-2xl text-secondary'} onClick={() => setShow(false)}>Inicio</Link>
                  <Link href="/cocina" className={active === 'cocina' ? 'text-2xl text-primary': 'text-2xl text-secondary'} onClick={() => setShow(false)}>Cocina</Link>
                  <Link href="/planes" className={active === 'planes' ? 'text-2xl text-primary': 'text-2xl text-secondary'} onClick={() => setShow(false)}>Planes</Link>
                  <Link href="/cursos" className={active === 'cursos' ? 'text-2xl text-primary': 'text-2xl text-secondary'} onClick={() => setShow(false)}>Cursos</Link>
            </nav>
    </div>
            
            : <MenuHeader />}
    </>
  )
}
