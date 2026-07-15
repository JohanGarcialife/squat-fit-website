'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import {
  CreditCard,
  FileText,
  Bell,
  Shield,
  LogOut,
  KeyRound,
  ChevronRight,
  Building2,
  User,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

const CARD = 'bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm';
const LABEL = 'text-slate-400 text-xs font-semibold uppercase tracking-wider';
const INPUT =
  'w-full bg-transparent border-b border-slate-200 pb-1.5 text-[#363C98] font-bold text-base focus:outline-none focus:border-[#FF690B] transition-colors placeholder:text-slate-300 placeholder:font-normal';

const STATUS_STYLE = {
  activa: 'bg-green-100 text-green-700',
  'en pausa': 'bg-amber-100 text-amber-700',
  procesando: 'bg-slate-100 text-slate-600',
  'pago fallido': 'bg-red-100 text-red-700',
  cancelada: 'bg-slate-100 text-slate-500',
  vencida: 'bg-slate-100 text-slate-500',
};

export default function AjustesPage() {
  const router = useRouter();
  const { token, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    entity_type: 'individual',
    tax_id: '',
    billing_name: '',
    billing_last_name: '',
    billing_address: '',
    billing_apartment: '',
    billing_postal_code: '',
    billing_city: '',
    billing_country: '',
    shipping_same: true,
    shipping_address: '',
    shipping_apartment: '',
    shipping_postal_code: '',
    shipping_city: '',
    shipping_country: '',
    shipping_notes: '',
  });
  const [dirty, setDirty] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [userId, setUserId] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const setField = (patch) => {
    setProfile((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/panel-ajustes');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      // Info de cuenta (email, notificaciones). No debe tumbar la página.
      try {
        const info = (await axios.get(`${API}/api/v1/user/info`, { headers })).data;
        setUserId(info.id);
        setEmail(info.email || '');
        setNotifications(info.notifications !== false);
      } catch (e) { /* degradado */ }
      // Perfil de facturación (endpoint nuevo; puede no estar desplegado aún).
      try {
        const p = (await axios.get(`${API}/api/v1/billing/profile`, { headers })).data;
        if (p) setProfile((prev) => ({ ...prev, ...p, shipping_same: p.shipping_same !== false }));
      } catch (e) { /* aún sin backend → formulario vacío */ }
      // Suscripciones.
      try {
        const subs = (await axios.get(`${API}/api/v1/billing/subscriptions`, { headers })).data;
        if (Array.isArray(subs)) setSubscriptions(subs);
      } catch (e) { /* degradado */ }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await axios.put(`${API}/api/v1/billing/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Datos de facturación guardados');
      setDirty(false);
    } catch (e) {
      toast.error('No se pudieron guardar los datos (¿backend desplegado?)');
    } finally {
      setSavingProfile(false);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/api/v1/billing/portal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data?.url) window.location.href = data.url;
      else toast.error('No se pudo abrir el portal de pagos');
    } catch (e) {
      toast.error('El portal de pagos aún no está disponible');
    } finally {
      setPortalLoading(false);
    }
  };

  const toggleNotifications = async () => {
    const next = !notifications;
    setNotifications(next);
    if (!userId) return;
    try {
      const fd = new FormData();
      fd.append('notifications', String(next));
      await axios.put(`${API}/api/v1/user/update?user_id=${userId}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      setNotifications(!next);
      toast.error('No se pudo actualizar la preferencia');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/v1/user/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Cuenta eliminada');
      logout();
      router.push('/');
    } catch (e) {
      toast.error('No se pudo eliminar la cuenta. Escríbenos a hola@squatfit.es');
      setDeleteOpen(false);
    }
  };

  if (!token) return null;
  if (loading) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF690B] mb-4" />
        <span className="text-slate-500 font-extrabold text-sm">Cargando ajustes…</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <h1 className="text-3xl font-extrabold text-[#363C98]">Ajustes</h1>

        {/* ===== CUENTA Y FACTURACIÓN ===== */}
        <div className={CARD + ' space-y-6'}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><CreditCard className="w-6 h-6" /></div>
            <h3 className="text-[#363C98] font-extrabold text-xl">Cuenta y facturación</h3>
          </div>

          {/* Cuenta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5">
              <span className={LABEL}>Email de acceso</span>
              <span className="text-[#363C98] font-bold text-base">{email || '—'}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition text-[#363C98] font-bold text-sm cursor-pointer border border-slate-100"
            >
              <span className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-slate-400" /> Cambiar contraseña</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Tipo */}
          <div className="flex flex-col space-y-1.5">
            <span className={LABEL}>Tipo</span>
            <div className="flex gap-2 max-w-sm">
              {[
                { v: 'individual', label: 'Particular', Icon: User },
                { v: 'company', label: 'Empresa', Icon: Building2 },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setField({ entity_type: o.v })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                    profile.entity_type === o.v ? 'border-[#FF690B] bg-[#FFF6F0] text-[#FF690B]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <o.Icon className="w-4 h-4" /> {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datos fiscales + dirección de facturación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <Field label={profile.entity_type === 'company' ? 'CIF' : 'DNI / NIF'} value={profile.tax_id} onChange={(v) => setField({ tax_id: v })} placeholder="Número de identificación" />
            <Field label="Nombre de facturación" value={profile.billing_name} onChange={(v) => setField({ billing_name: v })} placeholder="Nombre o razón social" />
            <Field label="Apellidos" value={profile.billing_last_name} onChange={(v) => setField({ billing_last_name: v })} placeholder="Apellidos" />
            <Field label="Dirección" value={profile.billing_address} onChange={(v) => setField({ billing_address: v })} placeholder="Calle y número" />
            <Field label="Piso / puerta" value={profile.billing_apartment} onChange={(v) => setField({ billing_apartment: v })} placeholder="Opcional" />
            <Field label="Código postal" value={profile.billing_postal_code} onChange={(v) => setField({ billing_postal_code: v })} placeholder="CP" />
            <Field label="Ciudad" value={profile.billing_city} onChange={(v) => setField({ billing_city: v })} placeholder="Ciudad" />
            <Field label="País" value={profile.billing_country} onChange={(v) => setField({ billing_country: v })} placeholder="País" />
          </div>

          {/* Envío */}
          <label className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-pointer">
            <input type="checkbox" checked={profile.shipping_same} onChange={(e) => setField({ shipping_same: e.target.checked })} className="accent-[#FF690B] w-4 h-4" />
            La dirección de envío es la misma que la de facturación
          </label>
          {!profile.shipping_same && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 border-t border-slate-100 pt-6">
              <Field label="Dirección de envío" value={profile.shipping_address} onChange={(v) => setField({ shipping_address: v })} placeholder="Calle y número" />
              <Field label="Piso / puerta" value={profile.shipping_apartment} onChange={(v) => setField({ shipping_apartment: v })} placeholder="Opcional" />
              <Field label="Código postal" value={profile.shipping_postal_code} onChange={(v) => setField({ shipping_postal_code: v })} placeholder="CP" />
              <Field label="Ciudad" value={profile.shipping_city} onChange={(v) => setField({ shipping_city: v })} placeholder="Ciudad" />
              <Field label="País" value={profile.shipping_country} onChange={(v) => setField({ shipping_country: v })} placeholder="País" />
              <Field label="Notas de envío" value={profile.shipping_notes} onChange={(v) => setField({ shipping_notes: v })} placeholder="Instrucciones para el repartidor" />
            </div>
          )}

          {dirty && (
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={saveProfile} disabled={savingProfile} className="bg-[#FF690B] text-white font-bold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-60">
                {savingProfile ? 'Guardando…' : 'Guardar datos'}
              </button>
            </div>
          )}
        </div>

        {/* ===== SUSCRIPCIONES Y PAGOS ===== */}
        <div className={CARD + ' space-y-6'}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><FileText className="w-6 h-6" /></div>
              <h3 className="text-[#363C98] font-extrabold text-xl">Suscripciones y pagos</h3>
            </div>
            <button
              type="button"
              onClick={openPortal}
              disabled={portalLoading}
              className="shrink-0 flex items-center gap-2 border border-[#FF690B] text-[#FF690B] font-bold text-sm px-4 py-2 rounded-full hover:bg-[#FF690B]/5 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <ExternalLink className="w-4 h-4" />
              {portalLoading ? 'Abriendo…' : 'Gestionar pagos y facturas'}
            </button>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-slate-400 text-center py-6">Aún no tienes suscripciones activas.</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((s) => (
                <div key={`${s.kind}-${s.id}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-[#363C98] font-bold truncate">{s.title}</p>
                    <p className="text-slate-400 text-sm">
                      {s.periodicity || '—'}
                      {s.next_renewal && ` · Renueva el ${new Date(s.next_renewal).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.amount != null && (
                      <span className="text-[#FF690B] font-bold text-sm">
                        {Number(s.amount).toFixed(2)} {s.currency ? s.currency.toUpperCase() : '€'}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLE[s.status] || 'bg-slate-100 text-slate-500'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-slate-400 text-xs">Las tarjetas guardadas, las facturas en PDF y la cancelación se gestionan de forma segura en el portal de pagos (Stripe).</p>
        </div>

        {/* ===== NOTIFICACIONES ===== */}
        <div className={CARD}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><Bell className="w-6 h-6" /></div>
              <div>
                <h3 className="text-[#363C98] font-extrabold text-lg">Notificaciones</h3>
                <p className="text-slate-400 text-sm">Recibe avisos de tu progreso y novedades.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleNotifications}
              role="switch"
              aria-checked={notifications}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${notifications ? 'bg-[#FF690B]' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* ===== PRIVACIDAD / CUENTA ===== */}
        <div className={CARD + ' space-y-2'}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-2">
            <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><Shield className="w-6 h-6" /></div>
            <h3 className="text-[#363C98] font-extrabold text-lg">Privacidad y cuenta</h3>
          </div>
          <button type="button" onClick={() => router.push('/panel-info')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span>Aviso legal, privacidad y cookies</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button type="button" onClick={() => setLogoutOpen(true)} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><LogOut className="w-4 h-4 text-slate-400" /> Cerrar sesión</span>
          </button>
          <button type="button" onClick={() => setDeleteOpen(true)} className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition text-red-500 font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><Trash2 className="w-4 h-4" /> Eliminar mi cuenta</span>
          </button>
        </div>
      </div>

      <ConfirmationModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} message="¿Estás seguro de que quieres cerrar sesión?" />
      <ConfirmationModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} message="Vas a eliminar tu cuenta y todos tus datos. Esta acción no se puede deshacer. ¿Continuar?" />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col space-y-1.5">
      <span className={LABEL}>{label}</span>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT} />
    </div>
  );
}
