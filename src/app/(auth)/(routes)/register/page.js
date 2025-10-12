'use client';
import Link from 'next/link';
import React from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const initialValues = {
    username: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string().email('El formato del email no es válido').required('El email es obligatorio'),
    password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register`, values);
      if (response.data.message === 'Usuario registrado exitosamente') {
        toast.success('¡Registro exitoso!');
        router.push('/login');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message && error.response.data.message[0] === "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character") {
        setErrors({ password: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial" });
      } else if (error.response && error.response.data && error.response.data.message === "Email already in use") {
        setErrors({ email: "El correo electrónico ya está en uso" });
      } else {
        console.error('Error en el registro', error.response ? error.response.data : error.message);
        // Aquí puedes manejar otros errores, por ejemplo, mostrar un mensaje genérico al usuario.
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen text-2xl text-white bg-linear-to-b from-primary to-secondary flex flex-col md:flex-row px-3 gap-10 md:px-32 py-40'>
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
                <div>
                  <Field type="password" name="password" placeholder='Contraseña' className='w-full text-white border border-gray-300 rounded-3xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-white placeholder-opacity-50 placeholder:font-bold' />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
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