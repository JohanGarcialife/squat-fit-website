'use client';

import Link from 'next/link';
import React, { useState, Suspense } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { enviarFormSubmit } from '@/app/components/ga4Formularios';

// El backend marca así el 400 del antiflood de 15 min. Se mira primero ese
// código y solo si no viene se cae al texto, para que esto siga funcionando
// contra la versión de la API que todavía no lo manda.
const YA_TIENE_CODIGO = 'CODE_ALREADY_SENT';

function esCodigoYaEnviado(error) {
  const data = error.response?.data;
  if (data?.code === YA_TIENE_CODIGO) return true;
  return (
    error.response?.status === 400 &&
    typeof data?.message === 'string' &&
    data.message.startsWith('Acabamos de enviarte un código')
  );
}

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // El correo del código enlaza aquí con ?step=2&email=…, para que quien lo
  // recibe aterrice en el formulario donde meterlo en vez de en la pantalla
  // que lo vuelve a pedir.
  const emailInicial = (searchParams.get('email') || '').trim().toLowerCase();
  const empiezaEnCodigo = searchParams.get('step') === '2' && Boolean(emailInicial);
  const [step, setStep] = useState(empiezaEnCodigo ? 2 : 1); // 1: request code, 2: reset password
  const [userEmail, setUserEmail] = useState(empiezaEnCodigo ? emailInicial : '');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const redirectParam = searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';

  const requestSchema = Yup.object({
    email: Yup.string().email('El formato del email no es válido').required('El email es obligatorio'),
  });

  const resetSchema = Yup.object({
    code: Yup.string().required('El código es obligatorio'),
    password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
      .required('Confirmar la contraseña es obligatorio'),
  });

  const handleRequestCode = async (values, { setSubmitting }) => {
    try {
      // Email normalizado (minúsculas + sin espacios) igual que login/register:
      // el teclado de iOS suele capitalizar o dejar un espacio y rompía el flujo.
      const email = (values.email || '').trim().toLowerCase();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/request-reset-password`, {
        params: { email }
      });

      if (response.data === true) {
        enviarFormSubmit({ id: 'recuperar_pedir_codigo', nombre: 'Recuperar contraseña · pedir código' });
        toast.success('Código de recuperación enviado a tu correo');
        setUserEmail(email);
        setStep(2);
      } else {
        toast.error('No se pudo enviar el código. Verifica el correo.');
      }
    } catch (error) {
      console.error('Error solicitando código', error);
      // «Acabamos de enviarte un código» es información, no un fallo: el código
      // está en su correo. Antes se pintaba en rojo y la pantalla se quedaba en
      // el paso 1, o sea que quien ya lo tenía no podía llegar al formulario
      // para meterlo hasta pasados 15 minutos. Ahora se le lleva allí.
      if (esCodigoYaEnviado(error)) {
        const email = (values.email || '').trim().toLowerCase();
        toast(error.response?.data?.message || 'Ya te hemos enviado un código. Revisa tu correo.', { icon: '✉️' });
        setUserEmail(email);
        setStep(2);
        return;
      }
      const msg = error.response?.data?.message || 'Error al solicitar el código';
      toast.error(typeof msg === 'string' ? msg : 'Error al solicitar el código');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      const payload = {
        // Normalizado también aquí por si el email llegó sin pasar por el paso 1.
        email: (userEmail || '').trim().toLowerCase(),
        code: values.code,
        newPassword: values.password
      };
      
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/reset-password`, payload);
      
      if (response.data === true) {
        enviarFormSubmit({ id: 'recuperar_nueva_clave', nombre: 'Recuperar contraseña · fijar la nueva' });
        toast.success('¡Contraseña restablecida con éxito!');
        router.push(`/login${redirectParam}`);
      } else {
        toast.error('Código incorrecto o expirado.');
      }
    } catch (error) {
      console.error('Error restableciendo contraseña', error);
      const msg = error.response?.data?.message || 'Error al restablecer la contraseña';
      toast.error(typeof msg === 'string' ? msg : 'Error al restablecer la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen text-base md:text-2xl text-white bg-linear-to-b from-primary to-secondary flex flex-col md:flex-row px-5 gap-6 md:gap-10 md:px-32 py-16 md:py-32'>
      <div className='md:w-1/2'>
        <h2 className='text-4xl md:text-8xl font-bold text-center md:text-start'>Recupera tu cuenta</h2>
        <p className='text-white text-lg md:text-3xl mt-4 md:mt-12 max-w-[430px] mx-auto md:mx-0 text-center md:text-start'>
          {step === 1
            ? 'Ingresa tu correo para recibir un código de restablecimiento de contraseña.'
            : 'Introduce el código enviado a tu correo y tu nueva contraseña.'}
        </p>
        {/* Decir a qué dirección fue el código evita el caso más común de
            «me da error»: haberlo pedido para otro correo del que se tiene. */}
        {step === 2 && userEmail && (
          <p className='text-white/80 text-base md:text-2xl mt-2 md:mt-4 max-w-[430px] mx-auto md:mx-0 text-center md:text-start break-words'>
            Lo enviamos a <span className='font-bold'>{userEmail}</span>.
          </p>
        )}
      </div>
      <div className='md:w-1/2'>
        <div className='bg-white/30 rounded-[60px] md:rounded-[80px] py-16 px-10 md:py-32 md:px-20 text-black flex flex-col gap-5 relative'>
          
          {step === 2 && (
            <button 
              onClick={() => setStep(1)} 
              className="absolute top-6 left-6 text-white hover:text-gray-200 flex items-center gap-1 text-lg font-bold cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" /> Volver
            </button>
          )}

          {step === 1 ? (
            /* La `key` no es decorativa: sin ella React reutiliza el mismo
               <input> al cambiar de paso —los dos formularios tienen la misma
               forma— y el campo del código aparecía relleno con el correo que
               se acababa de escribir, mientras Formik lo consideraba vacío.
               Comprobado en el navegador el 6-ago. */
            <Formik
              key="paso-pedir-codigo"
              initialValues={{ email: emailInicial }}
              validationSchema={requestSchema}
              onSubmit={handleRequestCode}
            >
              {({ isSubmitting, values }) => (
                <Form className='flex flex-col gap-5 mt-5'>
                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder='E-mail'
                      className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold'
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className='cursor-pointer bg-white text-primary rounded-3xl p-5 text-lg font-bold hover:bg-primary-dark transition duration-300 disabled:opacity-50'
                  >
                    Enviar Código
                  </button>
                  {/* Sin esto, la única forma de llegar al formulario del código
                      era pedir uno nuevo — y quien acababa de pedirlo chocaba
                      con el antiflood. Quien cerró la pestaña para ir a su
                      correo se quedaba fuera. */}
                  <button
                    type="button"
                    onClick={() => {
                      const email = (values.email || '').trim().toLowerCase();
                      if (!email) {
                        toast('Escribe primero tu correo para continuar.', { icon: '✉️' });
                        return;
                      }
                      setUserEmail(email);
                      setStep(2);
                    }}
                    className='text-base md:text-xl text-gris underline cursor-pointer'
                  >
                    Ya tengo un código
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              key="paso-nueva-contrasena"
              initialValues={{ code: '', password: '', confirmPassword: '' }}
              validationSchema={resetSchema}
              onSubmit={handleResetPassword}
            >
              {({ isSubmitting }) => (
                <Form className='flex flex-col gap-5 mt-5'>
                  <div>
                    <Field 
                      type="text" 
                      name="code" 
                      placeholder='Código de recuperación' 
                      className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold' 
                    />
                    <ErrorMessage name="code" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="relative border border-gray-300 rounded-3xl flex items-center justify-between">
                    <Field
                      type={isPasswordVisible ? 'text' : 'password'}
                      name="password"
                      placeholder='Nueva Contraseña'
                      className='w-full text-white p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold'
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="pr-5 text-white cursor-pointer"
                    >
                      {isPasswordVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                    <ErrorMessage name="password" component="div" className="text-red-500 absolute -bottom-5 left-0 text-sm mt-1" />
                  </div>

                  <div>
                    <Field
                      type="password"
                      name="confirmPassword"
                      placeholder='Confirmar Contraseña'
                      className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold'
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className='cursor-pointer bg-white text-primary rounded-3xl p-5 text-lg font-bold hover:bg-primary-dark transition duration-300 disabled:opacity-50'
                  >
                    Restablecer Contraseña
                  </button>
                </Form>
              )}
            </Formik>
          )}

          <div className="flex justify-between items-center mt-5 text-base md:text-2xl font-bold">
            <Link href={`/login${redirectParam}`}>
              <p className='underline text-gris cursor-pointer'>Iniciar Sesión</p>
            </Link>
            <Link href={`/register${redirectParam}`}>
              <p className='underline text-gris cursor-pointer'>Crear Cuenta</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-2xl text-white bg-linear-to-b from-primary to-secondary flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
