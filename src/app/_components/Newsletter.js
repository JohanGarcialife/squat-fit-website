import React from 'react'

export default function Newsletter() {
  return (
    <div className='bg-secondary flex flex-col items-center justify-center py-40'>
        <h2 className='font-bold text-white text-6xl max-w-[1000px] text-center'>Suscríbete a nuestra newsletter para recibir ofertas y noticias</h2>
        <div className='mt-11 flex flex-row gap-5 max-w-[710px] items-center justify-between'>
            <div className='border border-white rounded-2xl w-[440px] p-4'>
                <input placeholder='Tu email' placeholderColor="#000" />
            </div>
            <button className='bg-white font-bold text-primary rounded-2xl p-4 text-2xl'>
                Subscribirme
            </button>
        </div>
    </div>
  )
}
