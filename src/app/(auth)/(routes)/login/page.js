'use client';
import Link from 'next/link';
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../stores/auth.store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();

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
        router.push('/');
      }
    } catch (error) {
      console.error('Error en el login', error.response ? error.response.data : error.message);
      if (error.response && error.response.data.message === 'Invalid email or password') {
        toast.error('Email o contraseña inválidos.');
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
                <div>
                  <Field type="password" name="password" placeholder='Contraseña' className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold' />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className='cursor-pointer bg-white text-primary rounded-3xl p-5 text-lg font-bold hover:bg-primary-dark transition duration-300 disabled:opacity-50'>
                  Iniciar Sesión
                </button>
              </Form>
            )}
          </Formik>
          <Link href='/register'>
            <p className='underline text-gris cursor-pointer text-2xl mt-5'>Crear Cuenta</p>
          </Link>
        </div>
      </div>
    </div>
  );
}