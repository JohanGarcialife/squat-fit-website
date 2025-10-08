'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function MenuHeader() {
    const [active, setActive] = useState('home')
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
                <Link href="/">
                    <p
                        className={active === 'cursos' ? 'text-primary' : 'text-secondary'}
                        onClick={() => setActive('cursos')}
                    >
                        Cursos
                    </p>
                </Link>
            </div>

            <div className='flex gap-5'>
                <button className='bg-background border-2 border-primary text-primary px-8 py-2 rounded-[20px] font-bold text-2xl hover:opacity-80 transition cursor-pointer'>Acceder</button>
                <button className='bg-primary text-background px-8 py-2 rounded-[20px] font-bold hover:opacity-80 text-2xl transition cursor-pointer'>Registro</button>
            </div>
        </div>
    )
}
