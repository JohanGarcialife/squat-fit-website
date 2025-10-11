import React from 'react'

export default function Newsletter() {
  return (
    <div className='bg-secondary flex flex-col items-center justify-center py-10 md:py-40'>
        <h2 className='font-bold text-white text-4xl max-w-[300px] md:text-6xl md:max-w-[1000px] w-full text-center'>Suscríbete a nuestra newsletter para recibir ofertas y noticias</h2>
        <div className='mt-10 flex w-full px-5 flex-col lg:flex-row gap-5 max-w-[300px] md:max-w-[710px] items-center justify-between'>
            <div className='border border-white rounded-2xl lg:w-[440px] p-4 w-full'>
                <input placeholder='Tu email' placeholderColor="#000" />
            </div>
            <button className='bg-white w-full font-bold text-primary rounded-2xl p-2 lg:p-4 text-2xl'>
                Subscribirme
            </button>
        </div>
    </div>
  )
}
