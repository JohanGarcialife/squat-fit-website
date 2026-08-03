'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, Sparkles, MailCheck } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// La API responde en inglés. Esta pantalla la ve un cliente que acaba de pagar,
// así que no se le enseña el mensaje crudo del servidor.
function mensajeEnCastellano(bruto) {
  const t = typeof bruto === 'string' ? bruto.toLowerCase() : '';
  if (t.includes('already') && t.includes('activ')) return 'Esta cuenta ya estaba activada. Puedes entrar directamente.';
  if (t.includes('not found')) return 'No encontramos ninguna cuenta para este enlace.';
  if (t.includes('expired') || t.includes('invalid')) return 'Este enlace ya no sirve: o ha caducado o ya se usó una vez.';
  return 'Este enlace de activación no ha funcionado.';
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  // Cuenta activada pero SIN contraseña (compra como invitado). El backend lo
  // dice en `needsPassword` y deja el token vivo justo para esto, así que se le
  // pide aquí mismo en vez de mandarle a por un segundo correo.
  const [pideContrasena, setPideContrasena] = useState(false);
  const [clave, setClave] = useState('');
  const [claveRepetida, setClaveRepetida] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorClave, setErrorClave] = useState('');
  const [claveLista, setClaveLista] = useState(false);
  // Reenvío del enlace desde la propia pantalla de error: si el enlace caducó,
  // la cuenta sigue SIN activar, y sin activar el login rechaza por `status`
  // antes incluso de mirar la contraseña. Mandar a «recuperar contraseña» no
  // les desbloquearía; lo único que sirve es un enlace de activación nuevo.
  const [emailReenvio, setEmailReenvio] = useState('');
  const [reenvio, setReenvio] = useState('idle'); // 'idle' | 'enviando' | 'enviado' | 'error'
  const [errorReenvio, setErrorReenvio] = useState('');

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

        setStatus('success');
        setPideContrasena(response?.data?.needsPassword === true);
        setMessage(
          response?.data?.needsPassword === true
            ? 'Ya solo te falta elegir una contraseña.'
            : '¡Cuenta verificada y activada con éxito!',
        );
      } catch (error) {
        console.error("Error al activar cuenta:", error.response ? error.response.data : error.message);
        setStatus('error');
        setMessage(mensajeEnCastellano(error?.response?.data?.message));
      }
    }

    activateAccount();
  }, [token]);

  const guardarContrasena = async (e) => {
    e.preventDefault();
    setErrorClave('');
    if (clave.length < 8) {
      setErrorClave('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (clave !== claveRepetida) {
      setErrorClave('Las dos contraseñas no coinciden.');
      return;
    }
    setGuardando(true);
    try {
      await axios.post(`${API_BASE}/api/v1/user/activate`, { token, password: clave });
      setClaveLista(true);
    } catch (error) {
      // El token se consume al fijar la contraseña, así que un 400 aquí suele
      // ser un segundo envío del mismo formulario. Se le manda a entrar en vez
      // de dejarle mirando un error.
      if (error?.response?.status === 400) {
        setErrorClave(
          'Este enlace ya se ha usado. Si acabas de crear la contraseña, entra con ella.',
        );
      } else {
        setErrorClave('No hemos podido guardarla. Inténtalo en un momento.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const reenviarEnlace = async (e) => {
    e.preventDefault();
    const email = (emailReenvio || '').trim().toLowerCase();
    if (!email) return;
    setReenvio('enviando');
    setErrorReenvio('');
    try {
      await axios.post(`${API_BASE}/api/v1/user/resend-activation`, { email });
      setReenvio('enviado');
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400) {
        // La cuenta ya estaba activa: no es un fallo, es una buena noticia.
        setReenvio('error');
        setErrorReenvio('Esta cuenta ya está activada. Entra con tu contraseña, o créala si aún no tienes.');
      } else if (status === 404) {
        setReenvio('error');
        setErrorReenvio('No hay ninguna cuenta con ese correo. Revisa si lo escribiste igual que al comprar.');
      } else {
        setReenvio('error');
        setErrorReenvio('No hemos podido enviarlo. Inténtalo en un momento.');
      }
    }
  };

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
            <h2 className="text-4xl font-bold text-green-600">
              {claveLista ? '¡Todo listo!' : '¡Cuenta activada!'}
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              {claveLista ? 'Ya puedes entrar con tu contraseña.' : message}
            </p>
          </div>

          {/*
            Antes esto hacía una cuenta atrás de 3 segundos y empujaba a /login.
            Para quien compró como invitado eso era un callejón sin salida: el
            correo que le trae aquí se titula «Crea tu contraseña», pero su
            cuenta se creó SIN ninguna, así que llegaba a un formulario de
            acceso que no podía rellenar.

            Corregido del todo el 3-ago: además de no empujarle, ahora la crea
            AQUÍ. Mandarle a /forgot-password funcionaba, pero le costaba un
            segundo correo —y encima ese flujo le devuelve una contraseña
            generada, no la suya—. Medido en producción: los tres compradores
            que abrieron su enlace lo hicieron en menos de 4 minutos y ninguno
            llegó a tener contraseña. El paso de más era el que los perdía.
          */}
          {claveLista ? (
            <Link href="/login" className="w-full cursor-pointer bg-[#3932C0] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#3932C0]/90 transition duration-300 block">
              Entrar en mi cuenta
            </Link>
          ) : pideContrasena ? (
            <form onSubmit={guardarContrasena} className="w-full flex flex-col gap-3 text-left">
              <label htmlFor="clave" className="text-sm font-semibold text-gray-600">
                Elige tu contraseña
              </label>
              <input
                id="clave"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Al menos 8 caracteres"
                className="w-full rounded-2xl border border-gray-200 p-4 text-base text-gray-800 outline-hidden focus:border-[#3932C0]"
              />
              <label htmlFor="clave2" className="text-sm font-semibold text-gray-600">
                Repítela
              </label>
              <input
                id="clave2"
                type="password"
                required
                autoComplete="new-password"
                value={claveRepetida}
                onChange={(e) => setClaveRepetida(e.target.value)}
                placeholder="La misma otra vez"
                className="w-full rounded-2xl border border-gray-200 p-4 text-base text-gray-800 outline-hidden focus:border-[#3932C0]"
              />
              {errorClave && <p className="text-sm text-red-600">{errorClave}</p>}
              <button
                type="submit"
                disabled={guardando}
                className="w-full cursor-pointer bg-[#FF690B] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#FF690B]/90 transition duration-300 disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Crear contraseña y entrar'}
              </button>
            </form>
          ) : (
          <div className="w-full mt-2 flex flex-col gap-3">
            <Link href="/login" className="w-full cursor-pointer bg-[#3932C0] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#3932C0]/90 transition duration-300 block">
              Ya tengo contraseña · Entrar
            </Link>
            <Link href="/forgot-password" className="w-full cursor-pointer bg-[#FF690B] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#FF690B]/90 transition duration-300 block">
              Aún no tengo contraseña · Crearla
            </Link>
            <p className="text-gray-400 text-sm mt-1">
              Si compraste sin registrarte antes, tu cuenta se creó sin contraseña:
              elige la segunda opción y la creas en un minuto.
            </p>
          </div>
          )}
        </>
      )}

      {/* ─── ESTADO: ERROR ───────────────────────────────────────────────────── */}
      {status === 'error' && (
        <>
          <div className="flex items-center justify-center">
            <XCircle className="w-24 h-24 text-red-500 animate-in shake duration-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-red-600">Este enlace ya no vale</h2>
            <p className="text-gray-600 text-lg font-medium">{message}</p>
            <p className="text-gray-400 text-sm">
              Los enlaces de activación duran 24 horas y solo se pueden usar una vez.
              No pasa nada: te mandamos otro ahora mismo.
            </p>
          </div>

          {/*
            Antes aquí había dos botones que no llevaban a ninguna parte:
            «Registrar cuenta nueva» fallaba con *Email already in use* (la
            cuenta YA existe, solo que sin activar) y «Volver al inicio de
            sesión» tampoco servía, porque el login rechaza por `status` antes
            de mirar la contraseña. Lo único que desatasca es un enlace nuevo,
            y `POST /user/resend-activation` ya existía sin usarse.
          */}
          {reenvio === 'enviado' ? (
            <div className="w-full flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-3xl p-6">
              <MailCheck className="w-12 h-12 text-green-600" strokeWidth={1.5} />
              <p className="text-green-800 font-semibold text-lg">Enlace enviado</p>
              <p className="text-green-700 text-sm">
                Búscalo en tu correo (mira también en spam) y ábrelo antes de 24 horas.
              </p>
            </div>
          ) : (
            <form onSubmit={reenviarEnlace} className="w-full flex flex-col gap-3">
              <label htmlFor="email-reenvio" className="text-left text-sm font-semibold text-gray-600">
                Tu correo, el mismo con el que compraste
              </label>
              <input
                id="email-reenvio"
                type="email"
                required
                value={emailReenvio}
                onChange={(e) => setEmailReenvio(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-2xl border border-gray-200 p-4 text-base text-gray-800 outline-hidden focus:border-[#3932C0]"
              />
              {errorReenvio && <p className="text-left text-sm text-red-600">{errorReenvio}</p>}
              <button
                type="submit"
                disabled={reenvio === 'enviando'}
                className="w-full cursor-pointer bg-[#3932C0] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#3932C0]/90 transition duration-300 disabled:opacity-60"
              >
                {reenvio === 'enviando' ? 'Enviando…' : 'Enviarme un enlace nuevo'}
              </button>
            </form>
          )}

          <div className="w-full flex flex-col gap-3">
            <Link href="/forgot-password" className="w-full cursor-pointer bg-gray-100 text-gray-700 rounded-3xl p-4 text-base font-semibold hover:bg-gray-200 transition duration-300 block">
              Mi cuenta ya estaba activada · Crear o recuperar contraseña
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
