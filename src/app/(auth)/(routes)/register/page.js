'use client';
import Link from 'next/link';
import React, { useState, Suspense } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check } from 'lucide-react';
import GdprCheckbox from '@/app/components/GdprCheckbox';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  const redirectParam = searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Email precargado si venimos del login (email no registrado).
  const initialValues = {
    username: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  };

  // Requisitos de la contraseña (mismos que muestra la lista en vivo)
  const PASSWORD_RULES = [
    { label: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
    { label: '1 letra mayúscula', test: (v) => /[A-Z]/.test(v) },
    { label: '1 letra minúscula', test: (v) => /[a-z]/.test(v) },
    { label: '1 número', test: (v) => /[0-9]/.test(v) },
    { label: '1 carácter especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

  const validationSchema = Yup.object({
    username: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string().email('El formato del email no es válido').required('El email es obligatorio'),
    password: Yup.string()
      .required('La contraseña es obligatoria')
      .test('reglas', 'La contraseña no cumple los requisitos', (v = '') => PASSWORD_RULES.every((r) => r.test(v))),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
      .required('Confirmar la contraseña es obligatorio'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { username, password } = values;
      // Email normalizado (minúsculas + sin espacios) para que el login por
      // email siempre coincida, escriba como escriba el teclado del móvil.
      const email = (values.email || '').trim().toLowerCase();

      // Split "Nombre" into firstName and lastName
      const nameParts = username.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Usuario';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'SquadFit';

      // Generate a valid username from email (alphanumeric only)
      const generatedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

      const payload = {
        email,
        username: generatedUsername,
        password,
        firstName,
        lastName
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register`, payload);
      
      if (response.status === 201 || response.status === 200 || response.data) {
        toast.success("Registro exitoso. Por favor revisa tu correo electrónico para activar tu cuenta.");
        router.push(`/login${redirectParam}`);
      }
    } catch (error) {
      console.error('Error en el registro', error.response ? error.response.data : error.message);
      
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        
        if (Array.isArray(message)) {
          // Display the first validation error from the API
          const cleanMessage = message[0].replace('property ', '');
          toast.error(cleanMessage);
        } else if (message === "Email already in use") {
          toast.error("El correo electrónico ya está en uso");
        } else {
          toast.error(typeof message === 'string' ? message : "Error en el registro");
        }
      } else {
        toast.error("Ocurrió un error inesperado.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen text-white bg-linear-to-b from-primary to-secondary flex flex-col items-center justify-center px-5 py-14'>
      <div className='w-full max-w-md mx-auto'>
        <div className='text-center mb-8'>
          <h2 className='text-5xl md:text-6xl font-bold leading-tight'>Crea tu cuenta</h2>
          <p className='text-white/85 text-base md:text-lg mt-3'>Únete a la comunidad Squad Fit y accede a todo el contenido</p>
        </div>
        <div className='bg-white/15 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-5'>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className='flex flex-col gap-4'>
                <div>
                  <Field type="text" name="username" placeholder='Nombre' className='w-full bg-white text-gray-800 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#FF690B] placeholder-gray-400' />
                  <ErrorMessage name="username" component="div" className="text-white text-sm mt-1.5 font-medium" />
                </div>
                <div>
                  <Field type="email" name="email" placeholder='E-mail' inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} className='w-full bg-white text-gray-800 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#FF690B] placeholder-gray-400' />
                  <ErrorMessage name="email" component="div" className="text-white text-sm mt-1.5 font-medium" />
                </div>
                <div>
                  <div className="relative">
                    <Field
                      type={isPasswordVisible ? 'text' : 'password'}
                      name="password"
                      placeholder='Contraseña'
                      className='w-full bg-white text-gray-800 rounded-2xl px-5 py-3.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#FF690B] placeholder-gray-400'
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {/* Lista de requisitos en vivo: aparece al empezar a escribir */}
                  {values.password.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const ok = rule.test(values.password);
                        return (
                          <li key={rule.label} className={`flex items-center gap-2 text-sm transition-colors duration-200 ${ok ? 'text-green-200' : 'text-white/70'}`}>
                            <span className="w-4 text-center font-bold">{ok ? '✓' : '✕'}</span>
                            <span>{rule.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div>
                  {(() => {
                    const passwordsMatch =
                      values.confirmPassword.length > 0 && values.confirmPassword === values.password;
                    return (
                      <>
                        <div className="relative">
                          <Field
                            type={isConfirmPasswordVisible ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder='Confirmar contraseña'
                            className={`w-full bg-white text-gray-800 rounded-2xl px-5 py-3.5 pr-20 text-base focus:outline-none focus:ring-2 placeholder-gray-400 transition-shadow ${
                              passwordsMatch ? 'ring-2 ring-green-500' : 'focus:ring-[#FF690B]'
                            }`}
                          />
                          {passwordsMatch && (
                            <span className="absolute inset-y-0 right-11 flex items-center text-green-500" aria-label="Las contraseñas coinciden">
                              <Check className="h-5 w-5" strokeWidth={3} />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                            aria-label={isConfirmPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {isConfirmPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {passwordsMatch ? (
                          <div className="text-green-200 text-sm mt-1.5 font-medium flex items-center gap-1">
                            <span className="font-bold">✓</span> Las contraseñas coinciden
                          </div>
                        ) : (
                          <ErrorMessage name="confirmPassword" component="div" className="text-white text-sm mt-1.5 font-medium" />
                        )}
                      </>
                    );
                  })()}
                </div>
                <GdprCheckbox checked={gdprAccepted} onChange={setGdprAccepted} id="gdpr-register" light />
                <button type="submit" disabled={isSubmitting || !gdprAccepted} className='cursor-pointer bg-white text-primary rounded-2xl py-3.5 text-base font-bold hover:bg-[#FFEDE0] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-1'>
                  Registrarme
                </button>
              </Form>
            )}
          </Formik>
          <Link href={`/login${redirectParam}`} className='text-center'>
            <span className='text-white/85 underline hover:text-white cursor-pointer text-sm'>¿Ya tienes cuenta? Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-2xl text-white bg-linear-to-b from-primary to-secondary flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}