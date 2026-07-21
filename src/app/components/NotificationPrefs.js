'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// Preferencias de notificación del cliente (GET/PUT /api/v1/alerts/preferences,
// desplegado con la campana 9.5). Compartido por la sección de Alertas y por
// Ajustes para que ambos toquen las MISMAS preferencias. Las dos primeras
// categorías son fijas por diseño (cambios de plan y seguimiento).
export default function NotificationPrefs({ token }) {
  const [prefs, setPrefs] = useState({
    reminders_enabled: true,
    community_enabled: true,
    email_enabled: true,
    push_enabled: true,
  });

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/api/v1/alerts/preferences`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (data) setPrefs((p) => ({ ...p, ...data })); })
      .catch(() => { /* degradado: se quedan los defaults */ });
  }, [token]);

  const savePref = async (patch) => {
    setPrefs((p) => ({ ...p, ...patch }));
    try {
      await axios.put(`${API}/api/v1/alerts/preferences`, patch, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      toast.error('No se pudo guardar la preferencia');
    }
  };

  return (
    <div className="space-y-4">
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
