'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string().email('El formato del email no es válido').required('El email es obligatorio'),
    password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
      .required('Confirmar la contraseña es obligatorio'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const { confirmPassword, ...apiValues } = values;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register`, apiValues);
      if (response.data.message === 'Usuario registrado exitosamente') {
        toast.success('¡Registro exitoso!');
        router.push('/login');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const message = error.response.data.message;
        if (Array.isArray(message) && message[0].includes("Password must contain")) {
          toast.error("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial");
        } else if (message === "Email already in use") {
          toast.error("El correo electrónico ya está en uso");
        } else {
          toast.error("Ocurrió un error inesperado durante el registro.");
        }
      } else {
        console.error('Error en el registro', error.message);
        toast.error("Ocurrió un error inesperado.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen text-2xl text-white bg-linear-to-b from-primary to-secondary flex flex-col md:flex-row px-3 gap-10 md:px-32 py-32'>
      <div className='md:w-1/2'>
        <h2 className='md:text-8xl text-6xl font-bold text-center md:text-start'>Crea tu cuenta</h2>
        <p className='text-white text-3xl mt-12 max-w-[430px] text-center md:text-start'>Únete a la comunidad Squat Fit, crea tu cuenta y accede a todas sus funciones</p>
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
                  <Field type="text" name="username" placeholder='Nombre' className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold' />
                  <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <Field type="email" name="email" placeholder='E-mail' className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold' />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative flex items-center justify-between border border-gray-300 rounded-3xl">
                  <Field
                    type={isPasswordVisible ? 'text' : 'password'}
                    name="password"
                    placeholder='Contraseña'
                    className='w-full text-white  p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold'
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-5 text-white"
                  >
                    {isPasswordVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                  <ErrorMessage name="password" component="div" className="text-red-500 absolute -bottom-5 left-0 text-sm mt-1" />
                </div>
                <div className="relative border border-gray-300 rounded-3xl flex items-center justify-between">
                  <Field
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder='Confirmar Contraseña'
                    className='w-full text-white  p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold'
                  />
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-5 text-white"
                  >
                    {isConfirmPasswordVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 absolute -bottom-5 left-0 text-sm mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className='cursor-pointer bg-white text-primary rounded-3xl p-5 text-lg font-bold hover:bg-primary-dark transition duration-300 disabled:opacity-50'>
                  Registrarme
                </button>
              </Form>
            )}
          </Formik>
          <Link href='/login'>
            <p className='underline text-gris cursor-pointer text-2xl mt-5'>Iniciar Sesión</p>
          </Link>
        </div>
      </div>
    </div>
  );
}