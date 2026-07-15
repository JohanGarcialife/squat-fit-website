'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useUiStore } from '@/stores/ui.store';
import ConfirmationModal from './ConfirmationModal';

export default function MenuHeader() {
    const pathname = usePathname();
    const { isAuth, logout, user } = useAuthStore();
    const { cart } = useCartStore();
    const { openCart } = useUiStore();
    const router = useRouter();
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Determine active menu item based on current URL path
    let active = 'home';
    if (pathname?.startsWith('/cocina')) active = 'cocina';
    else if (pathname?.startsWith('/planes')) active = 'planes';
    else if (pathname?.startsWith('/cursos')) active = 'cursos';

    // En las propias páginas de acceso/registro no tiene sentido repetir
    // los botones "Acceder"/"Registro" en el header
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Hydration fix for client-side state
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        logout();
        setIsModalOpen(false);
        router.push('/');
    };

    return (
        <>
        <div className='flex justify-between items-center px-10 py-4'>
            {/* Grupo de Logo y Enlaces de Navegación */}
            <div className='flex items-center gap-16'> {/* Aumentado el gap para separar logo de enlaces */}
                <Link href="/">
                    <Image
                        src="/LogoSquadFit-horizontal.png"
                        width={250}
                        height={60}
                        alt="Logo"
                    />
                </Link>

                <div className='flex gap-5 text-secondary text-2xl justify-start'> {/* Enlaces ahora justificados a la izquierda dentro de su grupo */}
                    <Link href="/cocina">
                        <p className={`px-4 py-1.5 rounded-2xl transition-colors ${active === 'cocina' ? 'text-primary font-bold bg-[#FFEDE0]' : 'text-secondary hover:text-primary hover:bg-[#FF690B]/10'}`}>
                            Cocina
                        </p>
                    </Link>
                    <Link href="/planes">
                        <p className={`px-4 py-1.5 rounded-2xl transition-colors ${active === 'planes' ? 'text-primary font-bold bg-[#FFEDE0]' : 'text-secondary hover:text-primary hover:bg-[#FF690B]/10'}`}>
                            Planes
                        </p>
                    </Link>
                    <Link href="/cursos">
                        <p className={`px-4 py-1.5 rounded-2xl transition-colors ${active === 'cursos' ? 'text-primary font-bold bg-[#FFEDE0]' : 'text-secondary hover:text-primary hover:bg-[#FF690B]/10'}`}>
                            Cursos
                        </p>
                    </Link>
                </div>
            </div>

            {/* Iconos de Carrito y Botones de Autenticación */}
            <div className='flex gap-5 items-center'>
                {/* Carrito: abre el pop-up. Siempre visible, aunque esté vacío; el
                    badge solo sale si hay unidades. */}
                {isClient && (
                    <button
                        onClick={openCart}
                        aria-label={totalItems > 0 ? `Ver carrito (${totalItems})` : 'Ver carrito (vacío)'}
                        className='relative text-secondary hover:text-primary active:scale-90 transition cursor-pointer'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

                {isClient && isAuth ? (
                    <>
                    <Link href="/panel-control">
                        <button className='relative group overflow-hidden bg-secondary hover:bg-[#E7E6FF] hover:text-[#363C98] text-white px-6 py-2 rounded-[20px] font-bold text-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer'>
                            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden="true" />
                            Mi panel
                        </button>
                    </Link>
                    <p className='text-secondary text-xl ml-2'>Hola, {user?.firstName || user?.username}</p>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className='text-secondary font-bold hover:opacity-80 text-2xl transition cursor-pointer flex items-center gap-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3932C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-logout" aria-hidden="true" focusable="false">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                              <path d="M9 12h12l-3 -3" />
                              <path d="M18 15l3 -3" />
                            </svg>
                            <span className="sr-only">Cerrar sesión</span>
                        </button>
                    </>
                ) : !isAuthPage && (
                    <>
                        <Link href="/login">
                            <button className='relative group overflow-hidden bg-background border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-2 rounded-[20px] font-bold text-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer'>
                                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden="true" />
                                Acceder
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className='relative group overflow-hidden bg-primary hover:bg-[#FFEDE0] hover:text-[#FF690B] text-background px-8 py-2 rounded-[20px] font-bold hover:scale-105 active:scale-95 text-2xl transition-all duration-300 cursor-pointer'>
                                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden="true" />
                                Registro
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </div>

        <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleLogout}
            message="¿Estás seguro de que quieres cerrar sesión?"
        />
        </>
    )
}
