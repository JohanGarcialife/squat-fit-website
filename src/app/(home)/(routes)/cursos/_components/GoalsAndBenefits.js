import React from 'react'

export default function GoalsAndBenefits() {
  return (
    <div className='flex flex-col md:flex-row px-3 md:px-10 gap-8 my-52'>
        <div className='bg-[#3932C080] rounded-[80px] md:w-1/2 py-14 px-6 md:p-14'>
        <p className='text-white font-bold text-5xl md:text-6xl mb-8 pr-20'>Objetivos que lograrás</p>
        <ul className='list-disc list-inside space-y-10 text-white text-2xl md:text-3xl'>
            <li>Entender los mecanismos del crecimiento muscular y la pérdida de grasa.</li>
            <li>Identificar estrategias para ganar músculo y perder grasa según tu biotipo. </li>
            <li>Aprender a compatibilizar la pérdida de grasa con tu estilo de vida.</li>
            <li>Aumentar tu fuerza a través de la dieta y el ejercicio.</li>
        </ul>
         </div>
        <div className='bg-primary/20 rounded-[80px] md:w-1/2 py-14 px-6 md:p-14'>
         <p className='text-black font-bold text-5xl md:text-6xl mb-8 pr-40'>Beneficios del curso</p>
        <ul className='list-disc list-inside space-y-10 text-black text-2xl md:text-3xl'>
            <li>Conocerás los suplementos más efectivos para ganar músculo</li>
            <li>Aprenderás a mantener los resultados de forma sostenible para siempre.</li>
            <li>Crearás planes de alimentación para perder grasa adaptados a ti.</li>
            <li>Diseñarás rutinas de entrenamiento para ganar fuerza.</li>
        </ul>
         </div>
    </div>
  )
}
