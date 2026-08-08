'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Gift } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.squadfit.es';

/**
 * «¿Era para regalar?» — en la pantalla de gracias.
 *
 * Quien ya tenía un curso y lo compraba otra vez pagaba y no recibía nada: el
 * webhook concede con `onConflict→ignore`, así que la segunda compra no añadía
 * nada. Hasta ahora la única salida honesta era avisarle de que no lo hiciera.
 * Esto le da destinatario a esa compra.
 *
 * SE ESCONDE ENTERO SI NO HAY PEDIDO. `orderId` llega null cuando el cobro
 * entró por un enlace de pago sin metadata —esos no crean pedido—, y entonces
 * no hay nada que regalar. Enseñar el formulario y que fallara al enviarlo
 * sería peor que no ofrecerlo.
 *
 * UNA VEZ Y SE ACABÓ: el backend garantiza con un índice único que un pedido
 * se regala una sola vez, así que al acertar se sustituye el formulario por la
 * confirmación en vez de dejar el botón puesto invitando a repetir.
 */
export default function RegalarCompra({ orderId }) {
  const { token } = useAuthStore();
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState(null);

  if (!orderId || !token) return null;

  if (hecho) {
    return (
      <div className="mt-8 rounded-2xl bg-[#F3F2F9] border border-[#363C98]/15 p-5 text-left">
        <p className="text-[#363C98] font-bold">Regalo enviado</p>
        <p className="text-slate-600 text-sm mt-1">{hecho}</p>
      </div>
    );
  }

  const enviar = async (e) => {
    e.preventDefault();
    const destino = email.trim().toLowerCase();
    if (!destino) return;
    setEnviando(true);
    try {
      const { data } = await axios.post(
        `${API}/api/v1/orders/${orderId}/regalar`,
        { email: destino },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // El mensaje lo compone el servidor porque lo que cambia entre «le hemos
      // creado la cuenta» y «ya la tenía» es justo lo que hay que contarle a
      // quien regala: si su amiga debe mirar el correo o simplemente entrar.
      setHecho(data?.mensaje || `Se lo hemos dado a ${destino}.`);
      toast.success('Regalo enviado');
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'No se pudo enviar el regalo.');
    } finally {
      setEnviando(false);
    }
  };

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="mt-8 inline-flex items-center gap-2 text-[#363C98] font-bold underline cursor-pointer"
      >
        <Gift className="w-5 h-5" />
        ¿Era para regalar?
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-8 rounded-2xl bg-[#F3F2F9] border border-[#363C98]/15 p-5 text-left">
      <p className="text-[#363C98] font-bold">¿A quién se lo regalas?</p>
      <p className="text-slate-600 text-sm mt-1">
        Dinos su correo y le mandamos sus accesos. Si no tiene cuenta, se la creamos.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo de la persona"
          className="flex-1 rounded-xl border border-[#363C98]/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#363C98]/30"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-[#363C98] text-white font-bold px-6 py-3 disabled:opacity-50 cursor-pointer"
        >
          {enviando ? 'Enviando…' : 'Regalar'}
        </button>
      </div>
    </form>
  );
}
