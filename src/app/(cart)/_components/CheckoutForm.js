'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronDown, Check } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkout.store';
import { useAuthStore } from '@/stores/auth.store';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import esPhone from 'react-phone-input-2/lang/es.json';
import { getData as getCountryData } from 'country-list';
import { useCartStore } from '@/stores/cart.store';


// El DNI/CIF es obligatorio en pedidos de más de 400 € (requisito fiscal, Doc 0)
const DNI_REQUIRED_FROM = 400;

// Países principales que se muestran arriba del todo (en este orden); el resto
// va después por orden alfabético. Etiquetas en español según lo pedido
// (GB se muestra como "Inglaterra", no "Reino Unido").
const PRIORITY_COUNTRIES = ['ES', 'PT', 'GB', 'FR', 'MX', 'AR', 'CO', 'CL'];
const COUNTRY_LABEL_OVERRIDES = { GB: 'Inglaterra' };

const regionNamesEs =
  typeof Intl !== 'undefined' && Intl.DisplayNames ? new Intl.DisplayNames(['es'], { type: 'region' }) : null;
const countryNameEs = (code) => {
  if (COUNTRY_LABEL_OVERRIDES[code]) return COUNTRY_LABEL_OVERRIDES[code];
  try {
    return regionNamesEs ? regionNamesEs.of(code) : code;
  } catch {
    return code;
  }
};

// { priority: [{code,name}], rest: [{code,name}] } con nombres en español.
const buildCountryOptions = () => {
  const all = getCountryData().map((c) => ({ code: c.code, name: countryNameEs(c.code) }));
  const priority = PRIORITY_COUNTRIES.map((code) => ({ code, name: countryNameEs(code) }));
  const rest = all
    .filter((c) => !PRIORITY_COUNTRIES.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return { priority, rest };
};

// Localización española del selector de teléfono (con GB → Inglaterra).
const esPhoneLocalization = { ...esPhone, gb: 'Inglaterra' };

const buildValidationSchema = (dniRequired, isCompany) => Yup.object({
  companyName: isCompany
    ? Yup.string().required('El nombre de la empresa es obligatorio')
    : Yup.string(),
  dni_cif: dniRequired || isCompany
    ? Yup.string().required(isCompany ? 'El CIF es obligatorio' : 'El DNI/CIF es obligatorio en pedidos de más de 400 €')
    : Yup.string(),
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
  const { user } = useAuthStore();
  const { cart } = useCartStore();
  const [customerType, setCustomerType] = useState('particular');
  const [sameAddress, setSameAddress] = useState(true);

  const isCompany = customerType === 'empresa';
  const countryOptions = useMemo(() => buildCountryOptions(), []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [cart],
  );
  const dniRequired = subtotal >= DNI_REQUIRED_FROM;
  const validationSchema = useMemo(
    () => buildValidationSchema(dniRequired, isCompany),
    [dniRequired, isCompany],
  );

  const initialValues = useMemo(() => {
    // Prefill de cliente existente: si ya inició sesión en el paso 1, traemos
    // sus datos conocidos (email, nombre, apellidos, teléfono) para no repetir.
    const userEmail = (user?.email && user.email.includes('@'))
      ? user.email
      : ((user?.username && user.username.includes('@')) ? user.username : '');
    return {
      companyName: '',
      ...formData,
      email: formData.email || userEmail || '',
      firstName: formData.firstName || user?.firstName || '',
      lastName: formData.lastName || user?.lastName || '',
      phone: formData.phone || user?.phone_number || '',
    };
  }, [formData, user]);

  return (
    <div className="w-full max-w-lg mx-auto pb-10">
        <div className="mb-8">
          <span className="text-indigo-900 text-lg font-medium">Paso 2 de 3</span>
          <div className="cursor-pointer" onClick={() => setStep(1)} className="flex items-center gap-2 mt-2 cursor-pointer text-indigo-900 group">
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            <h1 className="text-3xl md:text-4xl font-bold">Mis datos</h1>
          </div>
        </div>

        {/* Tipo de cliente: al elegir Empresa aparece la razón social */}
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
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            updateFormData(values);
            // setStep(3) will be handled by OrderSummary
          }}
        >
          {({ isValid, dirty, setFieldValue, submitForm, validateForm, setTouched, values }) => {
            useEffect(() => {
              onValidationChange(isValid, dirty);
            }, [isValid, dirty, onValidationChange]);

            // Exponemos los helpers de Formik al padre vía ref. El padre valida
            // con validateForm() (resultado real, no el isValid del closure) antes
            // de avanzar al paso de pago; setTouched marca los campos para mostrar
            // los errores si faltan datos.
            if (submitRef) {
              submitRef.current = { submitForm, validateForm, setTouched };
            }

            return (
              <Form className="space-y-8">
                {/* ── Sección 1: contacto — el email va primero para reconocer
                    a clientes que ya iniciaron sesión y traer sus datos. ── */}
                <section className="space-y-4">
                  <SectionHeading n={1} title="Tus datos" />
                  {isCompany && (
                    <InputField label="Nombre de empresa / razón social*" name="companyName" placeholder="Razón social de la empresa" />
                  )}
                  <InputField label="E-mail*" name="email" placeholder="tu@correo.com" type="email" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Nombre*" name="firstName" placeholder="Tu nombre" />
                    <InputField label="Apellidos*" name="lastName" placeholder="Tus apellidos" />
                  </div>
                  <InputField
                    label={isCompany ? 'CIF*' : (dniRequired ? 'DNI/CIF* (obligatorio en pedidos de +400 €)' : 'DNI/CIF (opcional)')}
                    name="dni_cif"
                    placeholder={isCompany ? 'CIF de la empresa' : 'Número de identificación'}
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="phone" className="text-orange-500 text-sm ml-1 font-medium">Teléfono*</label>
                    <PhoneInput
                      country={'es'}
                      preferredCountries={['es', 'pt', 'gb', 'fr', 'mx', 'ar', 'co', 'cl']}
                      localization={esPhoneLocalization}
                      enableSearch
                      disableSearchIcon
                      searchPlaceholder="Buscar país..."
                      searchNotFound="Sin resultados"
                      value={values.phone}
                      onChange={(phone) => setFieldValue('phone', phone)}
                      inputClass="!w-full !border !border-orange-300 !rounded-2xl !pl-16 !pr-5 !py-3 !placeholder-orange-300 !text-black !outline-none focus:!border-orange-500 focus:!ring-1 focus:!ring-orange-500 !transition-all"
                      containerClass="!w-full"
                      buttonClass="!bg-transparent !border-0 !rounded-l-2xl !pl-3"
                      dropdownClass="!rounded-b-2xl !text-black !max-h-60"
                      searchClass="!text-black"
                      dropdownStyle={{ color: 'black' }}
                      inputStyle={{ color: 'black' }}
                      inputProps={{ id: 'phone' }}
                    />
                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                  </div>
                </section>

                {/* ── Sección 2: dirección de envío ── */}
                <section className="space-y-4">
                  <SectionHeading n={2} title="Dirección de envío" />
                  <InputField label="Dirección*" name="address" placeholder="Introduce tu calle y número" />
                  <InputField label="Piso / puerta (opcional)" name="apartment" placeholder="Piso, puerta, etc." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Código postal*" name="postalCode" placeholder="XXXXX" />
                    <InputField label="Ciudad*" name="city" placeholder="Tu ciudad" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="country" className="text-orange-500 text-sm ml-1 font-medium">País*</label>
                    <div className="relative">
                      <Field as="select" id="country" name="country" className="w-full appearance-none bg-white border border-orange-300 rounded-2xl px-5 py-3 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer">
                        <option value="">Selecciona un país</option>
                        <optgroup label="Principales">
                          {countryOptions.priority.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Todos los países">
                          {countryOptions.rest.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </optgroup>
                      </Field>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                    <ErrorMessage name="country" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer pt-1" onClick={() => setSameAddress(!sameAddress)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${sameAddress ? 'bg-orange-500' : 'border border-orange-300'}`}>
                      {sameAddress && <Check size={16} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-orange-500">Usar la misma dirección para Envío</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="shippingNotes" className="text-orange-500 text-sm ml-1 font-medium">Notas del envío (opcional)</label>
                    <Field as="textarea" id="shippingNotes" name="shippingNotes" rows={3} placeholder="Escribe aquí..." className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
                  </div>
                </section>
              </Form>
            );
          }}
        </Formik>
    </div>
  );
}

// Encabezado de sección: número en círculo naranja + título en azul de marca,
// con una línea divisoria para dar jerarquía visual a cada bloque del formulario.
function SectionHeading({ n, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-orange-100 pb-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
        {n}
      </span>
      <h2 className="text-indigo-900 text-lg font-bold">{title}</h2>
    </div>
  );
}

function InputField({ label, placeholder, type = 'text', name }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-orange-500 text-sm ml-1 font-medium">{label}</label>
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