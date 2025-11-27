import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <div className='font-bold text-black text-4xl min-h-screen px-20'>
    <div className='text-2xl mt-5'>Esta es la página de perfil</div>
    <Link href="/panel-control">
    <div className='bg-primary rounded-lg text-xl mt-3 py-3 px-6 w-fit cursor-pointer text-white'>Panel de control</div> 
    </Link>
    </div>
  )
}
