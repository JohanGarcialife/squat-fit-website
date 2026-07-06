'use client'
import Image from 'next/image'
import React from 'react'
import { FaCheck } from 'react-icons/fa'
import LandingButton from '../../components/LandingButton';

export default function HowItWorks() {
  return (
    <div className='w-full py-16 px-4 flex flex-col items-center bg-white'>
        <h2 className='text-[#3932C0] text-[34px] leading-[1.1] md:text-5xl font-bold text-center mb-12 max-w-[320px] md:max-w-none mx-auto'>
            ¿Cómo funciona <br className="md:hidden" /> el programa?
        </h2>
        
        <div className='flex flex-col md:flex-row justify-center items-center w-full max-w-6xl relative gap-2 md:gap-0'>
            
            {/* Línea conectora visible solo en desktop, por detrás de las tarjetas */}
            <div className='hidden md:block absolute top-[60%] left-[15%] w-[70%] h-1 bg-primary z-0'></div>

            {/* Step 1 */}
            <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
                <div className='bg-white rounded-2xl md:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] md:shadow-xl p-8 flex flex-col items-center justify-center min-h-[260px] w-full max-w-[300px] md:max-w-none md:w-[90%] lg:w-[80%] border border-gray-100 mx-auto transition-transform hover:scale-105'>
                    <div className='flex flex-row items-center justify-center gap-2 mb-4 md:mb-4'>
                        <span className='w-8 h-8 rounded-full bg-primary/10 text-primary hidden md:flex items-center justify-center font-bold'>1</span>
                        <p className='text-primary text-[32px] md:text-2xl font-bold'>Paso 1</p>
                    </div>
                    <div className='relative mb-5 w-[76px] h-[76px] md:w-16 md:h-16'>
                        <Image src="/icons/edit_document.png" fill className='object-contain' alt="Formulario" />
                    </div>
                    <p className='text-black md:text-gray-800 font-normal md:font-medium text-[15px] md:text-lg leading-snug'>
                        <strong>Rellenas el formulario</strong> y <br className="md:hidden" /> nos cuentas tu situación
                    </p>
                </div>
            </div>

            {/* Mobile Connector 1-2 */}
            <div className="flex md:hidden items-center justify-center w-full py-3 relative z-0">
                <div className="w-[160px] h-1.5 bg-primary rounded-full"></div>
                <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <FaCheck className="text-white text-[16px]" />
                </div>
            </div>

            {/* Step 2 */}
            <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
                <div className='bg-white rounded-2xl md:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] md:shadow-xl p-8 flex flex-col items-center justify-center min-h-[260px] w-full max-w-[300px] md:max-w-none md:w-[90%] lg:w-[80%] border border-gray-100 mx-auto transition-transform hover:scale-105'>
                    <div className='flex flex-row items-center justify-center gap-2 mb-4 md:mb-4'>
                        <span className='w-8 h-8 rounded-full bg-primary/10 text-primary hidden md:flex items-center justify-center font-bold'>2</span>
                        <p className='text-primary text-[32px] md:text-2xl font-bold'>Paso 2</p>
                    </div>
                    <div className='relative mb-5 w-[76px] h-[76px] md:w-16 md:h-16'>
                        <Image src="/icons/contract_edit.png" fill className='object-contain' alt="Videollamada" />
                    </div>
                    {/* Desktop Checkmark */}
                    <div className='w-8 h-8 rounded-[10px] bg-primary md:flex items-center justify-center absolute -left-4 top-[50%] hidden' style={{ transform: 'translate(0%, 40%)' }} >
                        <FaCheck className='text-white' />
                    </div>
                    <p className='text-black md:text-gray-800 font-normal md:font-medium text-[15px] md:text-lg leading-snug'>
                        <strong>Revisamos tu caso</strong> y <br className="md:hidden" /> agendamos una llamada
                    </p>
                </div>
            </div>

            {/* Mobile Connector 2-3 */}
            <div className="flex md:hidden items-center justify-center w-full py-3 relative z-0">
                <div className="w-[160px] h-1.5 bg-primary rounded-full"></div>
                <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <FaCheck className="text-white text-[16px]" />
                </div>
            </div>

            {/* Step 3 */}
            <div className='flex flex-col items-center text-center w-full md:w-1/3 relative z-10'>
                <div className='bg-white rounded-2xl md:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] md:shadow-xl p-8 flex flex-col items-center justify-center min-h-[260px] w-full max-w-[300px] md:max-w-none md:w-[90%] lg:w-[80%] border border-gray-100 mx-auto transition-transform hover:scale-105'>
                    <div className='flex flex-row items-center justify-center gap-2 mb-4 md:mb-4'>
                        <span className='w-8 h-8 rounded-full bg-primary/10 text-primary hidden md:flex items-center justify-center font-bold'>3</span>
                        <p className='text-primary text-[32px] md:text-2xl font-bold'>Paso 3</p>
                    </div>
                    <div className='relative mb-5 w-[76px] h-[76px] md:w-16 md:h-16'>
                        <Image src="/icons/muscle.png" fill className='object-contain' alt="Acompañamiento" />
                    </div>
                    {/* Desktop Checkmark */}
                    <div className='w-8 h-8 rounded-[10px] bg-primary md:flex items-center justify-center absolute -left-4 top-[50%] hidden' style={{ transform: 'translate(0%, 40%)' }} >
                        <FaCheck className='text-white' />
                    </div>
                    <p className='text-black md:text-gray-800 font-normal md:font-medium text-[15px] md:text-lg leading-snug'>
                        <strong>Diseñamos tu plan</strong> y empiezas <br className="md:hidden" /> con el acompañamiento
                    </p>
                </div>
            </div>

        </div>

        <LandingButton variant="orange" size="lg" autoShine className='mt-12 w-full max-w-[300px] md:max-w-none md:w-auto'>
            Aplicar al programa
        </LandingButton>
    </div>
  )
}
