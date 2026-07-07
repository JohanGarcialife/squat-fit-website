'use client';
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import ConfirmationModal from './ConfirmationModal';

export default function BurgerMenu() {
  const [show, setShow] = useState(false)
  const { isAuth, logout, user } = useAuthStore();
  const { cart } = useCartStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const handleLogoutConfirmed = () => {
    logout();
    setIsModalOpen(false);
    setShow(false);
    router.push('/');
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
        {/* Carrito eliminado de aquí */}

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

      {/* Fondo oscurecido al abrir */}
      {show && (
        <div
          className='fixed inset-0 bg-black/20 z-40 transition-opacity'
          onClick={() => setShow(false)}
        />
      )}

      {/* Drawer lateral: mismo concepto que el índice del panel
          (tarjeta crema flotante, cierre naranja, textos azules) */}
      <div
        className={`fixed top-[20px] right-[20px] h-[calc(100vh-40px)] w-[300px] bg-[#FFF6F0] rounded-[40px] shadow-2xl z-50 flex flex-col py-8 px-6 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          show ? 'translate-x-0' : 'translate-x-[calc(100%+20px)]'
        }`}
      >
        {/* Cabecera: etiqueta + cerrar */}
        <div className='flex items-center justify-between mb-8'>
          <span className='text-xs font-bold text-[#3932C0] uppercase tracking-widest opacity-50'>
            Menú
          </span>
          <button onClick={() => setShow(false)} className='text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer' aria-label='Cerrar menú'>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className='flex flex-col gap-1'>
          {[
            { href: '/cocina', label: 'Cocina' },
            { href: '/planes', label: 'Planes' },
            { href: '/cursos', label: 'Cursos' },
            { href: '/politicas', label: 'Políticas' },
            { href: '/nosotros', label: 'Nosotros' },
          ].map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShow(false)}
                className={`font-bold text-2xl py-3 px-3 rounded-2xl active:scale-[0.98] transition-all ${
                  isActive
                    ? 'text-primary bg-[#FF690B]/5'
                    : 'text-secondary hover:bg-[#FF690B]/5 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zona de cuenta, anclada abajo */}
        <div className='mt-auto pt-8 flex flex-col gap-3'>
          {isClient && isAuth ? (
            <>
              <p className='text-[#3932C0]/80 text-lg font-medium text-center'>Hola, {user?.username}</p>
              <Link href="/panel-control" onClick={() => setShow(false)} className='w-full'>
                <div className='flex justify-center bg-secondary py-3 px-4 rounded-[20px] shadow-md cursor-pointer active:scale-95 transition-transform'>
                  <p className='text-xl font-bold text-white'>Mi panel</p>
                </div>
              </Link>
              <div onClick={() => setIsModalOpen(true)} className='flex justify-center py-3 px-4 border-2 border-primary rounded-[20px] cursor-pointer active:scale-95 transition-transform w-full'>
                <p className='text-xl font-bold text-primary'>Cerrar sesión</p>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setShow(false)} className='w-full'>
                <div className='flex justify-center py-3 px-4 border-2 border-primary rounded-[20px] cursor-pointer active:scale-95 transition-transform'>
                  <p className='text-xl font-bold text-primary'>Acceder</p>
                </div>
              </Link>
              <Link href="/register" onClick={() => setShow(false)} className='w-full'>
                <div className='flex justify-center py-3 px-4 bg-primary rounded-[20px] shadow-md cursor-pointer active:scale-95 transition-transform'>
                  <p className='text-xl font-bold text-white'>Registro</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
       <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogoutConfirmed}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />
    </div>
  )
}
