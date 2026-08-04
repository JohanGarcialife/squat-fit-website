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
import SaveCardCheckbox from './SaveCardCheckbox';


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

export default function CheckoutForm({ setStep, onValidationChange, submitRef, saveCard, onSaveCardChange }) {
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
              customerType === 'particular' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Particular
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setCustomerType('empresa'); }}
            className={`px-8 py-2.5 rounded-full font-bold transition-all border-2 cursor-pointer ${
              customerType === 'empresa' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
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

            // País en vivo hacia el store: el resumen (OrderSummary) lo necesita
            // antes del submit para pintar los aranceles de envíos a EE. UU.
            useEffect(() => {
              if (values.country) updateFormData({ country: values.country });
            }, [values.country]);

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
                    <InputField label="Nombre de empresa / razón social" name="companyName" placeholder="Razón social de la empresa" />
                  )}
                  <InputField label="E-mail" name="email" placeholder="ana@correo.com" type="email" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Nombre" name="firstName" placeholder="Ana" />
                    <InputField label="Apellidos" name="lastName" placeholder="García López" />
                  </div>
                  <InputField
                    label={isCompany ? 'CIF*' : (dniRequired ? 'DNI/CIF* (obligatorio en pedidos de +400 €)' : 'DNI/CIF (opcional)')}
                    name="dni_cif"
                    placeholder={isCompany ? 'CIF de la empresa' : 'Número de identificación'}
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="phone" className={CLASES_ETIQUETA}>Teléfono</label>
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
                      inputClass="!w-full !border !border-slate-200 !rounded-xl !pl-16 !pr-4 !py-3 !placeholder-slate-400 !text-slate-800 !outline-none focus:!border-orange-500 focus:!ring-4 focus:!ring-orange-500/15 !transition-all"
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
                  <InputField label="Dirección" name="address" placeholder="Calle Mayor, 12" />
                  <InputField label="Piso / puerta (opcional)" name="apartment" placeholder="3º B" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Código postal" name="postalCode" placeholder="03003" />
                    <InputField label="Ciudad" name="city" placeholder="Alicante" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="country" className={CLASES_ETIQUETA}>País</label>
                    <div className="relative">
                      <Field as="select" id="country" name="country" className={`${CLASES_CAMPO} appearance-none cursor-pointer`}>
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
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${sameAddress ? 'bg-orange-500' : 'border border-slate-300'}`}>
                      {sameAddress && <Check size={16} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-orange-500">Usar la misma dirección para Envío</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="shippingNotes" className={CLASES_ETIQUETA}>Notas del envío (opcional)</label>
                    <Field as="textarea" id="shippingNotes" name="shippingNotes" rows={3} placeholder="Escribe aquí..." className={`${CLASES_CAMPO} resize-none`} />
                  </div>
                </section>

                {/* ── Sección 3: guardar tarjeta (save_card) — fuera de Formik
                    a propósito, no es un campo de envío y no debe bloquear el
                    envío del formulario. Independiente y NUNCA premarcada. */}
                {onSaveCardChange && (
                  <section className="space-y-4">
                    <SectionHeading n={3} title="Método de pago" />
                    <SaveCardCheckbox checked={saveCard} onChange={onSaveCardChange} />
                  </section>
                )}
              </Form>
            );
          }}
        </Formik>
    </div>
  );
}

/**
 * Clases del campo de texto, compartidas por los `InputField`, el `select` de
 * país, el teléfono y el textarea, para que no se separen con el tiempo.
 *
 * REPOSO GRIS, NARANJA SOLO AL ESCRIBIR. Antes el borde, la etiqueta y el
 * placeholder iban los tres en naranja: doce campos gritando lo mismo, ninguno
 * destacando, y —lo que de verdad importa— un campo con error se marcaba
 * también en un tono cálido y no se distinguía de los demás. Con el reposo en
 * gris, el naranja señala dónde estás y el rojo del error se ve al instante.
 */
export const CLASES_CAMPO =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 ' +
  'outline-none bg-white transition-all ' +
  'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15';

/** Etiqueta: gris y sin `font-medium`. La etiqueta acompaña, no compite. */
export const CLASES_ETIQUETA = 'text-slate-500 text-sm ml-1';

// Encabezado de sección: el número deja de ser un círculo naranja relleno. Es
// una referencia de posición, no una llamada a la acción, y con el relleno
// competía con el botón «Continuar», que sí lo es.
function SectionHeading({ n, title }) {
  return (
    <div className="flex items-center gap-3 pb-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-900">
        {n}
      </span>
      <h2 className="text-indigo-900 text-lg font-bold">{title}</h2>
    </div>
  );
}

function InputField({ label, placeholder, type = 'text', name }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className={CLASES_ETIQUETA}>{label}</label>
      <Field
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={CLASES_CAMPO}
      />
      <ErrorMessage name={name} component="div" className="text-red-500 text-sm ml-1" />
    </div>
  );
}