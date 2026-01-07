'use client';
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import MiniCart from './MiniCart';

export default function BurgerMenu() {
  const [show, setShow] = useState(false)
  const { isAuth, logout, user } = useAuthStore();
  const { cart } = useCartStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Hydration fix for client-side state
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
      setIsClient(true);
  }, []);

  // Evitar scroll en el fondo cuando el burger está abierto
  useEffect(() => {
    if (!isClient) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (show) {
      document.body.style.overflow = 'hidden';
      const scrollbarComp = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarComp > 0) {
        document.body.style.paddingRight = `${scrollbarComp}px`;
      }
    } else {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [show, isClient]);

  const handleLogout = () => {
    logout();
    setShow(false);
  }

  return (
    <div className='flex flex-row items-center justify-between px-5 py-4'>
      <Link href="/">
        <Image
          src="/Logo-horizontal.png"
          width={210}
          height={50}
          alt="Logo"
          className='object-contain'
        />
      </Link>
      
      <div className='flex items-center gap-4'>
        {isClient && cart.length > 0 && (
            <div className='relative'>
                <button onClick={() => setIsCartOpen(!isCartOpen)} className='relative' aria-label="Ver carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3932C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="6" cy="19" r="2" />
                        <circle cx="17" cy="19" r="2" />
                        <path d="M17 17h-11v-14h-2" />
                        <path d="M6 5l14 1l-1 7h-13" />
                    </svg>
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </button>
                {isCartOpen && <MiniCart onClose={() => setIsCartOpen(false)} />}
            </div>
        )}

        <div className={show ? "hidden" : "block"} onClick={() => setShow(true)}>
          <Image
            src="/icons/menu.png"
            width={40}
            height={30}
            alt="Menu"
            className='cursor-pointer'
          />
        </div>
      </div>

      {show &&
        <div className='fixed inset-0 z-50' >
          <div className='w-full h-screen bg-linear-to-b from-primary to-secondary opacity-90 px-5 pb-32 pt-10 flex flex-col overflow-y-auto'>
            <div className='flex justify-end'>
              <div onClick={() => setShow(false)}>
                <Image
                  src="/icons/Close.png"
                  width={32}
                  height={32}
                  alt="Close"
                  className='cursor-pointer'
                />
              </div>
            </div>
            <nav className='flex flex-col items-center justify-center gap-4 mt-10'>
              <Link href="/" className='text-5xl font-bold text-white' onClick={() => setShow(false)}>Inicio</Link>
              <Link href="/cocina" className='text-5xl font-bold text-white' onClick={() => setShow(false)}>Cocina</Link>
              <Link href="/planes" className='text-5xl font-bold text-white' onClick={() => setShow(false)}>Planes</Link>
              <Link href="/cursos" className='text-5xl font-bold text-white' onClick={() => setShow(false)}>Cursos</Link>
               <Link href="/politicas">
                    <p
                        className='text-5xl font-bold text-white'
                         onClick={() => setShow(false)}
                    >
                        Políticas
                    </p>
                </Link>
                <Link href="/nosotros">
                    <p
                        className='text-5xl font-bold text-white'
                         onClick={() => setShow(false)}
                    >
                        Nosotros
                    </p>
                </Link>
            </nav>
            
            <div className="mt-10 flex flex-col items-center gap-4">
              {isClient && isAuth ? (
                <>
                <Link href="/profile">
                
                  <p className='text-white text-3xl'>Hola, {user?.username}</p>
                </Link>
                  <div onClick={handleLogout} className='flex justify-center py-2 px-4 border border-white rounded-xl cursor-pointer mt-4'>
                    <p className='text-5xl font-bold text-white'>Logout</p>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setShow(false)} className='w-full'>
                    <div className='flex justify-center py-2 px-4 border border-white rounded-xl cursor-pointer'>
                      <p className='text-5xl font-bold text-white'>Acceder</p>
                    </div>
                  </Link>
                  <Link href="/register" onClick={() => setShow(false)} className='w-full'>
                    <div className='flex justify-center py-2 px-4 border border-white rounded-xl cursor-pointer'>
                      <p className='text-5xl font-bold text-white'>Registro</p>
                    </div>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      }
    </div>
  )
}
