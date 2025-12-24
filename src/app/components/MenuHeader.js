'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '../../stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import MiniCart from './MiniCart';

export default function MenuHeader() {
    const [active, setActive] = useState('home')
    const { isAuth, logout, user } = useAuthStore();
    const { cart } = useCartStore();
    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Hydration fix for client-side state
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className='flex justify-between items-center px-10 py-7'>
            <Link href="/">
                <Image
                    src="/Logo-horizontal.png"
                    width={250}
                    height={60}
                    alt="Logo"
                />
            </Link>

            <div className='flex gap-9 text-secondary text-2xl'>
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

            <div className='flex gap-5 items-center'>
                <div className='relative'>
                    <button onClick={() => setIsCartOpen(!isCartOpen)} className='relative' aria-label="Ver carrito">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3932C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <circle cx="6" cy="19" r="2" />
                            <circle cx="17" cy="19" r="2" />
                            <path d="M17 17h-11v-14h-2" />
                            <path d="M6 5l14 1l-1 7h-13" />
                        </svg>
                        {isClient && totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                    {isCartOpen && <MiniCart onClose={() => setIsCartOpen(false)} />}
                </div>

                {isClient && isAuth ? (
                    <>
                    <Link href="/profile">
                        <p className='text-secondary text-xl cursor-pointer'>Hola, {user?.username}</p>
                        </Link>
                        <button 
                            onClick={logout} 
                            className=' text-secondary px-8 py-2 font-bold hover:opacity-80 text-4xl transition cursor-pointer flex items-center gap-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3932C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-logout" aria-hidden="true" focusable="false">
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
    )
}
