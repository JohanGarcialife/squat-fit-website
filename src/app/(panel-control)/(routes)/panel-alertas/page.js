'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import {
  Bell,
  TrendingUp,
  AlertTriangle,
  Users,
  Award,
  Lock,
  Sliders,
  CheckCheck,
} from 'lucide-react';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';
const CARD = 'bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm';

// Estilo por categoría de alerta.
const CATS = {
  critica: { Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  seguimiento: { Icon: TrendingUp, color: 'text-[#363C98]', bg: 'bg-[#363C98]/5' },
  recordatorio: { Icon: Bell, color: 'text-[#FF690B]', bg: 'bg-[#FFF6F0]' },
  comunidad: { Icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  logro: { Icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-50' },
};

export default function AlertasPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ days_active: 0, unread: 0, next_step: '' });
  const [prefs, setPrefs] = useState({
    reminders_enabled: true,
    community_enabled: true,
    email_enabled: true,
    push_enabled: true,
  });
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/panel-alertas');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [st, list, pf] = await Promise.allSettled([
          axios.get(`${API}/api/v1/alerts/state`, { headers }),
          axios.get(`${API}/api/v1/alerts`, { headers }),
          axios.get(`${API}/api/v1/alerts/preferences`, { headers }),
        ]);
        if (st.status === 'fulfilled') setState(st.value.data);
        if (list.status === 'fulfilled' && Array.isArray(list.value.data)) setItems(list.value.data);
        if (pf.status === 'fulfilled' && pf.value.data) setPrefs((p) => ({ ...p, ...pf.value.data }));
      } catch (e) { /* degradado */ }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const markRead = async (n) => {
    if (n.is_read) return;
    setItems((its) => its.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
    setState((s) => ({ ...s, unread: Math.max(0, s.unread - 1) }));
    try {
      await axios.post(`${API}/api/v1/alerts/${n.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { /* no bloqueante */ }
  };

  const markAllRead = async () => {
    setItems((its) => its.map((i) => ({ ...i, is_read: true })));
    setState((s) => ({ ...s, unread: 0 }));
    try {
      await axios.post(`${API}/api/v1/alerts/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { /* no bloqueante */ }
  };

  const savePref = async (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      await axios.put(`${API}/api/v1/alerts/preferences`, patch, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      toast.error('No se pudo guardar la preferencia');
    }
  };

  if (!token) return null;
  if (loading) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF690B] mb-4" />
        <span className="text-slate-500 font-extrabold text-sm">Cargando alertas…</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-[#363C98]">Alertas</h1>
          <button
            onClick={() => setShowPrefs((v) => !v)}
            className="flex items-center gap-2 text-sm font-bold text-[#3932C0] hover:text-[#FF690B] transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" /> Gestionar mis avisos
          </button>
        </div>

        {/* Encabezado motivacional */}
        <div className="bg-gradient-to-r from-[#FF690B] to-[#ff8a3d] text-white rounded-3xl p-6 sm:p-8 shadow-lg">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">Tu progreso</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            Llevas {state.days_active} {state.days_active === 1 ? 'día' : 'días'} trabajando en ti 💪
          </h2>
          {state.next_step && <p className="text-white/90 mt-2">{state.next_step}</p>}
        </div>

        {/* Preferencias (colapsable) */}
        {showPrefs && (
          <div className={CARD + ' space-y-4'}>
            <h3 className="text-[#363C98] font-extrabold text-lg">Elige cómo quieres que te acompañemos</h3>
            <p className="text-slate-500 text-sm -mt-2">
              Algunas alertas están diseñadas para ayudarte a mantener el progreso incluso en semanas difíciles.
            </p>
            <PrefRow locked label="Cambios importantes de tu plan" hint="Siempre activas" />
            <PrefRow locked label="Seguimiento y progreso" hint="Siempre activas" />
            <PrefRow
              label="Recordatorios útiles"
              checked={prefs.reminders_enabled}
              onChange={(v) => savePref({ reminders_enabled: v })}
            />
            <PrefRow
              label="Comunidad y recursos"
              checked={prefs.community_enabled}
              onChange={(v) => savePref({ community_enabled: v })}
            />
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <PrefRow label="Recibir por email" checked={prefs.email_enabled} onChange={(v) => savePref({ email_enabled: v })} />
              <PrefRow label="Notificaciones push" checked={prefs.push_enabled} onChange={(v) => savePref({ push_enabled: v })} />
            </div>
          </div>
        )}

        {/* Lista de alertas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Tus avisos</span>
            {items.some((i) => !i.is_read) && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-bold text-[#3932C0] hover:text-[#FF690B] transition-colors cursor-pointer">
                <CheckCheck className="w-4 h-4" /> Marcar todo como leído
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className={CARD + ' text-center py-12'}>
              <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">No tienes avisos por ahora.</p>
              <p className="text-slate-400 text-sm mt-1">Aquí verás tu seguimiento, logros y recordatorios.</p>
            </div>
          ) : (
            items.map((n) => {
              const cat = CATS[n.category] || CATS.recordatorio;
              const Icon = cat.Icon;
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={`w-full text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    n.is_read ? 'bg-white border-slate-100' : 'bg-white border-[#FF690B]/30 shadow-sm'
                  }`}
                >
                  <div className={`${cat.bg} ${cat.color} p-2.5 rounded-2xl shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[#363C98] font-bold">{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#FF690B] shrink-0" />}
                    </div>
                    {n.body && <p className="text-slate-500 text-sm mt-0.5 leading-snug">{n.body}</p>}
                    {n.cta_label && n.cta_url && (
                      <span className="inline-block mt-2 text-[#FF690B] font-bold text-sm">{n.cta_label} →</span>
                    )}
                    {n.created_at && (
                      <p className="text-slate-300 text-xs mt-2">
                        {new Date(n.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function PrefRow({ label, hint, checked, onChange, locked }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        {locked && <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
        <span className="text-slate-700 font-semibold text-sm">{label}</span>
      </div>
      {locked ? (
        <span className="text-slate-400 text-xs font-semibold shrink-0">{hint}</span>
      ) : (
        <button
          type="button"
          onClick={() => onChange(!checked)}
          role="switch"
          aria-checked={checked}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${checked ? 'bg-[#FF690B]' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
      )}
    </div>
  );
}
