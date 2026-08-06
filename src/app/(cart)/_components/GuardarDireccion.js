'use client';

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import Casilla from './Casilla';
import { CLASES_CAMPO, CLASES_ETIQUETA } from './CheckoutForm';
import { useAuthStore } from '@/stores/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

/** Etiquetas de un toque. Cubren casi todo; «Otra» abre el campo libre. */
const SUGERENCIAS = ['Casa', 'Trabajo', 'Hotel', 'Otra'];

/**
 * «Guardar esta dirección», debajo de cada bloque de dirección del paso 2.
 *
 * ── Una por bloque, y cada una sabe para qué es ─────────────────────────────
 *
 * Va debajo de «Dirección de facturación» y debajo de «Dirección de envío», y
 * cada una guarda SU dirección y queda predeterminada de lo suyo. No hay
 * casillas de «usar por defecto»: la que guardas bajo facturación es tu
 * dirección de factura, y punto. Preguntarlo ahí era pedir al cliente que
 * tomara una decisión que el contexto ya había tomado, y en la pantalla donde
 * está intentando comprar.
 *
 * Quien quiera cambiarlo lo tiene en su perfil. Tampoco se dice aquí: contarlo
 * es una línea de texto más en un formulario que ya es largo, para una
 * necesidad que casi nadie tiene en ese momento.
 *
 * ── Solo para quien tiene cuenta ────────────────────────────────────────────
 *
 * La agenda cuelga del `user_id`, así que sin sesión no hay dónde guardarla. Se
 * oculta entera en vez de enseñarla y fallar al pulsar.
 *
 * ── Por qué guarda con un botón y no al continuar ──────────────────────────
 *
 * Guardar en silencio al avanzar de paso deja al cliente sin saber si se
 * guardó, y el sitio donde lo comprobaría (su perfil) está dos pantallas atrás
 * en mitad de una compra.
 */
export default function GuardarDireccion({ tipo, valores }) {
  const { token } = useAuthStore();
  const [activo, setActivo] = useState(false);
  const [etiqueta, setEtiqueta] = useState('Casa');
  const [personalizada, setPersonalizada] = useState('');
  const [estado, setEstado] = useState('inicial'); // inicial | guardando | ok | error
  const [mensaje, setMensaje] = useState(null);

  if (!token) return null;

  const esEnvio = tipo === 'envio';
  const id = `guardar-direccion-${tipo}`;

  const destino = esEnvio
    ? {
        linea1: valores.shippingAddress,
        linea2: valores.shippingApartment,
        codigo_postal: valores.shippingPostalCode,
        ciudad: valores.shippingCity,
        pais: valores.shippingCountry,
      }
    : {
        linea1: valores.address,
        linea2: valores.apartment,
        codigo_postal: valores.postalCode,
        ciudad: valores.city,
        pais: valores.country,
      };

  const nombre = [valores.firstName, valores.lastName].filter(Boolean).join(' ').trim();

  // QUÉ falta exactamente, no «rellena la dirección completa».
  //
  // Esta casilla vive debajo del TÍTULO de su apartado, así que aparece ANTES
  // de los campos que necesita: al abrirla están vacíos por fuerza. Con un
  // aviso genérico, el cliente lo lee como «me falta algo dentro de esta caja»
  // y se pone a buscar una casilla que no existe. Nombrando lo que falta, la
  // frase apunta sola a los campos de abajo.
  const faltan = [
    !nombre && 'tu nombre',
    !destino.linea1 && 'la dirección',
    !destino.codigo_postal && 'el código postal',
    !destino.ciudad && 'la ciudad',
    !destino.pais && 'el país',
  ].filter(Boolean);
  const completa = faltan.length === 0;
  // «Otra» no es un nombre: es la puerta al campo libre. Si el cliente la elige
  // y no escribe nada, se guardaría una dirección llamada «Otra».
  const laEtiqueta = (etiqueta === 'Otra' ? personalizada.trim() : etiqueta) || '';
  const listo = completa && laEtiqueta;

  const guardar = async () => {
    setEstado('guardando');
    setMensaje(null);
    try {
      const res = await fetch(`${API}/api/v1/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          etiqueta: laEtiqueta,
          nombre,
          linea1: destino.linea1,
          ...(destino.linea2 ? { linea2: destino.linea2 } : {}),
          codigo_postal: destino.codigo_postal,
          ciudad: destino.ciudad,
          pais: String(destino.pais).toUpperCase().slice(0, 2),
          ...(valores.phone ? { telefono: valores.phone } : {}),
          // Cada bloque marca lo suyo, sin preguntar.
          predeterminada_envio: esEnvio,
          predeterminada_facturacion: !esEnvio,
        }),
      });
      const datos = await res.json().catch(() => ({}));
      // El backend explica por qué cuando dice que no («no se pueden guardar
      // más de 20»), y eso se lee mejor que un «error inesperado».
      if (!res.ok) throw new Error(datos?.message || 'No se pudo guardar la dirección');
      setEstado('ok');
    } catch (e) {
      setMensaje(e.message);
      setEstado('error');
    }
  };

  return (
    <div className="pt-1">
      <Casilla id={id} checked={activo} onChange={setActivo}>
        {/* Se dice de QUÉ dirección hablamos. «Guardar esta dirección»
            aparecía dos veces, idéntico, en la misma pantalla: había que
            deducir cuál era cuál por dónde estaba puesto. */}
        <span className="text-slate-600 text-sm">
          Guardar dirección de {esEnvio ? 'envío' : 'facturación'} para futuras compras
        </span>
      </Casilla>

      {activo && (
        <div className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col gap-1">
            <span className={CLASES_ETIQUETA}>¿Cómo la llamamos?</span>
            <div className="flex flex-wrap gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEtiqueta(s)}
                  className={`rounded-full border px-3 py-1 text-sm transition-all cursor-pointer ${
                    etiqueta === s
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-orange-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* El campo libre solo aparece con «Otra». Enseñarlo siempre, al
                lado de cuatro botones que ya rellenan el nombre, invita a
                escribir cuando no hace falta. */}
            {etiqueta === 'Otra' && (
              <input
                id={`etiqueta-${tipo}`}
                value={personalizada}
                onChange={(e) => setPersonalizada(e.target.value)}
                maxLength={60}
                placeholder="Casa de mis padres, Almacén…"
                className={`${CLASES_CAMPO} mt-2`}
                autoFocus
              />
            )}
          </div>

          {estado === 'ok' ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Check size={16} strokeWidth={3} className="shrink-0" />
              Guardada como «{laEtiqueta}»
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={guardar}
                disabled={!listo || estado === 'guardando'}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {estado === 'guardando' && <Loader2 size={15} className="animate-spin" />}
                Guardar dirección
              </button>
              {/* Se dice POR QUÉ está apagado. Un botón gris sin explicación
                  hace pensar que la web está rota. */}
              {!listo && (
                <p className="text-xs text-slate-400">
                  {!completa
                    ? `Falta ${faltan.join(', ').replace(/, ([^,]*)$/, ' y $1')} más abajo.`
                    : 'Escribe un nombre para la dirección.'}
                </p>
              )}
            </>
          )}

          {mensaje && <p className="text-sm text-[#B4230E]">{mensaje}</p>}
        </div>
      )}
    </div>
  );
}
