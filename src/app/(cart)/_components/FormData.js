import React from 'react'
import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'

export default function FormData(props) {
  const { setStep } = props;
  return (
     <div className="min-h-screen bg-white flex flex-row justify-between font-sans">
      <div className="w-1/2 space-y-6 min-h-screen py-14 px-40 ">
      <CheckoutForm />
      </div>
     
      <div className="bg-[#FFF5F3] w-1/2 min-h-screen sticky top-10">
        <OrderSummary setStep={setStep} />
      </div>
      
     </div>
  )
}
