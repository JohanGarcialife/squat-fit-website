'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '@/stores/auth.store';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import esPhone from 'react-phone-input-2/lang/es.json';
import { getData as getCountryData } from 'country-list';
import {
  User,
  Target,
  Moon,
  Shield,
  CreditCard,
  LogOut,
  X,
  FileText,
  AlertTriangle,
  KeyRound,
  ChevronRight,
  Footprints,
  Dumbbell,
  Activity,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// --- País / teléfono ---------------------------------------------------------
const esPhoneLocalization = { ...esPhone, gb: 'Inglaterra' };

// Lista de países en español (nombres de la localización del teléfono), con
// España la primera para que sea la opción por defecto.
const COUNTRY_OPTIONS = (() => {
  const raw = getCountryData().map((c) => ({
    code: c.code,
    name: esPhone[c.code.toLowerCase()] || c.name,
  }));
  raw.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const es = raw.find((c) => c.code === 'ES');
  return [es, ...raw.filter((c) => c.code !== 'ES')].filter(Boolean);
})();

// --- Conversión de unidades --------------------------------------------------
const KG_PER_LB = 0.45359237;
const round1 = (n) => Math.round(n * 10) / 10;

const fmtWeight = (kg, unit) => {
  const n = parseFloat(kg);
  if (isNaN(n)) return '';
  const v = unit === 'kg' ? n : n / KG_PER_LB;
  return String(round1(v)).replace('.', ',');
};
const weightToKg = (raw, unit) => {
  const n = parseFloat(String(raw).replace(',', '.'));
  if (isNaN(n)) return '';
  return String(unit === 'kg' ? n : n * KG_PER_LB);
};

// --- Estilos compartidos de campo -------------------------------------------
const fieldLabel = 'text-slate-400 text-xs font-semibold uppercase tracking-wider';
const fieldInput =
  'w-full bg-transparent border-b border-slate-200 pb-1.5 text-[#363C98] font-bold text-base sm:text-lg focus:outline-none focus:border-[#FF690B] transition-colors placeholder:text-slate-300 placeholder:font-normal';

// --- Validación --------------------------------------------------------------
const ProfileSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es obligatorio'),
  apellidos: Yup.string().required('Los apellidos son obligatorios'),
  telefono: Yup.string().nullable(),
  email: Yup.string().email('Email inválido').required('El email es obligatorio'),
  fechaNacimiento: Yup.string().nullable(),
  sexo: Yup.string().nullable(),
  altura: Yup.string().nullable(),
  paisIdioma: Yup.string().nullable(),
  peso: Yup.string().nullable(),
  pesoObjetivo: Yup.string().nullable(),
  steps_peer_day_id: Yup.string().nullable(),
  strength_training_id: Yup.string().nullable(),
  weekly_cardio_frequency_id: Yup.string().nullable(),
  daily_activity_id: Yup.string().nullable(),
});

// --- Sub-componentes ---------------------------------------------------------

// Anillo de progreso del perfil.
const ProgressRing = ({ pct }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#FFE3CE" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="#FF690B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 32 32)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="15"
        fontWeight="800"
        fill="#FF690B"
      >
        {pct}%
      </text>
    </svg>
  );
};

// Interruptor de unidades (kg|lb, cm|ft).
const UnitToggle = ({ options, value, onChange }) => (
  <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
    {options.map((o) => (
      <button
        type="button"
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
          value === o.value ? 'bg-white text-[#FF690B] shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// Peso con unidad kg/lb y un decimal. Guarda siempre kg.
const WeightField = ({ label, valueKg, unit, onUnit, onChangeKg }) => {
  const [focused, setFocused] = useState(false);
  const [buffer, setBuffer] = useState('');
  const display = focused ? buffer : fmtWeight(valueKg, unit);
  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={fieldLabel}>{label}</span>
        <UnitToggle
          options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
          value={unit}
          onChange={onUnit}
        />
      </div>
      <div className="flex items-baseline gap-1.5 border-b border-slate-200 focus-within:border-[#FF690B] transition-colors pb-1.5">
        <input
          inputMode="decimal"
          value={display}
          onFocus={() => {
            setBuffer(fmtWeight(valueKg, unit));
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.,]/g, '');
            setBuffer(raw);
            onChangeKg(weightToKg(raw, unit));
          }}
          placeholder="0,0"
          className="w-full bg-transparent text-[#363C98] font-bold text-base sm:text-lg focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
        />
        <span className="text-slate-400 font-bold text-sm shrink-0">{unit}</span>
      </div>
    </div>
  );
};

// Altura en cm o pies+pulgadas. Guarda siempre cm.
const HeightField = ({ valueCm, unit, onUnit, onChangeCm }) => {
  const cm = parseFloat(valueCm);
  const hasCm = !isNaN(cm);
  const totIn = hasCm ? Math.round(cm / 2.54) : NaN;
  const feet = hasCm ? Math.floor(totIn / 12) : '';
  const inches = hasCm ? totIn % 12 : '';

  const setFromFtIn = (f, i) => {
    const ff = f === '' ? 0 : parseInt(f, 10) || 0;
    const ii = i === '' ? 0 : parseInt(i, 10) || 0;
    if (f === '' && i === '') {
      onChangeCm('');
      return;
    }
    onChangeCm(String(Math.round((ff * 12 + ii) * 2.54)));
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={fieldLabel}>Altura</span>
        <UnitToggle
          options={[{ value: 'cm', label: 'cm' }, { value: 'ft', label: 'ft/in' }]}
          value={unit}
          onChange={onUnit}
        />
      </div>
      {unit === 'cm' ? (
        <div className="flex items-baseline gap-1.5 border-b border-slate-200 focus-within:border-[#FF690B] transition-colors pb-1.5">
          <input
            inputMode="numeric"
            value={hasCm ? String(Math.round(cm)) : ''}
            onChange={(e) => onChangeCm(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="0"
            className="w-full bg-transparent text-[#363C98] font-bold text-base sm:text-lg focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
          />
          <span className="text-slate-400 font-bold text-sm shrink-0">cm</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-4">
          <div className="flex items-baseline gap-1.5 border-b border-slate-200 focus-within:border-[#FF690B] transition-colors pb-1.5 flex-1">
            <input
              inputMode="numeric"
              value={feet === '' ? '' : String(feet)}
              onChange={(e) => setFromFtIn(e.target.value.replace(/[^0-9]/g, ''), inches === '' ? '' : String(inches))}
              placeholder="0"
              className="w-full bg-transparent text-[#363C98] font-bold text-base sm:text-lg focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
            />
            <span className="text-slate-400 font-bold text-sm shrink-0">pies</span>
          </div>
          <div className="flex items-baseline gap-1.5 border-b border-slate-200 focus-within:border-[#FF690B] transition-colors pb-1.5 flex-1">
            <input
              inputMode="numeric"
              value={inches === '' ? '' : String(inches)}
              onChange={(e) => setFromFtIn(feet === '' ? '' : String(feet), e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="w-full bg-transparent text-[#363C98] font-bold text-base sm:text-lg focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
            />
            <span className="text-slate-400 font-bold text-sm shrink-0">pulg.</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Sexo como dos botones.
const SexButtons = ({ value, onChange }) => {
  const opts = [
    { v: 'Mujer', emoji: '♀' },
    { v: 'Hombre', emoji: '♂' },
  ];
  return (
    <div className="flex flex-col space-y-1.5">
      <span className={fieldLabel}>Sexo</span>
      <div className="flex gap-2">
        {opts.map((o) => (
          <button
            type="button"
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
              value === o.v
                ? 'border-[#FF690B] bg-[#FFF6F0] text-[#FF690B]'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <span className="text-base">{o.emoji}</span>
            {o.v}
          </button>
        ))}
      </div>
    </div>
  );
};

// Fila de Estilo de Vida (icono + etiqueta + selector).
const LifestyleRow = ({ icon: Icon, label, name, value, options, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-2.5 text-slate-500 font-semibold text-sm sm:text-base">
      <span className="bg-[#FFF6F0] p-1.5 rounded-lg text-[#FF690B]">
        <Icon className="w-4 h-4" />
      </span>
      {label}
    </span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-[#FF690B] font-bold text-sm w-40 sm:w-48 text-right focus:outline-none focus:border-[#FF690B] bg-white cursor-pointer"
    >
      <option value="">Selecciona…</option>
      {options.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

export default function ProfilePage() {
  const router = useRouter();
  const { logout, token } = useAuthStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPurchasesModalOpen, setIsPurchasesModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [stepsList, setStepsList] = useState([]);
  const [strengthList, setStrengthList] = useState([]);
  const [cardioList, setCardioList] = useState([]);
  const [activityList, setActivityList] = useState([]);

  // Unidades de visualización (no se persisten; el backend siempre en métrico).
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');

  // Historial de compras
  const [purchases, setPurchases] = useState([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      fechaNacimiento: '',
      sexo: '',
      altura: '',
      paisIdioma: '',
      peso: '',
      pesoObjetivo: '',
      steps_peer_day_id: '',
      strength_training_id: '',
      weekly_cardio_frequency_id: '',
      daily_activity_id: '',
    },
    validationSchema: ProfileSchema,
    onSubmit: async (values) => {
      if (!userId) return;
      try {
        let apiGender = '';
        if (values.sexo === 'Hombre') apiGender = 'male';
        else if (values.sexo === 'Mujer') apiGender = 'female';
        else if (values.sexo === 'Otro') apiGender = 'other';

        const cleanedHeight = values.altura ? String(values.altura).replace(/[^0-9]/g, '') : '';
        const cleanedWeight = values.peso ? String(values.peso).replace(/[^0-9.]/g, '') : '';
        const cleanedTargetWeight = values.pesoObjetivo ? String(values.pesoObjetivo).replace(/[^0-9.]/g, '') : '';

        const formData = new FormData();
        formData.append('firstName', values.nombre || '');
        formData.append('lastName', values.apellidos || '');
        if (values.fechaNacimiento) formData.append('birth', values.fechaNacimiento);
        formData.append('phone_number', values.telefono || '');
        if (apiGender) formData.append('gender', apiGender);
        formData.append('country', values.paisIdioma || '');
        if (cleanedHeight) formData.append('height', cleanedHeight);
        if (cleanedWeight) formData.append('weight', cleanedWeight);
        if (cleanedTargetWeight) formData.append('target_weight', cleanedTargetWeight);
        if (values.steps_peer_day_id) formData.append('steps_peer_day_id', values.steps_peer_day_id);
        if (values.strength_training_id) formData.append('strength_training_id', values.strength_training_id);
        if (values.weekly_cardio_frequency_id) formData.append('weekly_cardio_frequency_id', values.weekly_cardio_frequency_id);
        if (values.daily_activity_id) formData.append('daily_activity_id', values.daily_activity_id);

        await axios.put(`${API}/api/v1/user/update?user_id=${userId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Perfil actualizado correctamente');
        // Marca el formulario como limpio (oculta la barra de guardar).
        formik.resetForm({ values });
      } catch (error) {
        console.error('Error saving profile changes:', error);
        toast.error('Error al guardar los cambios en el perfil');
      }
    },
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const infoRes = await axios.get(`${API}/api/v1/user/info`, { headers });
        const info = infoRes.data;
        setUserId(info.id);

        try {
          const [stepsRes, strengthRes, cardioRes, activityRes] = await Promise.all([
            axios.get(`${API}/api/v1/user/steps-peer-day`, { headers }),
            axios.get(`${API}/api/v1/user/strength-training`, { headers }),
            axios.get(`${API}/api/v1/user/weekly_cardio_frequency`, { headers }),
            axios.get(`${API}/api/v1/user/daily-activity`, { headers }),
          ]);
          setStepsList(stepsRes.data || []);
          setStrengthList(strengthRes.data || []);
          setCardioList(cardioRes.data || []);
          setActivityList(activityRes.data || []);
        } catch (err) {
          console.error('Error fetching config lists:', err);
        }

        let displayGender = '';
        if (info.gender === 'male') displayGender = 'Hombre';
        else if (info.gender === 'female') displayGender = 'Mujer';
        else if (info.gender === 'other') displayGender = 'Otro';

        let birthDate = '';
        if (info.birth) birthDate = info.birth.split('T')[0];

        const loaded = {
          nombre: info.firstName || '',
          apellidos: info.lastName || '',
          telefono: info.phone_number || '',
          email: info.email || '',
          fechaNacimiento: birthDate,
          sexo: displayGender,
          altura: info.height || '',
          // España preseleccionada si el usuario aún no tiene país.
          paisIdioma: info.country || 'España',
          peso: info.weight || '',
          pesoObjetivo: info.target_weight || '',
          steps_peer_day_id: info.steps_peer_day_id || '',
          strength_training_id: info.strength_training_id || '',
          weekly_cardio_frequency_id: info.weekly_cardio_frequency_id || '',
          daily_activity_id: info.daily_activity_id || '',
        };
        // resetForm fija estos valores como "base": la barra de guardar solo
        // aparecerá cuando el usuario cambie algo.
        formik.resetForm({ values: loaded });

        try {
          const adviceRes = await axios.get(`${API}/api/v1/advice/by-user`, { headers });
          if (adviceRes.data) setAdvice(adviceRes.data);
        } catch (adviceErr) {
          console.log('User does not have an advice subscription or active coach', adviceErr);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast.error('Error al cargar la información del perfil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(`${API}/api/v1/user/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.purchases) setPurchases(response.data.purchases);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setIsLoadingPurchases(false);
      }
    };
    if (token) fetchPurchases();
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Preserva el país guardado aunque no esté en la lista estándar.
  const countryOptions = useMemo(() => {
    const cur = formik.values.paisIdioma;
    if (cur && !COUNTRY_OPTIONS.some((c) => c.name === cur)) {
      return [{ code: '_cur', name: cur }, ...COUNTRY_OPTIONS];
    }
    return COUNTRY_OPTIONS;
  }, [formik.values.paisIdioma]);

  // % de perfil completado sobre los campos reales.
  const completion = useMemo(() => {
    const v = formik.values;
    const fields = [
      v.nombre,
      v.apellidos,
      v.telefono,
      v.fechaNacimiento,
      v.sexo,
      v.altura,
      v.paisIdioma,
      v.peso,
      v.pesoObjetivo,
      v.steps_peer_day_id,
      v.strength_training_id,
      v.weekly_cardio_frequency_id,
      v.daily_activity_id,
    ];
    const filled = fields.filter((x) => x !== '' && x != null).length;
    return Math.round((filled / fields.length) * 100);
  }, [formik.values]);

  const firstName = formik.values.nombre || 'crack';

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF690B] mb-4"></div>
        <span className="text-slate-500 font-extrabold text-sm">Cargando perfil…</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-28">
        {/* --- CABECERA: PROGRESO DEL PERFIL --- */}
        <div className="bg-white rounded-3xl border-2 border-[#FF690B]/30 p-5 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-sm">
          <ProgressRing pct={completion} />
          <div className="flex-1 min-w-0">
            <h2 className="text-[#363C98] font-extrabold text-lg sm:text-2xl leading-tight">
              {completion >= 100 ? `¡Perfil completo, ${firstName}!` : `Perfil casi completo, ${firstName}`}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-0.5">
              {completion >= 100
                ? 'Tu coach tiene todo lo que necesita para ajustar tu plan.'
                : 'Completa tus datos para que tu coach pueda ajustar tu plan.'}
            </p>
          </div>
          {completion < 100 && (
            <button
              type="button"
              onClick={() => router.push('/onboarding')}
              className="shrink-0 bg-[#FF690B] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Completar
            </button>
          )}
        </div>

        {/* --- GRID PRINCIPAL --- */}
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============ COLUMNA IZQUIERDA (2/3) ============ */}
          <div className="lg:col-span-2 space-y-8">
            {/* --- INFORMACIÓN PERSONAL --- */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-[#363C98] font-extrabold text-xl">Información Personal</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {/* Nombre */}
                <div className="flex flex-col space-y-1.5">
                  <span className={fieldLabel}>Nombre</span>
                  <input
                    name="nombre"
                    type="text"
                    autoCapitalize="words"
                    onChange={formik.handleChange}
                    value={formik.values.nombre}
                    className={fieldInput}
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Apellidos */}
                <div className="flex flex-col space-y-1.5">
                  <span className={fieldLabel}>Apellidos</span>
                  <input
                    name="apellidos"
                    type="text"
                    autoCapitalize="words"
                    onChange={formik.handleChange}
                    value={formik.values.apellidos}
                    className={fieldInput}
                    placeholder="Tus apellidos"
                  />
                </div>

                {/* Email (solo lectura: no se modifica desde aquí) */}
                <div className="flex flex-col space-y-1.5">
                  <span className={fieldLabel}>Email</span>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-[#363C98] font-bold text-base sm:text-lg truncate">
                      {formik.values.email || '—'}
                    </span>
                    <span className="text-slate-300 text-2xs font-semibold uppercase tracking-wider shrink-0 ml-2">
                      Fijo
                    </span>
                  </div>
                </div>

                {/* Teléfono (selector de país → prefijo, España por defecto) */}
                <div className="flex flex-col space-y-1.5">
                  <span className={fieldLabel}>Teléfono</span>
                  <PhoneInput
                    country={'es'}
                    preferredCountries={['es', 'pt', 'gb', 'fr', 'mx', 'ar', 'co', 'cl']}
                    localization={esPhoneLocalization}
                    enableSearch
                    disableSearchIcon
                    searchPlaceholder="Buscar país…"
                    searchNotFound="Sin resultados"
                    value={formik.values.telefono}
                    onChange={(phone) => formik.setFieldValue('telefono', phone)}
                    inputClass="!w-full !border-0 !border-b !border-slate-200 !rounded-none !bg-transparent !pl-12 !pr-2 !py-1.5 !text-[#363C98] !font-bold !text-base !outline-none focus:!border-[#FF690B]"
                    containerClass="!w-full"
                    buttonClass="!bg-transparent !border-0 !pl-0"
                    dropdownClass="!rounded-xl !text-black !max-h-60"
                    searchClass="!text-black"
                    inputStyle={{ color: '#363C98' }}
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div className="flex flex-col space-y-1.5">
                  <span className={fieldLabel}>Fecha de nacimiento</span>
                  <input
                    name="fechaNacimiento"
                    type="date"
                    onChange={formik.handleChange}
                    value={formik.values.fechaNacimiento}
                    className={fieldInput}
                  />
                </div>

                {/* País */}
                <div className="flex flex-col space-y-1.5">
                  <span className={fieldLabel}>País</span>
                  <select
                    name="paisIdioma"
                    value={formik.values.paisIdioma}
                    onChange={formik.handleChange}
                    className={`${fieldInput} cursor-pointer`}
                  >
                    {countryOptions.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sexo (2 botones) */}
                <SexButtons value={formik.values.sexo} onChange={(v) => formik.setFieldValue('sexo', v)} />

                {/* Altura (cm / pies+pulgadas) */}
                <HeightField
                  valueCm={formik.values.altura}
                  unit={heightUnit}
                  onUnit={setHeightUnit}
                  onChangeCm={(cm) => formik.setFieldValue('altura', cm)}
                />

                {/* Peso actual (kg/lb) */}
                <WeightField
                  label="Peso actual"
                  valueKg={formik.values.peso}
                  unit={weightUnit}
                  onUnit={setWeightUnit}
                  onChangeKg={(kg) => formik.setFieldValue('peso', kg)}
                />

                {/* Peso objetivo (kg/lb, misma unidad) */}
                <WeightField
                  label="Peso objetivo"
                  valueKg={formik.values.pesoObjetivo}
                  unit={weightUnit}
                  onUnit={setWeightUnit}
                  onChangeKg={(kg) => formik.setFieldValue('pesoObjetivo', kg)}
                />
              </div>
            </div>
          </div>

          {/* ============ COLUMNA DERECHA (1/3) ============ */}
          <div className="space-y-8">
            {/* --- OBJETIVO ACTIVO --- */}
            {advice && (
              <div className="bg-[#FF690B] text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 text-left relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-white/20 pb-4">
                  <Target className="w-6 h-6" />
                  <h3 className="font-extrabold text-xl">Objetivo Activo</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {advice.training_goal_name && (
                    <div className="flex flex-col">
                      <span className="text-white/70 text-2xs font-extrabold uppercase tracking-widest">Meta</span>
                      <span className="font-extrabold text-lg sm:text-2xl mt-1 leading-tight">
                        {advice.training_goal_name}
                      </span>
                    </div>
                  )}
                  {advice.subtitle && (
                    <div className="flex flex-col items-end text-right">
                      <span className="text-white/70 text-2xs font-extrabold uppercase tracking-widest">Fase</span>
                      <span className="font-extrabold text-lg sm:text-2xl mt-1 leading-tight">{advice.subtitle}</span>
                    </div>
                  )}
                </div>

                {advice.adviser_firstName && (
                  <div className="bg-black/15 rounded-2xl p-4 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                      <div className="w-full h-full bg-[#363C98] flex items-center justify-center font-bold text-white text-xs">
                        {`${advice.adviser_firstName[0]}${advice.adviser_lastName ? advice.adviser_lastName[0] : ''}`.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-2xs font-bold uppercase tracking-wider">Coach Asignado</span>
                      <span className="font-extrabold text-sm sm:text-base">
                        {`${advice.adviser_firstName} ${advice.adviser_lastName || ''}`.trim()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- ESTILO DE VIDA --- */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
                  <Moon className="w-6 h-6" />
                </div>
                <h3 className="text-[#363C98] font-extrabold text-xl">Estilo de Vida</h3>
              </div>

              <div className="space-y-5">
                <LifestyleRow
                  icon={Footprints}
                  label="Pasos diarios"
                  name="steps_peer_day_id"
                  value={formik.values.steps_peer_day_id}
                  options={stepsList}
                  onChange={formik.handleChange}
                />
                <LifestyleRow
                  icon={Dumbbell}
                  label="Entreno de fuerza"
                  name="strength_training_id"
                  value={formik.values.strength_training_id}
                  options={strengthList}
                  onChange={formik.handleChange}
                />
                <LifestyleRow
                  icon={Activity}
                  label="Frecuencia de cardio"
                  name="weekly_cardio_frequency_id"
                  value={formik.values.weekly_cardio_frequency_id}
                  options={cardioList}
                  onChange={formik.handleChange}
                />
                <LifestyleRow
                  icon={Zap}
                  label="Actividad diaria"
                  name="daily_activity_id"
                  value={formik.values.daily_activity_id}
                  options={activityList}
                  onChange={formik.handleChange}
                />
              </div>
            </div>

            {/* --- PRIVACIDAD --- */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2 text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-2">
                <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-[#363C98] font-extrabold text-lg">Privacidad</h3>
              </div>

              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition-all text-[#363C98] font-bold text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  Cambiar contraseña
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all text-red-500 font-bold text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </span>
              </button>
            </div>

            {/* --- MI PLAN --- */}
            {advice && (advice.suscription_name || advice.title) && (
              <div className="bg-[#363C98]/5 border border-[#363C98]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
                <div className="flex items-center gap-3 border-b border-[#363C98]/10 pb-4">
                  <div className="bg-[#363C98]/10 p-2.5 rounded-2xl text-[#363C98]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-[#363C98] font-extrabold text-xl">Mi Plan</h3>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#363C98]/5 space-y-4">
                  <div className="flex items-center justify-between">
                    {advice.suscription_name && (
                      <span className="text-[#FF690B] font-extrabold text-sm uppercase tracking-wide">
                        {advice.suscription_name}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        advice.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {advice.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>

                  {advice.title && (
                    <h4 className="text-[#363C98] font-extrabold text-lg leading-tight">{advice.title}</h4>
                  )}

                  {advice.date_expiration && (
                    <p className="text-slate-400 text-xs font-semibold">
                      Próxima renovación:{' '}
                      {new Date(advice.date_expiration).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  )}

                  {purchases && purchases.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsPurchasesModalOpen(true)}
                      className="w-full border border-[#FF690B] text-[#FF690B] font-bold py-2.5 rounded-xl hover:bg-[#FF690B]/5 active:scale-95 transition-all text-sm text-center cursor-pointer"
                    >
                      Ver historial
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Historial suelto si no hay plan activo pero sí compras */}
            {(!advice || (!advice.suscription_name && !advice.title)) && purchases && purchases.length > 0 && (
              <button
                type="button"
                onClick={() => setIsPurchasesModalOpen(true)}
                className="w-full bg-white border border-slate-100 shadow-sm rounded-3xl p-5 flex items-center justify-between text-[#363C98] font-bold text-sm hover:border-[#FF690B]/30 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#FF690B]" />
                  Ver historial de compras
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        </form>

        {/* --- BARRA DE GUARDAR (solo si hay cambios) --- */}
        {formik.dirty && (
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-100 p-4 sm:px-8 flex items-center justify-end gap-4 shadow-2xl z-40 animate-fade-in">
            <span className="mr-auto hidden sm:block text-slate-400 text-sm font-semibold">Tienes cambios sin guardar</span>
            <button
              type="button"
              onClick={() => formik.resetForm()}
              className="text-slate-500 hover:text-slate-800 font-bold text-sm sm:text-base px-4 py-2 hover:underline cursor-pointer"
            >
              Cancelar cambios
            </button>
            <button
              type="button"
              onClick={formik.handleSubmit}
              disabled={formik.isSubmitting}
              className="bg-[#FF690B] text-white font-bold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all text-sm sm:text-base shadow-md hover:shadow-[#FF690B]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {formik.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {/* ============ MODAL: HISTORIAL DE COMPRAS ============ */}
      {isPurchasesModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F8F9FC]">
              <div className="flex items-center gap-2 text-[#363C98]">
                <FileText className="w-5 h-5" />
                <h3 className="font-extrabold text-lg sm:text-xl">Historial de Transacciones</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchasesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoadingPurchases ? (
                <div className="flex flex-col justify-center items-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF690B]"></div>
                  <span className="text-slate-400 text-xs font-semibold">Cargando transacciones…</span>
                </div>
              ) : purchases.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-slate-300" />
                  <span>Aún no tienes compras registradas en tu cuenta.</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[#363C98] border-b border-slate-100">
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Fecha</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Producto</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Referencia</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.purchase_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-500 text-sm font-semibold">
                            {new Date(purchase.date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-4 text-[#363C98] text-sm font-bold">{purchase.name}</td>
                          <td className="p-4 text-slate-400 font-mono text-2xs truncate max-w-[120px]">
                            {purchase.purchase_id || '-'}
                          </td>
                          <td className="p-4 text-[#FF690B] font-bold text-sm text-right">
                            €{Number(purchase.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPurchasesModalOpen(false)}
                className="bg-[#363C98] text-white font-bold px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />
    </div>
  );
}
