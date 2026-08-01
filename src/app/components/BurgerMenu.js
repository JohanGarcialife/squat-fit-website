'use client';
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useUiStore } from '@/stores/ui.store';
import ConfirmationModal from './ConfirmationModal';
import HomeIcon from './icons/HomeIcon';

export default function BurgerMenu() {
  const [show, setShow] = useState(false)
  const { isAuth, logout, user } = useAuthStore();
  const { cart } = useCartStore();
  const { openCart } = useUiStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // En las propias páginas de acceso/registro no tiene sentido repetir
  // los botones "Acceder"/"Registro" dentro del menú
  const isAuthPage = pathname === '/login' || pathname === '/register';

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

  // El overlay se renderiza con un portal a <body> para escapar del header
  // sticky: al llevar transform, atrapaba el `fixed` del drawer y el menú se
  // abría solo dentro de la barra en vez de por delante de toda la página.
  const overlay = (
    <>
      {/* Fondo oscurecido: se desvanece con la MISMA transición que el drawer
          (antes se desmontaba de golpe y el menú quedaba flotando al salir) */}
      {/* z-[100] y no z-[60]: los dos avisos flotantes de abajo (CookieBanner y
          FormularioPendiente) están a z-[90] y se pintaban POR ENCIMA del menú
          abierto. No era solo estético — el de cookies mide 199px de alto y en
          móvil tapaba «Acceder» y «Registro» por completo (44 de 44 píxeles
          robados, medido con elementFromPoint), así que un visitante primerizo
          que abría el menú no podía entrar ni registrarse. El de formulario
          pendiente se comía 20 de los 44 y desviaba el toque al cuestionario.
          Un menú modal va por delante de todo mientras está abierto. */}
      <div
        className={`fixed inset-0 bg-black/25 z-[100] transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShow(false)}
        aria-hidden={!show}
      />

      {/* Capa que recorta el drawer cuando está aparcado fuera de pantalla */}
      <div className='fixed inset-0 z-[100] overflow-hidden pointer-events-none'>
      {/* Drawer lateral: mismo concepto que el índice del panel
          (tarjeta crema flotante, cierre naranja, textos azules).
          Se desliza y desvanece a la vez para una salida limpia. */}
      <div
        className={`pointer-events-auto absolute top-[20px] left-[20px] h-[calc(100dvh-40px)] w-[300px] bg-[#FFF6F0] rounded-[40px] shadow-2xl flex flex-col py-8 px-6 transition-[transform,opacity] duration-300 ease-in-out overflow-y-auto ${
          show ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+20px)] opacity-0'
        }`}
        aria-hidden={!show}
      >
        {/* Cabecera: logo (lleva a la home) + cerrar */}
        <div className='flex items-center justify-between mb-8'>
          <Link href="/" onClick={() => setShow(false)}>
            <Image
              src="/LogoSquadFit-horizontal.png"
              width={150}
              height={36}
              alt="Squad Fit — Inicio"
              className='object-contain'
            />
          </Link>
          <button onClick={() => setShow(false)} className='text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer' aria-label='Cerrar menú'>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className='flex flex-col gap-1'>
          {[
            { href: '/', label: 'Inicio' },
            { href: '/programa', label: 'Programa' },
            { href: '/cocina', label: 'Cocina' },
            { href: '/cursos', label: 'Cursos' },
            { href: '/nosotros', label: 'Conócenos' },
            { href: '/politicas', label: 'Políticas' },
          ].map((item) => {
            // '/' (Inicio) solo activo en la home exacta; el resto por prefijo
            // (si no, startsWith('/') marcaría Inicio en todas las páginas).
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShow(false)}
                className={`font-bold text-2xl py-3 px-3 rounded-2xl active:scale-[0.98] transition-all ${
                  isActive
                    ? 'text-primary bg-[#FFEDE0]'
                    : 'text-secondary hover:bg-[#FF690B]/10 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zona de cuenta, anclada abajo. Botones en fila (antes apilados a
            todo ancho con text-xl): texto y padding más contenidos, pero
            min-h-[44px] mantiene el área táctil aunque se vean más pequeños. */}
        <div className='mt-auto pt-8 flex flex-col gap-3'>
          {isClient && isAuth ? (
            <>
              <p className='text-[#3932C0]/80 text-sm font-medium text-center'>Hola, {user?.firstName || user?.username}</p>
              <div className='flex gap-3 w-full'>
                <Link href="/panel-control" onClick={() => setShow(false)} className='flex-1'>
                  <div className='flex items-center justify-center min-h-[44px] bg-secondary py-2 px-3 rounded-[20px] shadow-md cursor-pointer active:scale-95 transition-transform'>
                    <p className='text-sm font-bold text-white'>Mi panel</p>
                  </div>
                </Link>
                <div onClick={() => setIsModalOpen(true)} className='flex-1 flex items-center justify-center min-h-[44px] py-2 px-3 border-2 border-primary rounded-[20px] cursor-pointer active:scale-95 transition-transform'>
                  <p className='text-sm font-bold text-primary'>Cerrar sesión</p>
                </div>
              </div>
            </>
          ) : !isAuthPage && (
            <div className='flex gap-3 w-full'>
              <Link href="/login" onClick={() => setShow(false)} className='flex-1'>
                <div className='flex items-center justify-center min-h-[44px] py-2 px-3 border-2 border-primary rounded-[20px] cursor-pointer active:scale-95 transition-transform'>
                  <p className='text-sm font-bold text-primary'>Acceder</p>
                </div>
              </Link>
              <Link href="/register" onClick={() => setShow(false)} className='flex-1'>
                <div className='flex items-center justify-center min-h-[44px] py-2 px-3 bg-primary rounded-[20px] shadow-md cursor-pointer active:scale-95 transition-transform'>
                  <p className='text-sm font-bold text-white'>Registro</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogoutConfirmed}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />
    </>
  );

  return (
    <div className='flex flex-row items-center justify-between px-5 py-2.5'>
      {/* Menú a la IZQUIERDA del logo: azul en reposo, naranja al abrirse.
          Todo el grupo (botón + logo) se oculta al abrir: el cajón sale
          por este mismo lado y quedaría debajo tapándolo a medias durante
          la transición (antes pasaba lo mismo con el carrito, cuando el
          cajón salía por la derecha). */}
      <div className={`${show ? 'invisible' : 'flex'} items-center gap-3`}>
        <button
          className='p-1 active:scale-90 transition-all cursor-pointer'
          style={{ color: '#363C98' }}
          onClick={() => setShow(true)}
          aria-label='Abrir menú'
          aria-expanded={show}
        >
          <svg width="27" height="20" viewBox="0 0 27 20" fill="none" aria-hidden="true">
            <line x1="2.8" y1="3" x2="24.2" y2="3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <line x1="2.8" y1="10" x2="24.2" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <line x1="2.8" y1="17" x2="24.2" y2="17" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/">
          <Image
            src="/LogoSquadFit-horizontal.png"
            width={192}
            height={46}
            alt="Logo"
            className='object-contain'
          />
        </Link>
      </div>

      {/* Casa (con sesión) + carrito a la derecha. Se ocultan con el drawer
          abierto por el mismo motivo que el grupo de la izquierda. */}
      <div className={`${show ? 'invisible' : 'flex'} items-center gap-2`}>
        {/* Casa: atajo a "Mi panel" desde la tienda. Solo con sesión iniciada
            (en escritorio ya existe el botón "Mi panel" de MenuHeader, así
            que este icono es exclusivo del menú móvil). p-[11px] alrededor
            del icono de 22px deja exactamente 44px de área táctil. */}
        {isClient && isAuth && (
          <Link
            href="/panel-control"
            aria-label='Ir a mi panel'
            className='flex items-center justify-center p-[11px] text-secondary hover:text-primary active:scale-90 transition cursor-pointer'
          >
            <HomeIcon width={22} height={22} />
          </Link>
        )}
        {/* Carrito: abre el pop-up. Siempre visible, aunque esté vacío; el badge
            solo sale si hay unidades. El pop-up ya tiene su estado vacío. */}
        {isClient && (
          <button
            onClick={openCart}
            aria-label={totalItems > 0 ? `Ver carrito (${totalItems})` : 'Ver carrito (vacío)'}
            className='relative text-secondary hover:text-primary active:scale-90 transition cursor-pointer'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <circle cx="6" cy="19" r="2" />
              <circle cx="17" cy="19" r="2" />
              <path d="M17 17h-11v-14h-2" />
              <path d="M6 5l14 1l-1 7h-13" />
            </svg>
            {totalItems > 0 && (
              <span className='absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center'>
                {totalItems}
              </span>
            )}
          </button>
        )}

      </div>

      {isClient && createPortal(overlay, document.body)}
    </div>
  )
}
