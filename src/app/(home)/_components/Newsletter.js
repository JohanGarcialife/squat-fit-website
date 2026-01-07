'use client';

import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (email) => {
    // Expresión regular simple para validación de email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValid(validateEmail(newEmail));
  };

  return (
    <div className='bg-secondary flex flex-col items-center justify-center py-10 md:py-40'>
        <h2 className='font-bold text-white text-4xl max-w-[300px] md:text-6xl md:max-w-[1000px] w-full text-center'>Suscríbete a nuestra newsletter para recibir ofertas y noticias</h2>
        <div className='mt-10 flex w-full px-5 flex-col lg:flex-row gap-5 max-w-[300px] md:max-w-[710px] items-center justify-between'>
            <div className='border border-white rounded-2xl lg:w-[440px] p-4 w-full'>
                <input 
                    placeholder='Tu email'
                    value={email}
                    onChange={handleEmailChange}
                    className='w-full bg-transparent text-white placeholder-gray-300 outline-none'
                />
            </div>
            <button 
                className={`w-full font-bold rounded-2xl p-2 lg:p-4 text-2xl transition-colors duration-300 ${
                    isValid 
                    ? 'bg-orange-500 text-white cursor-pointer' 
                    : 'bg-white text-primary cursor-not-allowed opacity-70'
                }`}
                disabled={!isValid}
            >
                Subscribirme
            </button>
        </div>
    </div>
  )
}
