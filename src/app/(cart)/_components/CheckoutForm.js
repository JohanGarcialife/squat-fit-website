'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
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
import Casilla from './Casilla';
import CabeceraPaso from './CabeceraPaso';
import GuardarDireccion from './GuardarDireccion';


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

// `sameAddress` entra en el esquema porque los campos de envío solo son
// obligatorios cuando está desmarcada. Con el esquema fijo, o se pedían
// siempre (y bloqueaban a quien envía a su propia dirección) o nunca (y se
// mandaba una dirección a medias que el backend rechaza, tumbando el pago).
const buildValidationSchema = (dniRequired, isCompany, sameAddress) => Yup.object({
  shippingAddress: sameAddress ? Yup.string() : Yup.string().required('La dirección de envío es obligatoria'),
  shippingApartment: Yup.string(),
  shippingPostalCode: sameAddress ? Yup.string() : Yup.string().required('El código postal de envío es obligatorio'),
  shippingCity: sameAddress ? Yup.string() : Yup.string().required('La ciudad de envío es obligatoria'),
  shippingCountry: sameAddress ? Yup.string() : Yup.string().required('El país de envío es obligatorio'),
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
    () => buildValidationSchema(dniRequired, isCompany, sameAddress),
    [dniRequired, isCompany, sameAddress],
  );

  const initialValues = useMemo(() => {
    // Prefill de cliente existente: si ya inició sesión en el paso 1, traemos
    // sus datos conocidos (email, nombre, apellidos, teléfono) para no repetir.
    const userEmail = (user?.email && user.email.includes('@'))
      ? user.email
      : ((user?.username && user.username.includes('@')) ? user.username : '');
    return {
      companyName: '',
      shippingAddress: '',
      shippingApartment: '',
      shippingPostalCode: '',
      shippingCity: '',
      shippingCountry: '',
      ...formData,
      email: formData.email || userEmail || '',
      firstName: formData.firstName || user?.firstName || '',
      lastName: formData.lastName || user?.lastName || '',
      phone: formData.phone || user?.phone_number || '',
    };
  }, [formData, user]);

  /**
   * Enter salta al campo siguiente en vez de enviar el formulario.
   *
   * `enterKeyHint="next"` SOLO cambia la etiqueta de la tecla: el móvil pinta
   * «siguiente» y al pulsarla se envía igual, porque eso es lo que hace Enter
   * en HTML. Prometía una cosa y hacía otra — el cliente pulsaba «siguiente» y
   * se le disparaba la validación entera con medio formulario vacío.
   *
   * Se buscan los campos por orden de aparición en el DOM y se enfoca el que
   * viene detrás. Se excluye el textarea (ahí Enter es un salto de línea de
   * verdad) y los deshabilitados u ocultos — si no, con la dirección de envío
   * plegada el foco saltaría a un campo que no está en pantalla.
   *
   * En el último campo no se hace nada: Enter envía, que es lo esperado.
   */
  const enterAlSiguiente = (e) => {
    if (e.key !== 'Enter') return;
    const el = e.target;
    if (!el || el.tagName === 'TEXTAREA') return;
    const campos = [...e.currentTarget.querySelectorAll('input, select')].filter(
      (c) => !c.disabled && !c.readOnly && c.type !== 'hidden' && c.offsetParent !== null,
    );
    const i = campos.indexOf(el);
    if (i === -1 || i === campos.length - 1) return;
    e.preventDefault();
    campos[i + 1].focus();
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-10">
        <CabeceraPaso
          paso="Paso 2 de 3"
          titulo="Mis datos"
          onAtras={() => setStep(1)}
          aria="Volver al carrito"
        />

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
            // `sameAddress` va con los datos: es lo que decide, en el paso 3,
            // si la dirección que se manda a Stripe es la de facturación o la
            // de envío. Sin esto el checkout no puede saberlo.
            updateFormData({ ...values, sameAddress });
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
              <Form className="space-y-8" onKeyDown={enterAlSiguiente}>
                {/* ── Sección 1: contacto — el email va primero para reconocer
                    a clientes que ya iniciaron sesión y traer sus datos. ── */}
                <section className="space-y-4">
                  <SectionHeading n={1} title="Tus datos" />
                  {isCompany && (
                    <InputField label="Nombre de empresa / razón social" name="companyName" placeholder="Razón social de la empresa" autoComplete="organization" />
                  )}
                  <InputField label="E-mail" name="email" placeholder="ana@correo.com" type="email" autoComplete="email" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Nombre" name="firstName" placeholder="Ana" autoComplete="given-name" />
                    <InputField label="Apellidos" name="lastName" placeholder="García López" autoComplete="family-name" />
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
                      /* El naranja suave de «esto ya está» lo pone
                         `not-placeholder-shown:border-orange-200` en el resto
                         de campos (ver CLASES_CAMPO). Aquí NO funcionaba: este
                         input lo pinta react-phone-input-2 y siempre lleva un
                         placeholder puesto por la librería, así que
                         `:placeholder-shown` nunca llega a ser falso y la regla
                         no dispara nunca. Era el único campo del formulario que
                         se quedaba gris al rellenarlo.
                         Se resuelve mirando el valor, que es lo que de verdad
                         queremos saber. `values.phone` arranca con el prefijo
                         del país ('34'), así que un teléfono escrito de verdad
                         tiene más de 4 dígitos: comparar contra vacío daría el
                         campo por relleno nada más abrir la página. */
                      inputClass={`!w-full !border !rounded-xl !pl-16 !pr-4 !py-3 !placeholder-slate-400 !text-slate-800 !outline-none focus:!border-orange-500 focus:!ring-4 focus:!ring-orange-500/15 !transition-all ${
                        (values.phone || '').replace(/\D/g, '').length > 4
                          ? '!border-orange-200'
                          : '!border-slate-200'
                      }`}
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

                {/* ── Sección 2: dirección de FACTURACIÓN ──
                    Se llamaba «Dirección de envío», que era mentira desde que
                    existe la casilla de abajo: estos campos son los que van en
                    la factura, y el destino del paquete puede ser otro. Un
                    cliente que factura en la oficina leía «envío» y escribía
                    ahí la de casa, con lo que la factura salía mal. */}
                <section className="space-y-4">
                  <SectionHeading n={2} title="Dirección de facturación" />
                  <InputField label="Dirección" name="address" placeholder="Calle Mayor, 12" autoComplete="address-line1" />
                  <InputField label="Piso / puerta (opcional)" name="apartment" placeholder="3º B" autoComplete="address-line2" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Código postal" name="postalCode" placeholder="03003" autoComplete="postal-code" />
                    <InputField label="Ciudad" name="city" placeholder="Alicante" autoComplete="address-level2" />
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
                  {/* Misma casilla que el resto del carrito (Casilla.js). Antes
                      esto era un círculo naranja dibujado a mano y la de guardar
                      la tarjeta era la nativa del sistema: dos formas y dos
                      colores en la misma pantalla de pago. */}
                  <Casilla
                    id="misma-direccion"
                    checked={sameAddress}
                    onChange={setSameAddress}
                    className="pt-1"
                  >
                    <span className="text-slate-600 text-sm">Usar la misma dirección para el envío</span>
                  </Casilla>

                  {/* Guardar la de FACTURACIÓN. Queda predeterminada de
                      facturación sin preguntar: es lo que dice el bloque en el
                      que está. */}
                  <GuardarDireccion tipo="facturacion" valores={values} />

                  {/* Dirección de envío distinta.
                      Hasta el 5-ago esta casilla NO HACÍA NADA: `sameAddress`
                      solo se pintaba a sí misma y no existía ningún campo de
                      envío. Quien la desmarcaba esperando escribir otra
                      dirección no veía nada aparecer, y su pedido salía a la de
                      facturación.
                      Peor: el presupuesto de envío se calcula con este código
                      postal, así que con destino real distinto se cobraba la
                      tarifa de una zona y se enviaba a otra. */}
                  {!sameAddress && (
                    <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                      {/* Título de verdad, no una pregunta suelta: el apartado
                          de arriba es «Dirección de facturación» y este es su
                          par. Con «¿A dónde lo enviamos?» no quedaba claro que
                          fueran dos direcciones distintas de la misma
                          jerarquía. */}
                      <h3 className="text-indigo-900 font-bold">Dirección de envío</h3>
                      <InputField label="Dirección" name="shippingAddress" placeholder="Calle Mayor, 12" autoComplete="shipping address-line1" />
                      <InputField label="Piso / puerta (opcional)" name="shippingApartment" placeholder="3º B" autoComplete="shipping address-line2" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Código postal" name="shippingPostalCode" placeholder="03003" autoComplete="shipping postal-code" />
                        <InputField label="Ciudad" name="shippingCity" placeholder="Alicante" autoComplete="shipping address-level2" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="shippingCountry" className={CLASES_ETIQUETA}>País</label>
                        <div className="relative">
                          <Field as="select" id="shippingCountry" name="shippingCountry" className={`${CLASES_CAMPO} appearance-none cursor-pointer`}>
                            <option value="">Selecciona un país</option>
                            {countryOptions.priority.map((c) => (
                              <option key={`s-${c.code}`} value={c.code}>{c.name}</option>
                            ))}
                            <option disabled>──────────</option>
                            {countryOptions.rest.map((c) => (
                              <option key={`sr-${c.code}`} value={c.code}>{c.name}</option>
                            ))}
                          </Field>
                          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                            <ChevronDown size={20} />
                          </div>
                        </div>
                        <ErrorMessage name="shippingCountry" component="div" className="text-red-700 text-[13px] ml-1" />
                      </div>

                      {/* Guardar la de ENVÍO, dentro de su propio recuadro y
                          predeterminada de envío. */}
                      <GuardarDireccion tipo="envio" valores={values} />
                    </div>
                  )}

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
  // Relleno pero sin el foco puesto: naranja pálido. Marca lo que ya está hecho
  // sin gritar, y de un vistazo se ve cuánto queda por rellenar. `:not(:placeholder-shown)`
  // es lo que distingue «tiene contenido» de «vacío» sin necesidad de estado en React.
  'not-placeholder-shown:border-orange-200 ' +
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

/**
 * Los botones «anterior / siguiente» del teclado del móvil NO se pintan desde
 * la web: los pone el sistema, y solo aparecen si puede deducir que los campos
 * forman una serie. Para eso hacen falta tres cosas, y aquí faltaban las tres:
 *
 *   · que todos los campos estén dentro del mismo `<form>` (lo están),
 *   · `autoComplete` reconocible en cada uno — es lo que le dice a iOS que
 *     esto es un formulario de dirección de verdad y no campos sueltos, y de
 *     paso activa el autorrelleno del cliente,
 *   · `enterKeyHint="next"` para que la tecla de intro diga «siguiente» en vez
 *     de «ir», y salte al campo de al lado en lugar de enviar.
 *
 * El último campo del formulario no lo lleva: ahí «intro» sí debe enviar.
 */
function InputField({ label, placeholder, type = 'text', name, autoComplete, ultimo = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className={CLASES_ETIQUETA}>{label}</label>
      <Field
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        enterKeyHint={ultimo ? 'done' : 'next'}
        className={CLASES_CAMPO}
      />
      {/* Rojo, pero el justo. `red-500` sobre blanco competía con el naranja de
          la marca; `red-700` a 13px pesa menos y se sigue leyendo sin esfuerzo.
          El tono NO se cambia a naranja ni a azul, aunque haya varios colores en
          la pantalla: el naranja significa ahora «aquí estás escribiendo» y el
          azul es el de marca. Si el error compartiera cualquiera de los dos,
          «enfocado» y «mal» se verían igual — que es justo lo que se acaba de
          arreglar. El rojo puede permitirse ser el único que grita porque es el
          único que aparece solo cuando algo va mal. */}
      <ErrorMessage name={name} component="div" className="text-red-700 text-[13px] ml-1" />
    </div>
  );
}