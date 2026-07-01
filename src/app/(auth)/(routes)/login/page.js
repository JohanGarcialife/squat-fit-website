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
      console.error('Error en el login', error.response ? error.response.data : error.message);
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        if (message === 'User is not active') {
          toast.error('Tu cuenta aún no está activa. Por favor, contacta con soporte.');
        } else if (message === 'Invalid email or password' || error.response.status === 401) {
          toast.error('Email o contraseña inválidos.');
        } else {
          toast.error(typeof message === 'string' ? message : 'Error al iniciar sesión');
        }
      } else {
        toast.error('Ocurrió un error inesperado.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen text-2xl text-white bg-linear-to-b from-primary to-secondary flex flex-col md:flex-row px-3 gap-10 md:px-32 py-32'>
      <div className='md:w-1/2'>
        <h2 className='md:text-8xl text-6xl font-bold text-center md:text-start'>Inicia Sesión</h2>
        <p className='text-white text-3xl mt-12 max-w-[430px] text-center md:text-start'>Accede a tu cuenta y continúa tu entrenamiento con Squat Fit</p>
      </div>
      <div className='md:w-1/2'>
        <div className='bg-white/30 rounded-[60px] md:rounded-[80px] py-16 px-10 md:py-32 md:px-20  text-black flex flex-col gap-5'>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className='flex flex-col gap-5 mt-5'>
                <div>
                  <Field type="email" name="username" placeholder='E-mail' className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold' />
                  <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative border border-gray-300 rounded-3xl flex items-center justify-between">
                  <Field
                    type={isPasswordVisible ? 'text' : 'password'}
                    name="password"
                    placeholder='Contraseña'
                    className='w-full text-white  p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold'
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className=" right-0  top-1/2 pr-5 text-white"
                  >
                    {isPasswordVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                  <ErrorMessage name="password" component="div" className="text-red-500 absolute -bottom-5 left-0 text-sm mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className='cursor-pointer bg-white text-primary rounded-3xl p-5 text-lg font-bold hover:bg-primary-dark transition duration-300 disabled:opacity-50'>
                  Iniciar Sesión
                </button>
              </Form>
            )}
          </Formik>
          <div className="flex justify-between items-center mt-5 text-2xl font-bold">
            <Link href={`/register${redirectParam}`}>
              <p className='underline text-gris cursor-pointer'>Crear Cuenta</p>
            </Link>
            <Link href={`/forgot-password${redirectParam}`}>
              <p className='underline text-gris cursor-pointer'>¿Olvidaste tu contraseña?</p>
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