'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import AccessNotice from '@/app/components/AccessNotice';
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
  LifeBuoy,
  Users,
  Scale,
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
  const [deleteWord, setDeleteWord] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [actionBusy, setActionBusy] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const runAction = async (sub, action) => {
    setActionBusy(sub.id);
    try {
      await axios.post(
        `${API}/api/v1/billing/subscriptions/${sub.id}/${action}`,
        { kind: sub.kind },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Optimista: refleja el nuevo estado sin esperar al webhook.
      setSubscriptions((subs) =>
        subs.map((s) =>
          s.id === sub.id && s.kind === sub.kind
            ? {
                ...s,
                status: action === 'pause' ? 'en pausa' : action === 'resume' ? 'activa' : s.status,
                _cancelScheduled: action === 'cancel' ? true : s._cancelScheduled,
              }
            : s,
        ),
      );
      toast.success(
        action === 'cancel'
          ? 'Cancelada al final del periodo'
          : action === 'pause'
          ? 'Suscripción pausada'
          : 'Suscripción reanudada',
      );
    } catch (e) {
      toast.error('No se pudo completar la acción');
    } finally {
      setActionBusy(null);
      setCancelTarget(null);
    }
  };

  const setField = (patch) => {
    setProfile((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  useEffect(() => {
    // Sin sesión no cargamos nada: el render muestra el aviso de acceso.
    if (!token) return;
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

  // Doble confirmación superada → borrado RGPD definitivo (13.10). El email
  // tecleado nunca puede estar vacío (si user/info fallara, un campo vacío
  // «coincidiría» con un email desconocido).
  const deleteConfirmed =
    deleteWord.trim().toUpperCase() === 'ELIMINAR' &&
    deleteEmail.trim().length > 0 &&
    deleteEmail.trim().toLowerCase() === (email || '').trim().toLowerCase();

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setDeleteWord('');
    setDeleteEmail('');
  };

  const handleDelete = async () => {
    if (!deleteConfirmed || deleting) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/v1/user/account/gdpr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Pantalla de despedida primero (el logout borra el token y, sin el
      // estado `deleted` por delante, se vería el aviso de acceso).
      setDeleted(true);
      logout();
    } catch (e) {
      toast.error('No se pudo eliminar la cuenta. Escríbenos a hola@squatfit.es');
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen px-6 text-center">
        <div className="max-w-md flex flex-col items-center">
          <div className="text-6xl mb-5">👋</div>
          <h1 className="text-3xl font-extrabold text-[#363C98] mb-3">Tu cuenta se ha eliminado</h1>
          <p className="text-slate-500 leading-relaxed mb-2">
            Hemos borrado tus datos personales y cancelado tus suscripciones, tal y
            como marca el RGPD. Sentimos verte marchar.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Si algún día quieres volver, estaremos aquí: puedes crear una cuenta
            nueva cuando quieras.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-[#FF690B] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#e05b08] active:scale-95 transition-all cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!token) return <AccessNotice redirect="/panel-ajustes" />;
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
              {subscriptions.map((s) => {
                const busy = actionBusy === s.id;
                return (
                  <div key={`${s.kind}-${s.id}`} className="p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-4">
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
                    {(s.status === 'activa' || s.status === 'en pausa') && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {s._cancelScheduled ? (
                          <span className="text-xs text-slate-400 font-semibold">Se cancelará al final del periodo</span>
                        ) : s.status === 'en pausa' ? (
                          <ActionBtn onClick={() => runAction(s, 'resume')} disabled={busy}>Reanudar</ActionBtn>
                        ) : (
                          <>
                            <ActionBtn onClick={() => runAction(s, 'pause')} disabled={busy}>Pausar</ActionBtn>
                            <ActionBtn danger onClick={() => setCancelTarget(s)} disabled={busy}>Cancelar</ActionBtn>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-slate-400 text-xs">Las tarjetas guardadas, las facturas en PDF y la cancelación se gestionan de forma segura en el portal de pagos (Stripe).</p>
        </div>

        {/* ===== NOTIFICACIONES ===== */}
        <div className={CARD + ' space-y-2'}>
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
          <button type="button" onClick={() => router.push('/panel-alertas')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span>Historial de avisos y preferencias</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* ===== PRIVACIDAD · AYUDA · CONÓCENOS · LEGAL · SESIÓN =====
            El orden y los ítems siguen la spec TMV: Conócenos y Legal viven
            aquí (antes estaban mezclados en «Info» con lo principal). */}
        <div className={CARD + ' space-y-2'}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-2">
            <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><Shield className="w-6 h-6" /></div>
            <h3 className="text-[#363C98] font-extrabold text-lg">Privacidad y más</h3>
          </div>
          <button type="button" onClick={() => router.push('/panel-ajustes/legal?seccion=privacidad')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><Shield className="w-4 h-4 text-slate-400" /> Privacidad y cookies</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button type="button" onClick={() => router.push('/panel-contacto')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><LifeBuoy className="w-4 h-4 text-slate-400" /> Ayuda y soporte</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button type="button" onClick={() => router.push('/panel-ajustes/conocenos')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><Users className="w-4 h-4 text-slate-400" /> Conócenos</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button type="button" onClick={() => router.push('/panel-ajustes/legal')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><Scale className="w-4 h-4 text-slate-400" /> Legal</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button type="button" onClick={() => setLogoutOpen(true)} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition text-[#363C98] font-bold text-sm cursor-pointer">
            <span className="flex items-center gap-2.5"><LogOut className="w-4 h-4 text-slate-400" /> Cerrar sesión</span>
          </button>
        </div>

        {/* ===== ZONA DE PELIGRO (13.10) ===== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2.5 rounded-2xl text-red-500"><Trash2 className="w-6 h-6" /></div>
            <h3 className="text-red-600 font-extrabold text-lg">Zona de peligro</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Eliminar tu cuenta es <strong className="text-slate-700">irreversible</strong>: borra
            todos tus datos (perfil, progreso, formularios, historial de compras) y{' '}
            <strong className="text-slate-700">cancela tus suscripciones activas</strong>. No
            podremos recuperar nada después.
          </p>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="border-2 border-red-200 text-red-500 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all cursor-pointer"
          >
            Eliminar mi cuenta definitivamente
          </button>
        </div>
      </div>

      <ConfirmationModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} message="¿Estás seguro de que quieres cerrar sesión?" />

      {/* Modal de doble confirmación del borrado RGPD */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={deleting ? undefined : closeDeleteModal} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2.5 rounded-2xl text-red-500"><Trash2 className="w-6 h-6" /></div>
              <h3 className="text-[#363C98] font-extrabold text-xl">¿Eliminar tu cuenta?</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Esta acción es <strong className="text-slate-700">irreversible</strong>. Se
              borrarán todos tus datos y se cancelarán tus suscripciones. Para
              confirmar, escribe <strong className="text-red-500">ELIMINAR</strong> y tu
              email de acceso.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <span className={LABEL}>Escribe ELIMINAR</span>
                <input
                  value={deleteWord}
                  onChange={(e) => setDeleteWord(e.target.value)}
                  placeholder="ELIMINAR"
                  className={INPUT}
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className={LABEL}>Tu email ({email || 'el de tu cuenta'})</span>
                <input
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="tu@email.com"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  className={INPUT}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-5 py-2.5 rounded-full font-bold text-sm text-[#363C98] hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!deleteConfirmed || deleting}
                className="px-5 py-2.5 rounded-full font-bold text-sm text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Eliminando…' : 'Eliminar para siempre'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && runAction(cancelTarget, 'cancel')}
        message={`¿Cancelar "${cancelTarget?.title || 'esta suscripción'}"? Seguirá activa hasta el final del periodo que ya has pagado.`}
      />
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
        danger
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-slate-200 text-[#363C98] hover:border-[#FF690B]/40 hover:text-[#FF690B]'
      }`}
    >
      {children}
    </button>
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
