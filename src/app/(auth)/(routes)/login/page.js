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
  // Login en dos pasos: primero el email, luego se revela la contraseña.
  const [showPassword, setShowPassword] = useState(false);
  // Modal cuando el email no tiene cuenta (invitación a crear una).
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState('');

  const redirectParam = searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';

  const initialValues = {
    username: searchParams.get('email') || '',
    password: '',
  };

  // El esquema de la contraseña solo aplica una vez revelada (paso 2).
  const validationSchema = Yup.object({
    username: Yup.string().email('El formato del email no es válido').required('El email es obligatorio'),
    password: showPassword
      ? Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria')
      : Yup.string(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    // Paso 1: con solo el email, comprobamos si tiene cuenta ANTES de pedir la
    // contraseña. Si no existe, mostramos el modal para crear la cuenta; si
    // existe sin contraseña, le llevamos a crearla.
    if (!showPassword) {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/check-email`, {
          email: values.username,
        });
        const { exists, hasPassword } = res.data || {};
        if (!exists) {
          setCheckedEmail(values.username);
          setShowCreateModal(true);
        } else if (!hasPassword) {
          const qs = new URLSearchParams({ email: values.username });
          const redirect = searchParams.get('redirect');
          if (redirect) qs.set('redirect', redirect);
          toast('Tu cuenta aún no tiene contraseña. Te llevamos a crearla 👇', { duration: 4000 });
          router.push(`/forgot-password?${qs.toString()}`);
        } else {
          setShowPassword(true);
        }
      } catch (error) {
        // Si el chequeo falla, no bloqueamos: dejamos que intente con contraseña.
        setShowPassword(true);
      } finally {
        setSubmitting(false);
      }
      return;
    }
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
        // El backend rechaza aquí a administradores y staff (deben entrar por el
        // back office). Mostramos un mensaje claro en español, no el técnico.
        const isStaff = typeof message === 'string' && /admin-panel|administrator|staff/i.test(message);
        toast.error(
          isStaff
            ? 'Esta cuenta es de administrador o del equipo. Accede desde el panel de gestión, no desde la tienda.'
            : 'Esta cuenta no puede iniciar sesión aquí.',
          { duration: 5000 },
        );
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
            {({ isSubmitting, values }) => (
              <Form className='flex flex-col gap-4'>
                <div>
                  <div className="relative">
                    <Field type="email" name="username" placeholder='E-mail' disabled={showPassword} className='w-full bg-white text-gray-800 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#FF690B] placeholder-gray-400 disabled:bg-white/70' />
                    {showPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(false)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs text-primary font-semibold hover:underline"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                  <ErrorMessage name="username" component="div" className="text-white text-sm mt-1.5 font-medium" />
                </div>
                {showPassword && (
                  <div>
                    <div className="relative">
                      <Field
                        type={isPasswordVisible ? 'text' : 'password'}
                        name="password"
                        placeholder='Contraseña'
                        autoFocus
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
                )}
                <button type="submit" disabled={isSubmitting} className='cursor-pointer bg-white text-primary rounded-2xl py-3.5 text-base font-bold hover:bg-[#FFEDE0] transition duration-300 disabled:opacity-50 mt-1'>
                  {showPassword ? 'Iniciar Sesión' : 'Continuar'}
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

      {/* Modal: el email no tiene cuenta → invitar a crear una */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <span className="text-3xl">👋</span>
            </div>
            <h3 className="text-2xl font-bold text-secondary">No tenemos ese email</h3>
            <p className="mt-2 text-gray-600">
              No encontramos <span className="font-semibold text-secondary">{checkedEmail}</span> en nuestra base de datos.
              Crea tu cuenta en Squad Fit en 1 minuto.
            </p>
            <button
              onClick={() => {
                const qs = new URLSearchParams({ email: checkedEmail });
                const redirect = searchParams.get('redirect');
                if (redirect) qs.set('redirect', redirect);
                router.push(`/register?${qs.toString()}`);
              }}
              className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white transition-colors hover:bg-orange-600"
            >
              Crear mi cuenta
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="mt-3 w-full text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Usar otro email
            </button>
          </div>
        </div>
      )}
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