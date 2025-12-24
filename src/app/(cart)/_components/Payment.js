import React from 'react'
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';

export default function Payment(props) {
  const { setStep, setSuccess } = props;


  return (
    <div className="min-h-screen bg-white flex flex-row justify-between font-sans">
          <div className="w-1/2 space-y-6 min-h-screen py-14 px-40 ">
          <PaymentForm />
          </div>
         
          <div className="bg-[#FFF5F3] w-1/2 min-h-screen sticky py-10 top-10">
            <OrderSummary setSuccess={setSuccess} />
          </div>
          
         </div>
  )
}
