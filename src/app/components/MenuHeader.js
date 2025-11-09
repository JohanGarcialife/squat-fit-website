'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '../../stores/auth.store';

export default function MenuHeader() {
    const [active, setActive] = useState('home')
    const { isAuth, logout, user } = useAuthStore();

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
                <Link href="/">
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
                {isClient && isAuth ? (
                    <>
                        <p className='text-secondary text-xl'>Hola, {user?.username}</p>
                        <button 
                            onClick={logout} 
                            className='bg-primary text-background px-8 py-2 rounded-[20px] font-bold hover:opacity-80 text-2xl transition cursor-pointer'>
                            Logout
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
