'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import ConfirmationModal from './ConfirmationModal';

export default function MenuHeader() {
    const [active, setActive] = useState('home')
    const { isAuth, logout, user } = useAuthStore();
    const { cart } = useCartStore();
    const router = useRouter();
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Hydration fix for client-side state
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = () => {
        logout();
        setIsModalOpen(false);
        router.push('/');
    };

    return (
        <>
        <div className='flex justify-between items-center px-10 pt-7'>
            {/* Grupo de Logo y Enlaces de Navegación */}
            <div className='flex items-center gap-16'> {/* Aumentado el gap para separar logo de enlaces */}
                <Link href="/">
                    <Image
                        src="/Logo-horizontal.png"
                        width={250}
                        height={60}
                        alt="Logo"
                    />
                </Link>

                <div className='flex gap-9 text-secondary text-2xl justify-start'> {/* Enlaces ahora justificados a la izquierda dentro de su grupo */}
                    <Link href="/">
                        <p
                            className={active === 'home' ? 'text-primary' : 'text-secondary'}
                            onClick={() => setActive('home')}
                        >
                            Inicio
                        </p>
                    </Link>
                    <Link href="/cocina">
                        <p
                            className={active === 'cocina' ? 'text-primary' : 'text-secondary'}
                            onClick={() => setActive('cocina')}
                        >
                            Cocina
                        </p>
                    </Link>
                    <Link href="/">
                        <p
                            className={active === 'planes' ? 'text-primary' : 'text-secondary'}
                            onClick={() => setActive('planes')}
                        >
                            Planes
                        </p>
                    </Link>
                    <Link href="/cursos">
                        <p
                            className={active === 'cursos' ? 'text-primary' : 'text-secondary'}
                            onClick={() => setActive('cursos')}
                        >
                            Cursos
                        </p>
                    </Link>
                </div>
            </div>

            {/* Iconos de Carrito y Botones de Autenticación */}
            <div className='flex gap-5 items-center'>
                {/* Carrito eliminado de aquí */}

                {isClient && isAuth ? (
                    <>
                    <Link href="/panel-control">
                        <p className='text-secondary text-xl cursor-pointer'>Hola, {user?.username}</p>
                        </Link>
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
                ) : (
                    <>
                        <Link href="/login">
                            <button className='bg-background border-2 border-primary text-primary px-8 py-2 rounded-[20px] font-bold text-2xl hover:opacity-80 transition cursor-pointer'>Acceder</button>
                        </Link>
                        <Link href="/register">
                            <button className='bg-primary text-background px-8 py-2 rounded-[20px] font-bold hover:opacity-80 text-2xl transition cursor-pointer'>Registro</button>
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
