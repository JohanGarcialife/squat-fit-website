import React from 'react'

export default function GoalsAndBenefits() {
  return (
    <div className='flex flex-col md:flex-row px-6 md:px-10 gap-8 my-20 max-w-6xl mx-auto'>
        <div className='bg-secondary/20 rounded-[40px] md:w-1/2 py-10 px-8 md:p-12'>
        <p className='text-black font-bold text-4xl md:text-5xl mb-7'>Objetivos que lograrás</p>
        <ul className='space-y-5 text-black text-xl md:text-2xl'>
            <li className='flex gap-3'><span aria-hidden="true">💪</span><span>Entender cómo funcionan el crecimiento muscular y la pérdida de grasa.</span></li>
            <li className='flex gap-3'><span aria-hidden="true">🎯</span><span>Estrategias para ganar músculo y perder grasa según tu biotipo.</span></li>
            <li className='flex gap-3'><span aria-hidden="true">⚖️</span><span>Compatibilizar la pérdida de grasa con tu estilo de vida.</span></li>
            <li className='flex gap-3'><span aria-hidden="true">📈</span><span>Aumentar tu fuerza con la dieta y el ejercicio.</span></li>
        </ul>
         </div>
        <div className='bg-primary/20 rounded-[40px] md:w-1/2 py-10 px-8 md:p-12'>
         <p className='text-black font-bold text-4xl md:text-5xl mb-7'>Beneficios del curso</p>
        <ul className='space-y-5 text-black text-xl md:text-2xl'>
            <li className='flex gap-3'><span aria-hidden="true">💊</span><span>Los suplementos que de verdad ayudan a ganar músculo.</span></li>
            <li className='flex gap-3'><span aria-hidden="true">♾️</span><span>Resultados sostenibles, para siempre.</span></li>
            <li className='flex gap-3'><span aria-hidden="true">🥗</span><span>Planes de alimentación para perder grasa adaptados a ti.</span></li>
            <li className='flex gap-3'><span aria-hidden="true">🏋️</span><span>Rutinas de entrenamiento para ganar fuerza.</span></li>
        </ul>
         </div>
    </div>
  )
}
