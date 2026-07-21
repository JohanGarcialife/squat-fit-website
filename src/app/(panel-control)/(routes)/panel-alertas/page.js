'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import AccessNotice from '@/app/components/AccessNotice';
import { handleApiError } from '@/app/components/handleApiError';
import NotificationPrefs from '@/app/components/NotificationPrefs';
import {
  Bell,
  TrendingUp,
  AlertTriangle,
  Users,
  Award,
  Sliders,
  CheckCheck,
  CalendarCheck,
  Activity,
} from 'lucide-react';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';
const CARD = 'bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm';

// Semáforo del motor de hábitos (GET /api/v1/habits/state): color y emoji por
// estado. Las etiquetas («Progreso óptimo»…) llegan del backend.
const SEMAPHORE_STYLE = {
  green: { color: '#10B981', soft: '#ECFDF5', emoji: '🟢' },
  yellow: { color: '#F59E0B', soft: '#FFFBEB', emoji: '🟡' },
  orange: { color: '#F97316', soft: '#FFF7ED', emoji: '🟠' },
  red: { color: '#EF4444', soft: '#FEF2F2', emoji: '🔴' },
};

// '2026-W29' → 'S29' (etiqueta corta del histórico).
function weekLabel(weekId) {
  const m = /W(\d+)/i.exec(String(weekId || ''));
  return m ? `S${m[1]}` : String(weekId || '');
}

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
  // Estado del motor de hábitos (semáforo, hábitos activos, histórico 12
  // semanas). null = endpoint caído → la sección no se pinta (degradado).
  const [habits, setHabits] = useState(null);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    // Sin sesión no cargamos nada: el render muestra el aviso de acceso.
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [st, list, hb] = await Promise.allSettled([
          axios.get(`${API}/api/v1/alerts/state`, { headers }),
          axios.get(`${API}/api/v1/alerts`, { headers }),
          axios.get(`${API}/api/v1/habits/state`, { headers }),
        ]);
        // Token caducado (401 en cualquiera) → re-login en vez de "0 días".
        const unauth = [st, list, hb].find(
          (r) => r.status === 'rejected' && r.reason?.response?.status === 401
        );
        if (unauth && handleApiError(unauth.reason, '/panel-alertas')) return;
        if (st.status === 'fulfilled') setState(st.value.data);
        if (list.status === 'fulfilled' && Array.isArray(list.value.data)) setItems(list.value.data);
        if (hb.status === 'fulfilled' && hb.value.data) setHabits(hb.value.data);
      } catch (e) { /* degradado */ }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Desactivar/activar un hábito (PUT /habits/:id). Desactivar aplica un
  // cooldown de 7 días en el motor; los fijos (locked) no se pueden tocar.
  const toggleHabit = async (habit) => {
    if (habit.type === 'locked') return;
    const enabled = !habit.enabled;
    setHabits((h) => h && {
      ...h,
      active_habits: h.active_habits.map((x) => (x.id === habit.id ? { ...x, enabled } : x)),
    });
    try {
      await axios.put(`${API}/api/v1/habits/${habit.id}`, { enabled }, { headers: { Authorization: `Bearer ${token}` } });
      if (!enabled) toast('Hábito pausado: el motor no lo reactivará en 7 días.', { icon: '⏸️' });
    } catch (e) {
      toast.error('No se pudo actualizar el hábito');
    }
  };

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

  if (!token) return <AccessNotice redirect="/panel-alertas" />;
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
            <NotificationPrefs token={token} />
          </div>
        )}

        {/* ===== Motor de hábitos: semáforo semanal ===== */}
        {habits && habits.semaphore && (
          <div className={CARD + ' space-y-5'}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: (SEMAPHORE_STYLE[habits.semaphore] || SEMAPHORE_STYLE.yellow).soft }}
                >
                  {(SEMAPHORE_STYLE[habits.semaphore] || SEMAPHORE_STYLE.yellow).emoji}
                </span>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tu semana {weekLabel(habits.week_id)}</p>
                  <h3
                    className="font-extrabold text-xl leading-tight"
                    style={{ color: (SEMAPHORE_STYLE[habits.semaphore] || SEMAPHORE_STYLE.yellow).color }}
                  >
                    {habits.semaphore_label}
                  </h3>
                </div>
              </div>
              {habits.scores && (
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-[#363C98] leading-none">
                    {Number(habits.scores.total).toFixed(1).replace('.', ',')}<span className="text-slate-300 text-lg font-bold"> / 5</span>
                  </p>
                  <p className="text-slate-400 text-xs font-semibold mt-1">puntuación global</p>
                </div>
              )}
            </div>

            {habits.scores && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Adherencia', habits.scores.adherence],
                  ['Recuperación', habits.scores.recovery],
                  ['Estrés', habits.scores.stress],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#F8F9FC] rounded-2xl p-3 text-center">
                    <p className="text-[#363C98] font-extrabold text-lg leading-none">{Number(value).toFixed(1).replace('.', ',')}</p>
                    <p className="text-slate-400 text-[11px] font-semibold mt-1 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(habits.suggested_actions) && habits.suggested_actions.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Qué te recomendamos</p>
                <ul className="space-y-1.5">
                  {habits.suggested_actions.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-slate-600 font-semibold">
                      <span className="text-[#FF690B] mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(habits.decisions) && habits.decisions.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Ajustes de esta semana</p>
                {habits.decisions.filter((d) => d.message).map((d, i) => (
                  <p key={i} className="text-sm text-slate-600 leading-snug">{d.message}</p>
                ))}
              </div>
            )}

            {/* Histórico de las últimas 12 semanas (barras 1–5 con su semáforo) */}
            {Array.isArray(habits.history) && habits.history.length > 1 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Tus últimas {habits.history.length} semanas</p>
                <div className="flex items-end gap-1.5 h-20">
                  {[...habits.history].reverse().map((w) => {
                    const style = SEMAPHORE_STYLE[w.semaphore] || SEMAPHORE_STYLE.yellow;
                    const total = Number(w.score_total) || 0;
                    return (
                      <div key={w.week_id} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${weekLabel(w.week_id)}: ${total.toFixed(1)} / 5`}>
                        <div
                          className="w-full rounded-t-md"
                          style={{ background: style.color, height: `${Math.max(8, (total / 5) * 100)}%` }}
                        />
                        <span className="text-[9px] font-semibold text-slate-300 truncate">{weekLabel(w.week_id)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href="/formulario/seguimiento-semanal"
              className="w-full flex items-center justify-center gap-2 bg-[#363C98] hover:bg-[#2c317c] text-white font-bold py-3.5 rounded-2xl transition-colors"
            >
              <CalendarCheck className="w-5 h-5" /> Actualizar mi seguimiento semanal
            </Link>
          </div>
        )}

        {/* Motor de hábitos sin datos todavía: invitar al primer check-in */}
        {habits && !habits.semaphore && (
          <div className={CARD + ' text-center py-10'}>
            <Activity className="w-10 h-10 text-[#FF690B] mx-auto mb-3" />
            <h3 className="text-[#363C98] font-extrabold text-lg mb-1">Aún no tienes seguimiento semanal</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-5">
              Responde el check-in de 2 minutos y aquí verás tu semáforo de progreso, tus hábitos y tu histórico.
            </p>
            <Link
              href="/formulario/seguimiento-semanal"
              className="inline-flex items-center gap-2 bg-[#FF690B] hover:bg-[#e55e0a] text-white font-bold py-3 px-6 rounded-2xl transition-colors"
            >
              <CalendarCheck className="w-5 h-5" /> Hacer mi primer check-in
            </Link>
          </div>
        )}

        {/* ===== Hábitos activos ===== */}
        {habits && Array.isArray(habits.active_habits) && habits.active_habits.length > 0 && (
          <div className={CARD + ' space-y-4'}>
            <div>
              <h3 className="text-[#363C98] font-extrabold text-lg">Tus hábitos de esta semana</h3>
              <p className="text-slate-400 text-sm">Los fijos forman parte de tu plan; el resto puedes pausarlos.</p>
            </div>
            <div className="space-y-3">
              {habits.active_habits.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-4">
                  <span className="text-slate-700 font-semibold text-sm min-w-0">{h.label}</span>
                  {h.type === 'locked' ? (
                    <span className="text-slate-400 text-xs font-semibold shrink-0">Fijo</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleHabit(h)}
                      role="switch"
                      aria-checked={h.enabled}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${h.enabled ? 'bg-[#FF690B]' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${h.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                  )}
                </div>
              ))}
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
