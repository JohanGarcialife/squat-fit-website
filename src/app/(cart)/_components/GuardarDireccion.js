'use client';

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import Casilla from './Casilla';
import { CLASES_CAMPO, CLASES_ETIQUETA } from './CheckoutForm';
import { useAuthStore } from '@/stores/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

/** Etiquetas de un toque. Cubren casi todo; el resto se escribe. */
const SUGERENCIAS = ['Casa', 'Trabajo', 'Casa de mis padres'];

/**
 * «Guardar esta dirección» del paso 2.
 *
 * ── Solo para quien tiene cuenta ────────────────────────────────────────────
 *
 * La agenda vive colgada del `user_id`, así que sin sesión no hay dónde
 * guardarla. Se oculta entera en vez de enseñarla y fallar al pulsar: ofrecer
 * algo que no se puede hacer es peor que no ofrecerlo. Y es la mayoría — hoy
 * casi todas las compras son de invitado.
 *
 * ── Por qué guarda con un botón y no al continuar ──────────────────────────
 *
 * Guardar en silencio al avanzar de paso deja al cliente sin saber si se
 * guardó, y el sitio donde lo comprobaría (su perfil) está dos pantallas atrás
 * en mitad de una compra. Con el botón, la confirmación llega donde se ha
 * pedido la acción.
 *
 * ── Las dos marcas ──────────────────────────────────────────────────────────
 *
 * Envío y facturación por separado, porque esa es justamente la razón de que
 * exista la agenda: hay clientes que facturan en la oficina y reciben en casa.
 * La primera dirección que guarda un cliente queda de predeterminada para las
 * dos cosas sin preguntar (lo hace el backend), así que estas casillas solo
 * pintan de la segunda en adelante.
 */
export default function GuardarDireccion({ valores, sameAddress }) {
  const { token } = useAuthStore();
  const [activo, setActivo] = useState(false);
  const [etiqueta, setEtiqueta] = useState('Casa');
  const [porDefectoEnvio, setPorDefectoEnvio] = useState(true);
  const [porDefectoFactura, setPorDefectoFactura] = useState(true);
  const [estado, setEstado] = useState('inicial'); // inicial | guardando | ok | error
  const [mensaje, setMensaje] = useState(null);

  if (!token) return null;

  // La dirección que se guarda es la de ENVÍO cuando el cliente ha marcado que
  // son distintas. Es la que se reutiliza al comprar; la de factura suele ser
  // la misma y, si no, se guarda aparte con su propia etiqueta.
  const destino = sameAddress
    ? {
        linea1: valores.address,
        linea2: valores.apartment,
        codigo_postal: valores.postalCode,
        ciudad: valores.city,
        pais: valores.country,
      }
    : {
        linea1: valores.shippingAddress,
        linea2: valores.shippingApartment,
        codigo_postal: valores.shippingPostalCode,
        ciudad: valores.shippingCity,
        pais: valores.shippingCountry,
      };

  const nombre = [valores.firstName, valores.lastName].filter(Boolean).join(' ').trim();
  const completa =
    destino.linea1 && destino.codigo_postal && destino.ciudad && destino.pais && nombre;

  const guardar = async () => {
    setEstado('guardando');
    setMensaje(null);
    try {
      const res = await fetch(`${API}/api/v1/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          etiqueta: etiqueta.trim() || 'Mi dirección',
          nombre,
          linea1: destino.linea1,
          ...(destino.linea2 ? { linea2: destino.linea2 } : {}),
          codigo_postal: destino.codigo_postal,
          ciudad: destino.ciudad,
          pais: String(destino.pais).toUpperCase().slice(0, 2),
          ...(valores.phone ? { telefono: valores.phone } : {}),
          predeterminada_envio: porDefectoEnvio,
          predeterminada_facturacion: porDefectoFactura,
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
      <Casilla id="guardar-direccion" checked={activo} onChange={setActivo}>
        <span className="text-slate-600 text-sm">Guardar esta dirección para futuras compras</span>
      </Casilla>

      {activo && (
        <div className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="etiqueta-direccion" className={CLASES_ETIQUETA}>
              ¿Cómo la llamamos?
            </label>
            <div className="flex flex-wrap gap-2 mb-1">
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
            <input
              id="etiqueta-direccion"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              maxLength={60}
              placeholder="O escribe otro nombre"
              className={CLASES_CAMPO}
            />
          </div>

          <Casilla
            id="dir-por-defecto-envio"
            checked={porDefectoEnvio}
            onChange={setPorDefectoEnvio}
          >
            <span className="text-slate-600 text-sm">Usarla por defecto para los envíos</span>
          </Casilla>
          <Casilla
            id="dir-por-defecto-factura"
            checked={porDefectoFactura}
            onChange={setPorDefectoFactura}
          >
            <span className="text-slate-600 text-sm">Usarla por defecto en las facturas</span>
          </Casilla>

          {estado === 'ok' ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Check size={16} strokeWidth={3} className="shrink-0" />
              Guardada como «{etiqueta.trim() || 'Mi dirección'}». Puedes cambiarla en tu perfil.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={guardar}
                disabled={!completa || estado === 'guardando'}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {estado === 'guardando' && <Loader2 size={15} className="animate-spin" />}
                Guardar dirección
              </button>
              {/* Se dice POR QUÉ está apagado. Un botón gris sin explicación
                  hace pensar que la web está rota. */}
              {!completa && (
                <p className="text-xs text-slate-400">
                  Rellena antes el nombre y la dirección completa.
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
