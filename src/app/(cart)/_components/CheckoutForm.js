'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronDown, Check } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkout.store';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getNames, getCode } from 'country-list';


const validationSchema = Yup.object({
  dni_cif: Yup.string(),
  firstName: Yup.string().required('El nombre es obligatorio'),
  lastName: Yup.string().required('Los apellidos son obligatorios'),
  address: Yup.string().required('La dirección es obligatoria'),
  apartment: Yup.string(),
  postalCode: Yup.string().required('El código postal es obligatorio'),
  city: Yup.string().required('La ciudad es obligatoria'),
  country: Yup.string().required('El país es obligatorio'),
  phone: Yup.string().required('El teléfono es obligatorio'),
  email: Yup.string().email('El e-mail no es válido').required('El e-mail es obligatorio'),
  shippingNotes: Yup.string(),
});

export default function CheckoutForm({ setStep, onValidationChange, submitRef }) {
  const { formData, updateFormData } = useCheckoutStore();
  const [customerType, setCustomerType] = useState('particular');
  const [sameAddress, setSameAddress] = useState(true);

  const countryNames = useMemo(() => getNames(), []);

  return (
    <div className="w-full max-w-lg mx-auto pb-10">
        <div className="mb-8">
          <span className="text-indigo-900 text-lg font-medium">Paso 2 de 3</span>
          <div onClick={() => setStep(1)} className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 group">
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            <h1 className="text-3xl md:text-4xl font-bold">Mis datos</h1>
          </div>
        </div>

        <h2 className="text-indigo-900 font-bold text-lg mb-4">Dirección de facturación</h2>

        <div className="flex gap-4 mb-8">
          <button
            onClick={(e) => { e.preventDefault(); setCustomerType('particular'); }}
            className={`px-8 py-2.5 rounded-full font-bold transition-all border-2 cursor-pointer ${
              customerType === 'particular' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-300 hover:border-orange-500'
            }`}
          >
            Particular
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setCustomerType('empresa'); }}
            className={`px-8 py-2.5 rounded-full font-bold transition-all border-2 cursor-pointer ${
              customerType === 'empresa' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-300 hover:border-orange-500'
            }`}
          >
            Empresa
          </button>
        </div>

        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            updateFormData(values);
            // setStep(3) will be handled by OrderSummary
          }}
        >
          {({ isValid, dirty, setFieldValue, submitForm }) => {
            useEffect(() => {
              onValidationChange(isValid, dirty);
            }, [isValid, dirty, onValidationChange]);

            // Expose Formik's submitForm to the parent via the ref
            if (submitRef) {
              submitRef.current = submitForm;
            }

            return (
              <Form className="space-y-5">
                <InputField label="DNI/CIF (opcional)" name="dni_cif" placeholder="Número de Identificación" />
                <InputField label="Nombre*" name="firstName" placeholder="Tu nombre" />
                <InputField label="Apellidos*" name="lastName" placeholder="Tus apellidos" />
                <div className="h-2"></div>
                <InputField label="Dirección*" name="address" placeholder="Introduce tu calle y número" />
                <InputField label="Piso / puerta (opcional)" name="apartment" placeholder="Piso, puerta, etc." />
                <InputField label="Código postal*" name="postalCode" placeholder="XXXXX" />
                <InputField label="Ciudad*" name="city" placeholder="Tu ciudad" />
                <div className="flex flex-col gap-1">
                  <label htmlFor="country" className="text-orange-500 text-sm ml-1">País*</label>
                  <div className="relative">
                    <Field as="select" id="country" name="country" className="w-full appearance-none bg-white border border-orange-300 rounded-2xl px-5 py-3 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer">
                      <option value="">Selecciona un país</option>
                      {countryNames.map((country) => (
                        <option key={country} value={getCode(country)}>
                          {country}
                        </option>
                      ))}
                    </Field>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                  <ErrorMessage name="country" component="div" className="text-red-500 text-sm" />
                </div>
                <div className="h-4"></div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="phone" className="text-orange-500 text-sm ml-1">Teléfono*</label>
                  <PhoneInput
                    country={'es'}
                    value={formData.phone}
                    onChange={(phone) => setFieldValue('phone', phone)}
                    inputClass="!w-full !border !border-orange-300 !rounded-2xl !px-5 !py-3 !placeholder-orange-200 !text-gray-700 !outline-none focus:!border-orange-500 focus:!ring-1 focus:!ring-orange-500 !transition-all"
                    containerClass="!w-full"
                    buttonClass="!border-r-0 !border-orange-300 !bg-white !rounded-l-2xl !px-3"
                    dropdownClass="!rounded-b-2xl"
                    inputProps={{ id: 'phone' }}
                  />
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                </div>
                <InputField label="e-mail*" name="email" placeholder="Tu correo electrónico" type="email" />
                <div className="flex items-center gap-3 cursor-pointer mt-2" onClick={() => setSameAddress(!sameAddress)}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${sameAddress ? 'bg-orange-500' : 'border border-orange-300'}`}>
                    {sameAddress && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-orange-500">Usar la misma dirección para Envío</span>
                </div>
                <div className="h-2"></div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="shippingNotes" className="text-orange-500 text-sm ml-1">Notas del envío (opcional)</label>
                  <Field as="textarea" id="shippingNotes" name="shippingNotes" rows={4} placeholder="Escribe aquí..." className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
                </div>
              </Form>
            );
          }}
        </Formik>
    </div>
  );
}

function InputField({ label, placeholder, type = 'text', name }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-orange-500 text-sm ml-1">{label}</label>
      <Field
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
      />
      <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
    </div>
  );
}