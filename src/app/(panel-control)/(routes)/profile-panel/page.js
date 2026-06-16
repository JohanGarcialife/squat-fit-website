'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '@/stores/auth.store';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import axios from 'axios';
import {
  User,
  Pencil,
  Target,
  Moon,
  Shield,
  CreditCard,
  LogOut,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- Validation Schema ---
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
  daily_activity_id: Yup.string().nullable()
});

export default function ProfilePage() {
  const router = useRouter();
  const { logout, token } = useAuthStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPurchasesModalOpen, setIsPurchasesModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [stepsList, setStepsList] = useState([]);
  const [strengthList, setStrengthList] = useState([]);
  const [cardioList, setCardioList] = useState([]);
  const [activityList, setActivityList] = useState([]);

  // Purchases history integration
  const [purchases, setPurchases] = useState([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch user info
        const infoRes = await axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/info', { headers });
        const info = infoRes.data;
        setUserId(info.id);

        // Fetch config lists in parallel
        try {
          const [stepsRes, strengthRes, cardioRes, activityRes] = await Promise.all([
            axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/steps-peer-day', { headers }),
            axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/strength-training', { headers }),
            axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/weekly_cardio_frequency', { headers }),
            axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/daily-activity', { headers })
          ]);
          setStepsList(stepsRes.data || []);
          setStrengthList(strengthRes.data || []);
          setCardioList(cardioRes.data || []);
          setActivityList(activityRes.data || []);
        } catch (err) {
          console.error('Error fetching config lists:', err);
        }

        // Map gender to Spanish label
        let displayGender = '';
        if (info.gender === 'male') displayGender = 'Hombre';
        else if (info.gender === 'female') displayGender = 'Mujer';
        else if (info.gender === 'other') displayGender = 'Otro';

        // Format birth date to YYYY-MM-DD
        let birthDate = '';
        if (info.birth) {
          birthDate = info.birth.split('T')[0]; // Extract YYYY-MM-DD
        }

        // Set Formik values
        formik.setValues({
          nombre: info.firstName || '',
          apellidos: info.lastName || '',
          telefono: info.phone_number || '',
          email: info.email || '',
          fechaNacimiento: birthDate,
          sexo: displayGender,
          altura: info.height || '',
          paisIdioma: info.country || '',
          peso: info.weight || '',
          pesoObjetivo: info.target_weight || '',
          steps_peer_day_id: info.steps_peer_day_id || '',
          strength_training_id: info.strength_training_id || '',
          weekly_cardio_frequency_id: info.weekly_cardio_frequency_id || '',
          daily_activity_id: info.daily_activity_id || ''
        });

        // Fetch advice info
        try {
          const adviceRes = await axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/advice/by-user', { headers });
          if (adviceRes.data) {
            setAdvice(adviceRes.data);
          }
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
  }, [token, router]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/purchases', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.purchases) {
          setPurchases(response.data.purchases);
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setIsLoadingPurchases(false);
      }
    };

    if (token) fetchPurchases();
  }, [token]);

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
      daily_activity_id: ''
    },
    validationSchema: ProfileSchema,
    onSubmit: async (values) => {
      if (!userId) return;
      try {
        // Map Spanish gender label back to English backend enum
        let apiGender = '';
        if (values.sexo === 'Hombre') apiGender = 'male';
        else if (values.sexo === 'Mujer') apiGender = 'female';
        else if (values.sexo === 'Otro') apiGender = 'other';

        // Clean height and weights (keep only numbers)
        const cleanedHeight = values.altura ? String(values.altura).replace(/[^0-9]/g, '') : '';
        const cleanedWeight = values.peso ? String(values.peso).replace(/[^0-9.]/g, '') : '';
        const cleanedTargetWeight = values.pesoObjetivo ? String(values.pesoObjetivo).replace(/[^0-9.]/g, '') : '';

        // Create FormData payload for multipart/form-data
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

        await axios.put(`https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/update?user_id=${userId}`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        toast.success('Perfil actualizado correctamente');
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving profile changes:', error);
        toast.error('Error al guardar los cambios en el perfil');
      }
    },
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Helper for formatting date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getStepsName = (id) => stepsList.find(item => item.id === id)?.name || '';
  const getStrengthName = (id) => strengthList.find(item => item.id === id)?.name || '';
  const getCardioName = (id) => cardioList.find(item => item.id === id)?.name || '';
  const getActivityName = (id) => activityList.find(item => item.id === id)?.name || '';

  const hasLifestyleData = 
    formik.values.steps_peer_day_id ||
    formik.values.strength_training_id ||
    formik.values.weekly_cardio_frequency_id ||
    formik.values.daily_activity_id;

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF690B] mb-4"></div>
        <span className="text-slate-500 font-extrabold text-sm">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-24">
        
        {/* --- GRID PRINCIPAL --- */}
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= COLUMNA IZQUIERDA (2/3) ================= */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- TARJETA 1: INFORMACIÓN PERSONAL --- */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-[#363C98] font-extrabold text-xl">
                    Información Personal
                  </h3>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-[#FF690B] font-bold text-sm hover:underline cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <span className="text-xs bg-[#FFF6F0] text-[#FF690B] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Modo Edición
                  </span>
                )}
              </div>

              {/* Grid de campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Nombre y Apellidos */}
                {(isEditing || (formik.values.nombre || formik.values.apellidos)) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Nombre y Apellidos
                    </span>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          name="nombre"
                          type="text"
                          onChange={formik.handleChange}
                          value={formik.values.nombre}
                          className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-1/2 focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                          placeholder="Nombre"
                        />
                        <input
                          name="apellidos"
                          type="text"
                          onChange={formik.handleChange}
                          value={formik.values.apellidos}
                          className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-1/2 focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                          placeholder="Apellidos"
                        />
                      </div>
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.nombre} {formik.values.apellidos}
                      </span>
                    )}
                  </div>
                )}

                {/* Email */}
                {(isEditing || formik.values.email) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Email
                    </span>
                    {isEditing ? (
                      <input
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                        placeholder="Email"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.email}
                      </span>
                    )}
                  </div>
                )}

                {/* Teléfono */}
                {(isEditing || formik.values.telefono) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Teléfono
                    </span>
                    {isEditing ? (
                      <input
                        name="telefono"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.telefono}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                        placeholder="Teléfono"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.telefono}
                      </span>
                    )}
                  </div>
                )}

                {/* Fecha de nacimiento */}
                {(isEditing || formik.values.fechaNacimiento) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Fecha de nacimiento
                    </span>
                    {isEditing ? (
                      <input
                        name="fechaNacimiento"
                        type="date"
                        onChange={formik.handleChange}
                        value={formik.values.fechaNacimiento}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formatDateForDisplay(formik.values.fechaNacimiento)}
                      </span>
                    )}
                  </div>
                )}

                {/* Sexo */}
                {(isEditing || formik.values.sexo) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Sexo
                    </span>
                    {isEditing ? (
                      <select
                        name="sexo"
                        onChange={formik.handleChange}
                        value={formik.values.sexo}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B] bg-white"
                      >
                        <option value="">Selecciona sexo</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Otro">Otro</option>
                      </select>
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.sexo}
                      </span>
                    )}
                  </div>
                )}

                {/* Altura */}
                {(isEditing || formik.values.altura) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Altura
                    </span>
                    {isEditing ? (
                      <input
                        name="altura"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.altura}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                        placeholder="Altura (ej: 170)"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.altura.includes('cm') ? formik.values.altura : `${formik.values.altura} cm`}
                      </span>
                    )}
                  </div>
                )}

                {/* País / Idioma */}
                {(isEditing || formik.values.paisIdioma) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      País
                    </span>
                    {isEditing ? (
                      <input
                        name="paisIdioma"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.paisIdioma}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                        placeholder="País"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.paisIdioma}
                      </span>
                    )}
                  </div>
                )}

                {/* Peso Actual */}
                {(isEditing || formik.values.peso) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Peso Actual
                    </span>
                    {isEditing ? (
                      <input
                        name="peso"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.peso}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                        placeholder="Peso en kg (ej: 70)"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.peso.includes('kg') ? formik.values.peso : `${formik.values.peso} kg`}
                      </span>
                    )}
                  </div>
                )}

                {/* Peso Objetivo */}
                {(isEditing || formik.values.pesoObjetivo) && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Peso Objetivo
                    </span>
                    {isEditing ? (
                      <input
                        name="pesoObjetivo"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.pesoObjetivo}
                        className="border border-[#FF690B] rounded-xl px-3 py-1.5 text-slate-800 font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#FF690B]"
                        placeholder="Peso objetivo en kg (ej: 65)"
                      />
                    ) : (
                      <span className="text-[#363C98] font-extrabold text-base sm:text-lg">
                        {formik.values.pesoObjetivo.includes('kg') ? formik.values.pesoObjetivo : `${formik.values.pesoObjetivo} kg`}
                      </span>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ================= COLUMNA DERECHA (1/3) ================= */}
          <div className="space-y-8">
            
            {/* --- WIDGET 1: OBJETIVO ACTIVO --- */}
            {advice && (
              <div className="bg-[#FF690B] text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 text-left relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-white/20 pb-4">
                  <Target className="w-6 h-6" />
                  <h3 className="font-extrabold text-xl">Objetivo Activo</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {advice.training_goal_name && (
                    <div className="flex flex-col">
                      <span className="text-white/70 text-2xs font-extrabold uppercase tracking-widest">
                        Meta
                      </span>
                      <span className="font-extrabold text-lg sm:text-2xl mt-1 leading-tight">
                        {advice.training_goal_name}
                      </span>
                    </div>
                  )}
                  
                  {advice.subtitle && (
                    <div className="flex flex-col items-end text-right">
                      <span className="text-white/70 text-2xs font-extrabold uppercase tracking-widest">
                        Fase
                      </span>
                      <span className="font-extrabold text-lg sm:text-2xl mt-1 leading-tight">
                        {advice.subtitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Coach card embedded */}
                {advice.adviser_firstName && (
                  <div className="bg-black/15 rounded-2xl p-4 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                      <div className="w-full h-full bg-[#363C98] flex items-center justify-center font-bold text-white text-xs">
                        {`${advice.adviser_firstName[0]}${advice.adviser_lastName ? advice.adviser_lastName[0] : ''}`.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-2xs font-bold uppercase tracking-wider">
                        Coach Asignado
                      </span>
                      <span className="font-extrabold text-sm sm:text-base">
                        {`${advice.adviser_firstName} ${advice.adviser_lastName || ''}`.trim()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- WIDGET 2: ESTILO DE VIDA --- */}
            {(isEditing || hasLifestyleData) && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-left">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
                    <Moon className="w-6 h-6" />
                  </div>
                  <h3 className="text-[#363C98] font-extrabold text-xl">
                    Estilo de Vida
                  </h3>
                </div>

                <div className="space-y-4">
                  
                  {/* Pasos Diarios */}
                  {(isEditing || formik.values.steps_peer_day_id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold text-sm sm:text-base">
                        🚶 Pasos Diarios
                      </span>
                      {isEditing ? (
                        <select
                          name="steps_peer_day_id"
                          onChange={formik.handleChange}
                          value={formik.values.steps_peer_day_id}
                          className="border border-[#FF690B] rounded-xl px-2 py-1 text-[#FF690B] font-extrabold text-sm w-48 text-right focus:outline-none bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {stepsList.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#FF690B] font-extrabold text-base sm:text-lg">
                          {getStepsName(formik.values.steps_peer_day_id)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Entrenamiento de Fuerza */}
                  {(isEditing || formik.values.strength_training_id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold text-sm sm:text-base">
                        💪 Entreno de Fuerza
                      </span>
                      {isEditing ? (
                        <select
                          name="strength_training_id"
                          onChange={formik.handleChange}
                          value={formik.values.strength_training_id}
                          className="border border-[#FF690B] rounded-xl px-2 py-1 text-[#FF690B] font-extrabold text-sm w-48 text-right focus:outline-none bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {strengthList.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#FF690B] font-extrabold text-base sm:text-lg">
                          {getStrengthName(formik.values.strength_training_id)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Frecuencia de Cardio */}
                  {(isEditing || formik.values.weekly_cardio_frequency_id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold text-sm sm:text-base">
                        🏃 Frecuencia de Cardio
                      </span>
                      {isEditing ? (
                        <select
                          name="weekly_cardio_frequency_id"
                          onChange={formik.handleChange}
                          value={formik.values.weekly_cardio_frequency_id}
                          className="border border-[#FF690B] rounded-xl px-2 py-1 text-[#FF690B] font-extrabold text-sm w-48 text-right focus:outline-none bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {cardioList.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#FF690B] font-extrabold text-base sm:text-lg">
                          {getCardioName(formik.values.weekly_cardio_frequency_id)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actividad Diaria */}
                  {(isEditing || formik.values.daily_activity_id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold text-sm sm:text-base">
                        ⚡ Actividad Diaria
                      </span>
                      {isEditing ? (
                        <select
                          name="daily_activity_id"
                          onChange={formik.handleChange}
                          value={formik.values.daily_activity_id}
                          className="border border-[#FF690B] rounded-xl px-2 py-1 text-[#FF690B] font-extrabold text-sm w-48 text-right focus:outline-none bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {activityList.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#FF690B] font-extrabold text-base sm:text-lg">
                          {getActivityName(formik.values.daily_activity_id)}
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* --- WIDGET 3: PRIVACIDAD --- */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3 text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-2">
                <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-[#363C98] font-extrabold text-lg">
                  Privacidad
                </h3>
              </div>

              {/* Cerrar Sesión */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all text-red-500 font-bold text-sm cursor-pointer"
              >
                <span>Cerrar Sesión</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* --- WIDGET 4: MI PLAN (SUBSCRIPTION) --- */}
            {advice && (advice.suscription_name || advice.title) && (
              <div className="bg-[#363C98]/5 border border-[#363C98]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
                <div className="flex items-center gap-3 border-b border-[#363C98]/10 pb-4">
                  <div className="bg-[#363C98]/10 p-2.5 rounded-2xl text-[#363C98]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-[#363C98] font-extrabold text-xl">
                    Mi Plan
                  </h3>
                </div>

                {/* Subscription details card */}
                <div className="bg-white rounded-2xl p-5 border border-[#363C98]/5 space-y-4">
                  <div className="flex items-center justify-between">
                    {advice.suscription_name && (
                      <span className="text-[#FF690B] font-extrabold text-sm uppercase tracking-wide">
                        {advice.suscription_name}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${advice.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {advice.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  
                  {advice.title && (
                    <h4 className="text-[#363C98] font-extrabold text-lg leading-tight">
                      {advice.title}
                    </h4>
                  )}
                  
                  {advice.date_expiration && (
                    <p className="text-slate-400 text-xs font-semibold">
                      Próxima renovación: {new Date(advice.date_expiration).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  )}

                  {/* Ver Historial button */}
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

          </div>

        </form>

        {/* --- FOOTER ACTION BUTTONS (MODO EDICIÓN) --- */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-100 p-4 sm:px-8 flex items-center justify-end gap-4 shadow-2xl z-40 animate-fade-in">
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                setIsEditing(false);
              }}
              className="text-slate-500 hover:text-slate-800 font-bold text-sm sm:text-base px-4 py-2 hover:underline cursor-pointer"
            >
              Cancelar Cambios
            </button>
            <button
              type="button"
              onClick={formik.handleSubmit}
              className="bg-[#FF690B] text-white font-bold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all text-sm sm:text-base shadow-md hover:shadow-[#FF690B]/20 cursor-pointer"
            >
              Guardar Preferencias
            </button>
          </div>
        )}

      </div>

      {/* ================= MODAL: HISTORIAL DE COMPRAS ================= */}
      {isPurchasesModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F8F9FC]">
              <div className="flex items-center gap-2 text-[#363C98]">
                <FileText className="w-5 h-5" />
                <h3 className="font-extrabold text-lg sm:text-xl">
                  Historial de Transacciones
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchasesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoadingPurchases ? (
                <div className="flex flex-col justify-center items-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF690B]"></div>
                  <span className="text-slate-400 text-xs font-semibold">Cargando transacciones...</span>
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
                            {new Date(purchase.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-[#363C98] text-sm font-bold">
                            {purchase.name}
                          </td>
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

            {/* Modal Footer */}
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

      {/* Confirmation Logout Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />

    </div>
  );
}
