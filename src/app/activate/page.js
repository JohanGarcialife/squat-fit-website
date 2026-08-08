'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, Sparkles, MailCheck, Eye, EyeOff, Check } from 'lucide-react';
import { enviarFormSubmit } from '@/app/components/ga4Formularios';
import { PasswordChecklist, cumpleReglas } from '@/app/components/passwordRules';
import { useAuthStore } from '@/stores/auth.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.squadfit.es';

// La API responde en inglés. Esta pantalla la ve un cliente que acaba de pagar,
// así que no se le enseña el mensaje crudo del servidor.
function mensajeEnCastellano(bruto) {
  const t = typeof bruto === 'string' ? bruto.toLowerCase() : '';
  if (t.includes('already') && t.includes('activ')) return 'Esta cuenta ya estaba activada. Puedes entrar directamente.';
  if (t.includes('not found')) return 'No encontramos ninguna cuenta para este enlace.';
  // Dos casos distintos que el servidor sí separa y aquí iban en el mismo
  // saco. Contarle a alguien que su enlace «ha caducado» cuando lo que pasa es
  // que ese enlace no existe le manda a buscar una explicación equivocada:
  // mira la fecha del correo, ve que es de hoy, y no entiende nada.
  //
  //   · «Invalid or expired activation token» → el enlace no está: o se copió
  //     a medias, o se anuló al pedir otro, o su cuenta ya no existe.
  //   · «Token has expired»                   → existe y se le pasó el plazo.
  //
  // El orden importa: el primer mensaje lleva las DOS palabras, así que
  // `invalid` tiene que mirarse antes.
  if (t.includes('invalid'))
    return 'Este enlace no es válido. Comprueba que lo has copiado entero, o pide uno nuevo.';
  if (t.includes('expired')) return 'Ha caducado. Los enlaces de activación duran 4 días.';
  return 'Este enlace de activación no ha funcionado.';
}

/**
 * ¿A qué parte del panel se le manda tras crear la contraseña?
 *
 * A la de lo que ha comprado. El orden es el de «lo más caro y lo más
 * acompañado primero»: quien tiene programa viene por el programa, y quien
 * tiene curso viene por el curso. Si no se puede averiguar, al inicio del
 * panel, que ya le enseña lo suyo — nunca a la portada pública, que es de donde
 * viene y donde no hay nada que le pertenezca.
 */
async function averiguarDestino(token) {
  const cabeceras = { Authorization: `Bearer ${token}` };

  try {
    const { data } = await axios.get(`${API_BASE}/api/v1/advice/by-user`, { headers: cabeceras });
    if (data && (data.status === 'active' || data.suscription_name || data.title)) return '/mi-programa';
  } catch {
    /* sin programa */
  }

  try {
    const { data } = await axios.get(`${API_BASE}/api/v1/course/by-user`, { headers: cabeceras });
    const cursos = Array.isArray(data) ? data : data?.courses;
    if (Array.isArray(cursos) && cursos.length > 0) return '/panel-cursos';
  } catch {
    /* sin cursos */
  }

  try {
    const { isSubscribed } = JSON.parse(atob(token.split('.')[1] || '')) || {};
    if (isSubscribed) return '/panel-cocina';
  } catch {
    /* token ilegible */
  }

  return '/panel-control';
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
  const [verClave, setVerClave] = useState(false);
  // Adónde le lleva el botón final. Si se ha podido entrar sola, a lo que ha
  // comprado; si no, al login de siempre.
  const [destino, setDestino] = useState(null);
  // Las dos condiciones que se comprueban mientras escribe, no al pulsar.
  const coinciden = claveRepetida.length > 0 && clave === claveRepetida;
  const puedeGuardar = cumpleReglas(clave) && coinciden;
  // Reenvío del enlace desde la propia pantalla de error: si el enlace caducó,
  // la cuenta sigue SIN activar, y sin activar el login rechaza por `status`
  // antes incluso de mirar la contraseña. Mandar a «recuperar contraseña» no
  // les desbloquearía; lo único que sirve es un enlace de activación nuevo.
  const [emailReenvio, setEmailReenvio] = useState('');
  // Si el email lo hemos puesto nosotros, el rótulo lo dice: si no, parece que
  // el navegador lo ha autocompletado y no se sabe si es el correcto.
  const [emailPrellenado, setEmailPrellenado] = useState(false);
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
            : response?.data?.alreadyActive === true
              // El enlace ya se había usado del todo. Antes esto era una
              // pantalla de error —«este enlace ya no sirve»— y no lo es:
              // la cuenta está lista y lo único que hay que hacer es entrar.
              ? 'Tu cuenta ya está activada. Entra con tu contraseña.'
              : '¡Cuenta verificada y activada con éxito!',
        );
      } catch (error) {
        console.error("Error al activar cuenta:", error.response ? error.response.data : error.message);
        setStatus('error');
        setMessage(mensajeEnCastellano(error?.response?.data?.message));

        // El enlace no vale, así que abajo se le ofrece pedir otro… y hasta
        // ahora había que teclear el email a mano. A alguien que ACABA de
        // llegar pinchando desde ese mismo correo: trabajo doble y una ocasión
        // más de escribirlo mal. El token sigue identificando al destinatario
        // aunque haya caducado, así que se le pregunta al servidor y el campo
        // sale relleno.
        //
        // Si esto falla no se dice nada: el formulario se queda como estaba,
        // vacío y perfectamente usable. Es una comodidad, no un requisito.
        try {
          const { data } = await axios.get(`${API_BASE}/api/v1/user/activation-email`, {
            params: { token },
          });
          if (data?.email) {
            setEmailReenvio(data.email);
            setEmailPrellenado(true);
          }
        } catch {
          /* sin prerrelleno */
        }
      }
    }

    activateAccount();
  }, [token]);

  const guardarContrasena = async (e) => {
    e.preventDefault();
    setErrorClave('');
    // Mismas reglas que pinta la lista de arriba y que aplica el servidor: si
    // aquí se comprobara otra cosa, la lista diría que todo está bien y el
    // botón seguiría rechazándola.
    if (!cumpleReglas(clave)) {
      setErrorClave('La contraseña todavía no cumple los requisitos de arriba.');
      return;
    }
    if (clave !== claveRepetida) {
      setErrorClave('Las dos contraseñas no coinciden.');
      return;
    }
    setGuardando(true);
    try {
      await axios.post(`${API_BASE}/api/v1/user/activate`, { token, password: clave });
      enviarFormSubmit({ id: 'activar_cuenta', nombre: 'Activar cuenta · crear contraseña' });
      setClaveLista(true);

      // ENTRAR SOLA Y CAER EN LO QUE HA COMPRADO.
      //
      // Antes esto terminaba con un botón a /login: la persona acababa de
      // escribir su contraseña dos veces y lo siguiente era escribirla otra
      // vez, para aparecer en la portada. Quien llega aquí viene de comprar y
      // lo que quiere ver es su compra.
      //
      // Se entra con lo que acaba de elegir —ya lo tenemos en el formulario, no
      // hay que pedirle nada— y se le lleva a la sección de lo que tiene. Si
      // algo de esto falla, se queda el botón de siempre: es un atajo, no un
      // requisito.
      try {
        const { data: quien } = await axios.get(`${API_BASE}/api/v1/user/activation-email`, {
          params: { token },
        });
        const correo = quien?.email;
        if (!correo) return;

        const { data: sesion } = await axios.post(`${API_BASE}/api/v1/user/login`, {
          username: correo,
          password: clave,
        });
        if (!sesion?.token) return;

        useAuthStore.getState().setToken(sesion.token);
        setDestino(await averiguarDestino(sesion.token));
      } catch (err) {
        console.warn('No se pudo entrar automáticamente; queda el botón de entrar.', err);
      }
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
      enviarFormSubmit({ id: 'reenviar_activacion', nombre: 'Activar cuenta · pedir otro enlace' });
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
            <Loader2 className="w-20 h-20 text-[#363C98] animate-spin" strokeWidth={1.5} />
            <div className="absolute w-12 h-12 bg-[#363C98]/10 rounded-full animate-ping"></div>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-[#363C98]">Verificando tu cuenta</h2>
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
            <Link
              href={destino || '/login'}
              className="w-full cursor-pointer bg-[#363C98] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#363C98]/90 transition duration-300 block"
            >
              {destino ? 'Ir a lo que has comprado' : 'Entrar en mi cuenta'}
            </Link>
          ) : pideContrasena ? (
            <form onSubmit={guardarContrasena} className="w-full flex flex-col gap-3 text-left">
              <label htmlFor="clave" className="text-sm font-semibold text-gray-600">
                Elige tu contraseña
              </label>
              <div className="relative">
                <input
                  id="clave"
                  type={verClave ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Al menos 8 caracteres"
                  className="w-full rounded-2xl border border-gray-200 p-4 pr-12 text-base text-gray-800 outline-hidden focus:border-[#363C98]"
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {verClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Los requisitos, en vivo. Antes esto solo lo tenía el registro:
                  aquí la contraseña se rechazaba al pulsar el botón, y con un
                  mensaje genérico que no decía QUÉ faltaba. */}
              <PasswordChecklist value={clave} />

              <label htmlFor="clave2" className="text-sm font-semibold text-gray-600">
                Repítela
              </label>
              <div className="relative">
                <input
                  id="clave2"
                  type={verClave ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={claveRepetida}
                  onChange={(e) => setClaveRepetida(e.target.value)}
                  placeholder="La misma otra vez"
                  className={`w-full rounded-2xl border p-4 pr-12 text-base text-gray-800 outline-hidden transition-colors ${
                    coinciden ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 focus:border-[#363C98]'
                  }`}
                />
                {coinciden && (
                  <span
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"
                    aria-label="Las contraseñas coinciden"
                  >
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </span>
                )}
              </div>
              {claveRepetida.length > 0 && !coinciden && (
                <p className="text-sm text-slate-400">Las dos contraseñas todavía no coinciden.</p>
              )}

              {errorClave && <p className="text-sm text-red-600">{errorClave}</p>}
              <button
                type="submit"
                disabled={guardando || !puedeGuardar}
                className="w-full cursor-pointer bg-[#FF690B] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#FF690B]/90 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {guardando ? 'Guardando…' : 'Crear contraseña y entrar'}
              </button>
            </form>
          ) : (
          <div className="w-full mt-2 flex flex-col gap-3">
            <Link href="/login" className="w-full cursor-pointer bg-[#363C98] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#363C98]/90 transition duration-300 block">
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
            {/* Antes ponía «solo se pueden usar una vez» —ya no es verdad para
                abrir el enlace: desde el arreglo del 6-ago, abrirlo dos veces
                no lo gasta— y «te mandamos otro ahora mismo», que tampoco:
                hay que pulsar el botón. Prometer algo que no ha pasado deja a
                la gente esperando un correo que nadie ha enviado. */}
            <p className="text-gray-400 text-sm">
              No pasa nada: pídenos otro aquí abajo y te llega al momento.
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
                Búscalo en tu correo (mira también en spam): tienes 4 días para abrirlo.
              </p>
            </div>
          ) : (
            <form onSubmit={reenviarEnlace} className="w-full flex flex-col gap-3">
              <label htmlFor="email-reenvio" className="text-left text-sm font-semibold text-gray-600">
                {emailPrellenado
                  ? 'Te lo mandamos aquí (puedes cambiarlo)'
                  : 'Tu correo, el mismo con el que compraste'}
              </label>
              <input
                id="email-reenvio"
                type="email"
                required
                value={emailReenvio}
                onChange={(e) => {
                  setEmailReenvio(e.target.value);
                  setEmailPrellenado(false);
                }}
                placeholder="tucorreo@ejemplo.com"
                className={`w-full rounded-2xl border p-4 text-base text-gray-800 outline-hidden focus:border-[#363C98] ${
                  emailPrellenado ? 'border-[#363C98]/40 bg-[#F5F5FF]' : 'border-gray-200'
                }`}
              />
              {errorReenvio && <p className="text-left text-sm text-red-600">{errorReenvio}</p>}
              <button
                type="submit"
                disabled={reenvio === 'enviando'}
                className="w-full cursor-pointer bg-[#363C98] text-white rounded-3xl p-5 text-lg font-bold hover:bg-[#363C98]/90 transition duration-300 disabled:opacity-60"
              >
                {reenvio === 'enviando' ? 'Enviando…' : 'Enviarme un enlace nuevo'}
              </button>
            </form>
          )}

          {/* El botón decía «Mi cuenta ya estaba activada · Crear o recuperar
              contraseña» y ocupaba dos líneas: la mitad de ese texto es la
              CONDICIÓN («si tu cuenta ya estaba activada») y la otra mitad la
              acción. La condición sale fuera, como pregunta, y dentro se queda
              solo lo que se va a hacer al pulsar. */}
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">¿Tu cuenta ya estaba activada?</p>
            <Link
              href="/forgot-password"
              className="w-full cursor-pointer bg-gray-100 text-gray-700 rounded-3xl p-4 text-base font-semibold hover:bg-gray-200 transition duration-300 block"
            >
              Crear o recuperar contraseña
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen text-xl text-white bg-linear-to-b from-[#363C98] to-[#FF690B] flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-16 text-black flex flex-col items-center text-center gap-8 border border-white/20">
          <Loader2 className="w-20 h-20 text-[#363C98] animate-spin" strokeWidth={1.5} />
          <h2 className="text-3xl font-bold text-[#363C98]">Cargando...</h2>
        </div>
      }>
        <ActivateContent />
      </Suspense>
    </div>
  );
}
