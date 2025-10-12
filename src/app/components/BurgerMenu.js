'use client';
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '../../stores/auth.store';

export default function BurgerMenu() {
  const [show, setShow] = useState(false)
  const { isAuth, logout, user } = useAuthStore();

  // Hydration fix for client-side state
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
      setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    setShow(false);
  }

  return (
    <div className='flex flex-row items-center justify-between px-5'>
      <Link href="/">
        <Image
          src="/Logo-horizontal.png"
          width={210}
          height={50}
          alt="Logo"
        />
      </Link>
      <div className={show ? "hidden" : "block"} onClick={() => setShow(true)}>
        <Image
          src="/icons/menu.png"
          width={40}
          height={30}
          alt="Menu"
          className='cursor-pointer'
        />
      </div>
      {show &&
        <div className='absolute top-0 left-0 w-full h-fit opacity-90 z-50' >
          <div className='w-full bg-linear-to-b from-primary to-secondary px-5 pb-32 pt-10 flex flex-col'>
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
            </nav>
            
            <div className="mt-10 flex flex-col items-center gap-4">
              {isClient && isAuth ? (
                <>
                  <p className='text-white text-3xl'>Hola, {user?.username}</p>
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
