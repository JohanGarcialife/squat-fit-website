'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Home,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import ConfirmationModal from '@/app/components/ConfirmationModal';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

const CARD = 'bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm';
const LABEL = 'text-slate-400 text-xs font-semibold uppercase tracking-wider';
const INPUT =
  'w-full bg-transparent border-b border-slate-200 pb-1.5 text-[#363C98] font-bold text-base focus:outline-none focus:border-[#FF690B] transition-colors placeholder:text-slate-300 placeholder:font-normal';

const VACIA = {
  etiqueta: '',
  nombre: '',
  linea1: '',
  linea2: '',
  codigo_postal: '',
  ciudad: '',
  pais: 'ES',
  telefono: '',
};

/**
 * Las direcciones guardadas del cliente, en Ajustes.
 *
 * La agenda se llena desde el carrito (paso 2). Aquí se corrige, se borra y se
 * decide cuál se propone por defecto — que son las tres cosas que no se pueden
 * hacer en mitad de una compra sin abandonarla.
 *
 * ── Envío y facturación por separado ────────────────────────────────────────
 *
 * Son dos marcas independientes porque la razón de existir de toda esta agenda
 * es que hay clientes que facturan en un sitio y reciben en otro. La misma
 * dirección puede llevar las dos, que es lo más común.
 *
 * ── Estados vacíos ──────────────────────────────────────────────────────────
 *
 * Sin direcciones no se pinta una tarjeta vacía diciendo «no hay nada»: se
 * pinta la invitación a añadir la primera, con el motivo. Un hueco en blanco
 * en Ajustes parece una sección rota.
 */
export default function MisDirecciones() {
  const { token } = useAuthStore();
  const [direcciones, setDirecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null); // null | {…} | 'nueva'
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);

  const cabeceras = useCallback(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token],
  );

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/v1/addresses`, { headers: cabeceras() });
      if (!res.ok) throw new Error('No se pudieron cargar tus direcciones');
      setDirecciones(await res.json());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setCargando(false);
    }
  }, [token, cabeceras]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (datos) => {
    setGuardando(true);
    try {
      const esNueva = !datos.id;
      const res = await fetch(
        esNueva ? `${API}/api/v1/addresses` : `${API}/api/v1/addresses/${datos.id}`,
        {
          method: esNueva ? 'POST' : 'PUT',
          headers: cabeceras(),
          body: JSON.stringify({
            etiqueta: datos.etiqueta,
            nombre: datos.nombre,
            linea1: datos.linea1,
            linea2: datos.linea2 || undefined,
            codigo_postal: datos.codigo_postal,
            ciudad: datos.ciudad,
            pais: String(datos.pais || '').toUpperCase().slice(0, 2),
            telefono: datos.telefono || undefined,
          }),
        },
      );
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo?.message || 'No se pudo guardar');
      toast.success(esNueva ? 'Dirección añadida' : 'Dirección actualizada');
      setEditando(null);
      await cargar();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Cambiar la predeterminada.
   *
   * Se manda solo la marca que se toca. El backend distingue «no lo toques» de
   * «quítamela», así que pulsar «envío» no puede llevarse por delante la de
   * facturación.
   */
  const marcar = async (id, cual) => {
    try {
      const res = await fetch(
        `${API}/api/v1/addresses/${id}/predeterminada?${cual}=true`,
        { method: 'PATCH', headers: cabeceras() },
      );
      if (!res.ok) throw new Error('No se pudo cambiar');
      await cargar();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const borrar = async () => {
    const id = aBorrar?.id;
    setABorrar(null);
    try {
      const res = await fetch(`${API}/api/v1/addresses/${id}`, {
        method: 'DELETE',
        headers: cabeceras(),
      });
      if (!res.ok) throw new Error('No se pudo borrar');
      toast.success('Dirección eliminada');
      await cargar();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (!token) return null;

  return (
    <div className={CARD + ' space-y-6'}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-[#363C98] font-extrabold text-xl">Mis direcciones</h3>
        </div>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando({ ...VACIA })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[#363C98] transition hover:border-[#FF690B] hover:text-[#FF690B] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Añadir
          </button>
        )}
      </div>

      {cargando ? (
        <p className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </p>
      ) : editando ? (
        <Formulario
          inicial={editando}
          guardando={guardando}
          onCancelar={() => setEditando(null)}
          onGuardar={guardar}
        />
      ) : direcciones.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-[#363C98] font-bold">Todavía no has guardado ninguna</p>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Guarda las que uses y el carrito las rellenará solo. Puedes tener una para
            los envíos y otra distinta para las facturas.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {direcciones.map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Home className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-[#363C98] font-extrabold">{d.etiqueta}</span>
                  {d.predeterminada_envio && <Chip icon={Truck} texto="Envío" />}
                  {d.predeterminada_facturacion && <Chip icon={Receipt} texto="Factura" />}
                </div>
                <p className="text-slate-600 text-sm mt-1.5">
                  {d.nombre} · {d.linea1}
                  {d.linea2 ? `, ${d.linea2}` : ''} · {d.codigo_postal} {d.ciudad} ({d.pais})
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {!d.predeterminada_envio && (
                    <Accion onClick={() => marcar(d.id, 'envio')} icon={Truck}>
                      Usar para envíos
                    </Accion>
                  )}
                  {!d.predeterminada_facturacion && (
                    <Accion onClick={() => marcar(d.id, 'facturacion')} icon={Receipt}>
                      Usar para facturas
                    </Accion>
                  )}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditando(d)}
                  aria-label={`Editar ${d.etiqueta}`}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#363C98] transition cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setABorrar(d)}
                  aria-label={`Eliminar ${d.etiqueta}`}
                  className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Borrar una dirección no se deshace, así que se pregunta. Y se dice
          CUÁL, por su etiqueta: «¿Seguro?» a secas no da la información que
          hace falta para decidir.
          El modal compartido solo acepta `message`, así que la etiqueta va
          dentro del texto en vez de en un título aparte. */}
      <ConfirmationModal
        isOpen={!!aBorrar}
        onClose={() => setABorrar(null)}
        onConfirm={borrar}
        message={`¿Eliminar «${aBorrar?.etiqueta ?? ''}»? No afecta a los pedidos que ya has hecho.`}
      />
    </div>
  );
}

function Chip({ icon: Icon, texto }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6F0] px-2 py-0.5 text-[11px] font-bold text-[#FF690B]">
      <Icon className="w-3 h-3" />
      {texto}
    </span>
  );
}

function Accion({ onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 transition hover:border-[#FF690B] hover:text-[#FF690B] cursor-pointer"
    >
      <Icon className="w-3 h-3" />
      {children}
    </button>
  );
}

function Formulario({ inicial, guardando, onCancelar, onGuardar }) {
  const [d, setD] = useState(inicial);
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  const completa = d.etiqueta && d.nombre && d.linea1 && d.codigo_postal && d.ciudad && d.pais;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[#363C98] font-extrabold">
          {inicial.id ? 'Editar dirección' : 'Nueva dirección'}
        </span>
        <button
          type="button"
          onClick={onCancelar}
          aria-label="Cancelar"
          className="p-1.5 rounded-full text-slate-400 hover:bg-slate-50 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <Campo label="Nombre de la dirección" value={d.etiqueta} onChange={set('etiqueta')} placeholder="Casa, Trabajo…" />
        <Campo label="A nombre de" value={d.nombre} onChange={set('nombre')} placeholder="Ana García López" />
        <Campo label="Dirección" value={d.linea1} onChange={set('linea1')} placeholder="Calle y número" />
        <Campo label="Piso / puerta" value={d.linea2} onChange={set('linea2')} placeholder="Opcional" />
        <Campo label="Código postal" value={d.codigo_postal} onChange={set('codigo_postal')} placeholder="03003" />
        <Campo label="Ciudad" value={d.ciudad} onChange={set('ciudad')} placeholder="Alicante" />
        <Campo label="País (ISO-2)" value={d.pais} onChange={set('pais')} placeholder="ES" />
        <Campo label="Teléfono" value={d.telefono} onChange={set('telefono')} placeholder="Opcional" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onGuardar(d)}
          disabled={!completa || guardando}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#363C98] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d3280] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col space-y-1.5">
      <span className={LABEL}>{label}</span>
      <input value={value ?? ''} onChange={onChange} placeholder={placeholder} className={INPUT} />
    </label>
  );
}
