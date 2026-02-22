'use client'
import Image from 'next/image'
import React from 'react'
import { FaCheck } from 'react-icons/fa'

export default function HowItWorks() {
  return (
    <div className='w-full py-20 px-4 flex flex-col items-center bg-white'>
        <h2 className='text-secondary text-4xl md:text-5xl font-bold text-center mb-16'>¿Cómo funciona el programa?</h2>
        
        <div className='flex flex-col md:flex-row justify-center items-center w-full max-w-6xl gap-10 md:gap-0 relative'>
            
            {/* Línea conectora visible solo en desktop, por detrás de las tarjetas */}
            <div className='hidden md:block absolute top-[60%] left-[15%] w-[70%] h-1 bg-primary z-0'></div>

            {/* Step 1 */}
            <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
                <p className='text-primary text-2xl font-bold mb-4'>Paso 1</p>
                <div className='bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center min-h-[220px] w-[90%] md:w-[80%] border border-gray-100'>
                    <div className='relative mb-4 w-16 h-16'>
                        <Image src="/icons/edit_document.png" fill className='object-contain' alt="Formulario" />
                    </div>
                    {/* <div className='w-8 h-8 rounded-full bg-primary border-4 border-white absolute -right-4 top-[50%] hidden md:block' style={{ transform: 'translate(50%, -50%)' }} /> */}
                    <p className='text-gray-800 font-medium text-lg leading-snug'>Rellenas el formulario e iniciamos tu evaluación</p>
                </div>
            </div>

            {/* Step 2 */}
            <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
                <p className='text-primary text-2xl font-bold mb-4'>Paso 2</p>
                <div className='bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center min-h-[220px] w-[90%] md:w-[80%] border border-gray-100'>
                    <div className='relative mb-4 w-16 h-16'>
                        <Image src="/icons/contract_edit.png" fill className='object-contain' alt="Videollamada" />
                    </div>
                <div className='w-8 h-8 rounded-lg bg-primary md:flex items-center justify-center  absolute -left-4 top-[50%] hidden ' style={{ transform: 'translate(0%, 40%)' }} >
                        <FaCheck />

                    </div>
                    <p className='text-gray-800 font-medium text-lg leading-snug'>Revisamos tu caso y agendamos una videollamada</p>
                </div>
            </div>

            {/* Step 3 */}
            <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
                <p className='text-primary text-2xl font-bold mb-4'>Paso 3</p>
                <div className='bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center min-h-[220px] w-[90%] md:w-[80%] border border-gray-100'>
                    <div className='relative mb-4 w-16 h-16'>
                        <Image src="/icons/muscle.png" fill className='object-contain' alt="Acompañamiento" />
                    </div>
                    <div className='w-8 h-8 rounded-lg bg-primary md:flex items-center justify-center  absolute -left-4 top-[50%] hidden ' style={{ transform: 'translate(0%, 40%)' }} >
                        <FaCheck />

                    </div>
                    <p className='text-gray-800 font-medium text-lg leading-snug'>Diseñamos tu plan e iniciamos con el acompañamiento</p>
                </div>
            </div>

        </div>

        <button className='mt-16 bg-primary text-white font-bold text-xl px-12 py-4 rounded-xl shadow-lg hover:opacity-90 transition'>
            Aplicar al programa
        </button>
    </div>
  )
}
