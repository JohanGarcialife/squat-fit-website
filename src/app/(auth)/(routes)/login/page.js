'use client';
import Link from 'next/link';
import React, { useState, Suspense } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../../stores/auth.store';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuthStore();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const redirectParam = searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';

  const initialValues = {
    username: '',
    password: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().email('El formato del email no es válido').required('El email es obligatorio'),
    password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`, values);
      const { token } = response.data;
      if (token) {
        setToken(token);
        toast.success('Inicio de sesión exitoso!');
        const redirect = searchParams.get('redirect') || '/panel-control';
        router.push(redirect);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      // Login inteligente: el backend distingue por código HTTP.
      //   404 → el email no está registrado  → a crear cuenta
      //   401 → la contraseña es incorrecta   → a recuperar contraseña
      // En ambos casos arrastramos el email (y el redirect) para no reescribirlo.
      const qs = new URLSearchParams();
      qs.set('email', values.username);
      const redirect = searchParams.get('redirect');
      if (redirect) qs.set('redirect', redirect);

      if (status === 404) {
        toast('No encontramos una cuenta con ese email. Vamos a crearla 👇', { duration: 4000 });
        router.push(`/register?${qs.toString()}`);
      } else if (message === 'User is not active') {
        toast.error('Tu cuenta aún no está activa. Revisa tu correo para activarla.');
      } else if (status === 403) {
        toast.error(typeof message === 'string' ? message : 'Esta cuenta no puede iniciar sesión aquí.');
      } else if (status === 401) {
        toast.error('La contraseña no es correcta. Te llevamos a recuperarla 👇', { duration: 4000 });
        router.push(`/forgot-password?${qs.toString()}`);
      } else {
        console.error('Error en el login', error.response ? error.response.data : error.message);
        toast.error(typeof message === 'string' ? message : 'Ocurrió un error inesperado.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen text-white bg-linear-to-b from-primary to-secondary flex flex-col items-center justify-center px-5 py-14'>
      <div className='w-full max-w-md mx-auto'>
        <div className='text-center mb-8'>
          <h2 className='text-5xl md:text-6xl font-bold leading-tight'>Inicia Sesión</h2>
          <p className='text-white/85 text-base md:text-lg mt-3'>Accede a tu cuenta con Squad Fit</p>
        </div>
        <div className='bg-white/15 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-5'>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className='flex flex-col gap-4'>
                <div>
                  <Field type="email" name="username" placeholder='E-mail' className='w-full bg-white text-gray-800 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#FF690B] placeholder-gray-400' />
                  <ErrorMessage name="username" component="div" className="text-white text-sm mt-1.5 font-medium" />
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
                  <ErrorMessage name="password" component="div" className="text-white text-sm mt-1.5 font-medium" />
                </div>
                <button type="submit" disabled={isSubmitting} className='cursor-pointer bg-white text-primary rounded-2xl py-3.5 text-base font-bold hover:bg-[#FFEDE0] transition duration-300 disabled:opacity-50 mt-1'>
                  Iniciar Sesión
                </button>
              </Form>
            )}
          </Formik>
          <div className="flex justify-between items-center gap-3 text-sm">
            <Link href={`/register${redirectParam}`}>
              <span className='text-white/85 underline hover:text-white cursor-pointer'>Crear cuenta</span>
            </Link>
            <Link href={`/forgot-password${redirectParam}`}>
              <span className='text-white/85 underline hover:text-white cursor-pointer'>¿Olvidaste tu contraseña?</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-2xl text-white bg-linear-to-b from-primary to-secondary flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}