'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function activateAccount() {
      if (!token) {
        setStatus('error');
        setMessage('El token de activación no se encuentra en la dirección URL.');
        return;
      }

      try {
        console.log("Iniciando activación de cuenta con token:", token);
        const response = await axios.get(`${API_BASE}/api/v1/user/activate`, {
          params: { token },
        });

        console.log("Respuesta de activación:", response.data);
        setStatus('success');
        setMessage('¡Cuenta verificada y activada con éxito!');
      } catch (error) {
        console.error("Error al activar cuenta:", error.response ? error.response.data : error.message);
        setStatus('error');
        if (error.response && error.response.data && error.response.data.message) {
          const apiMessage = error.response.data.message;
          setMessage(typeof apiMessage === 'string' ? apiMessage : 'El enlace de activación es inválido o ha expirado.');
        } else {
          setMessage('El token de activación es inválido, ha expirado o ya fue utilizado.');
        }
      }
    }

    activateAccount();
  }, [token]);

  // Manejar cuenta regresiva para redirección automática tras éxito
  useEffect(() => {
    if (status !== 'success') return;

    if (countdown === 0) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  return (
    <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 md:p-16 text-black flex flex-col items-center text-center gap-8 border border-white/20 animate-in fade-in zoom-in-95 duration-500">
      
      {/* ─── ESTADO: CARGANDO ────────────────────────────────────────────────── */}
      {status === 'loading' && (
        <>
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-20 h-20 text-[#3932C0] animate-spin" strokeWidth={1.5} />
            <div className="absolute w-12 h-12 bg-[#3932C0]/10 rounded-full animate-ping"></div>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-[#3932C0]">Verificando tu cuenta</h2>
            <p className="text-gray-500 text-lg">
              Por favor, espera un momento mientras validamos tu enlace de activación...
            </p>
          </div>
        </>
      )}

      {/* ─── ESTADO: ÉXITO ───────────────────────────────────────────────────── */}
      {status === 'success' && (
        <>
          <div className="relative flex items-center justify-center">
            <CheckCircle className="w-24 h-24 text-green-500 animate-in scale-in duration-500" strokeWidth={1.5} />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-[#FF690B] animate-bounce" />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl font-bold text-green-600">¡Cuenta Activada!</h2>
            <p className="text-gray-600 text-lg font-medium">{message}</p>
            <p className="text-gray-400 text-sm mt-2">
              Ya tienes acceso completo a la plataforma Squad Fit.
            </p>
          </div>
          <div className="w-full mt-4 flex flex-col items-center gap-4">
            {/* Cuenta atrás protagonista: 3, 2, 1… */}
            <div className="flex flex-col items-center gap-1 bg-[#F8F9FC] w-full py-4 px-6 rounded-2xl border border-slate-100">
              <span key={countdown} className="text-5xl font-extrabold text-[#FF690B] tabular-nums animate-in zoom-in-50 duration-300">
                {countdown > 0 ? countdown : '¡Vamos!'}
              </span>
              <span className="text-sm text-gray-500 font-semibold">Te llevamos al inicio de sesión…</span>
            </div>
            <Link href="/login" className="w-full cursor-pointer bg-[#3932C0] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#3932C0]/90 transition duration-300">
              Ir a iniciar sesión ahora
            </Link>
          </div>
        </>
      )}

      {/* ─── ESTADO: ERROR ───────────────────────────────────────────────────── */}
      {status === 'error' && (
        <>
          <div className="flex items-center justify-center">
            <XCircle className="w-24 h-24 text-red-500 animate-in shake duration-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-red-600">Activación Fallida</h2>
            <p className="text-gray-600 text-lg font-medium">{message}</p>
            <p className="text-gray-400 text-sm">
              El enlace puede ser inválido o haber expirado (tienen 24 horas de validez).
            </p>
          </div>
          <div className="w-full mt-4 flex flex-col gap-3">
            <Link href="/register" className="w-full cursor-pointer bg-[#3932C0] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#3932C0]/90 transition duration-300 block">
              Registrar cuenta nueva
            </Link>
            <Link href="/login" className="w-full cursor-pointer bg-gray-100 text-gray-700 rounded-3xl p-5 text-lg font-semibold hover:bg-gray-200 transition duration-300 block">
              Volver al inicio de sesión
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen text-xl text-white bg-linear-to-b from-[#3932C0] to-[#FF690B] flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-16 text-black flex flex-col items-center text-center gap-8 border border-white/20">
          <Loader2 className="w-20 h-20 text-[#3932C0] animate-spin" strokeWidth={1.5} />
          <h2 className="text-3xl font-bold text-[#3932C0]">Cargando...</h2>
        </div>
      }>
        <ActivateContent />
      </Suspense>
    </div>
  );
}
