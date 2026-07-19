// Definiciones de los formularios del dashboard (14.1–14.3), transcritas de
// los docx de la carpeta Formularios (Drive): «Evaluación inicial»,
// «Seguimiento semanal» y «Revisión mensual». Cada pregunta respeta el TIPO
// indicado en el docx (opción única, casillas, numérica, párrafo…).
//
// El «Seguimiento semanal» usa las claves estables de habit_engine_config.json
// (weekly_*) para alimentar el motor de hábitos/Alertas.

const SI_NO = ['Sí', 'No'];

// Follow-up condicional: "(Si responde SÍ, mostrar campo: …)"
const followUp = (key, title, phase, onValue = 'Sí') => ({
  type: 'text', key: `${key}_detalle`, title, phase,
  showIf: (a) => a[key] === onValue,
});

/* ===================== 14.1 EVALUACIÓN INICIAL ===================== */

const EV = 'evaluacion-inicial';
const evPhases = ['Objetivo', 'Tu dieta', 'Aspectos clínicos', 'Tus hábitos', 'Tu descanso', 'Tu organización', 'Tu cocina', 'Tu alimentación', 'Tus costumbres', 'Tu dieta reciente', 'Suplementación', 'Para mujeres', 'Recuerdo de 24 h', 'Actividad física', 'Nivel de actividad', 'Tus analíticas', 'Entreno de fuerza', 'Tus preferencias', 'Medidas', 'Consentimiento'];

const evaluacionInicial = {
  slug: EV,
  title: 'Evaluación inicial',
  phases: evPhases,
  steps: [
    {
      type: 'intro', title: 'Evaluación inicial',
      body: 'Rellena las preguntas para poder adaptar el proceso a ti.\n\nNo es un examen, así que responde con sinceridad.',
    },
    { type: 'radio', key: 'objetivo_fisico', phase: 'Objetivo', title: 'Objetivo físico principal', subtitle: 'Selecciona una sola opción', options: ['Perder grasa', 'Ganar masa muscular', 'Ambas'] },

    // Paso 1: Tu dieta
    { type: 'radio', key: 'comidas_dia', phase: 'Tu dieta', title: 'Comidas al día que quieres realizar', options: ['3 comidas', '4 comidas', '5 comidas'] },
    { type: 'radio', key: 'snacks', phase: 'Tu dieta', title: '¿Necesitas snacks entre comidas?', options: SI_NO, allowOther: true },
    { type: 'radio', key: 'comidas_rapidas', phase: 'Tu dieta', title: '¿Necesitas comidas de rápido consumo?', subtitle: 'Ej: batidos, sándwiches, etc', options: SI_NO },
    { type: 'radio', key: 'agua_diaria', phase: 'Tu dieta', title: 'Cantidad de agua consumida', options: ['Menos de 1 Litro', 'De 1 a 2 Litros', 'De 3 a 4 Litros', 'Más de 4 Litros'] },
    { type: 'text', key: 'supermercado_1', phase: 'Tu dieta', title: 'Supermercado donde haces la compra' },
    { type: 'text', key: 'supermercado_2', phase: 'Tu dieta', title: 'Segundo supermercado habitual', optional: true },

    // Paso 2: Aspectos clínicos
    { type: 'radio', key: 'alergias', phase: 'Aspectos clínicos', title: 'Alergias o intolerancias', options: ['Sí tengo', 'No tengo'], allowOther: true },
    followUp('alergias', 'Sobre tus alergias o intolerancias, ¿dime cuáles?', 'Aspectos clínicos', 'Sí tengo'),
    { type: 'radio', key: 'tca', phase: 'Aspectos clínicos', title: '¿Has tenido algún TCA?', options: SI_NO, allowOther: true },
    followUp('tca', 'Sobre el TCA, ¿dime cuál?', 'Aspectos clínicos'),
    { type: 'radio', key: 'exposicion_solar', phase: 'Aspectos clínicos', title: 'Tiempo de exposición solar diario', subtitle: 'Sol directo y > 40% del cuerpo descubierto', options: ['Menos de 10 min', 'De 15 a 20 min', 'De 25 a 30 min', 'Más de 35 min'], allowOther: true },
    { type: 'scale', key: 'estres_diario', phase: 'Aspectos clínicos', title: 'Nivel de estrés diario', options: ['Estrés incapacitante', 'Estrés alto', 'Estrés moderado', 'Estrés bajo', 'Sin estrés'] },

    // Paso 3: Tus hábitos
    { type: 'radio', key: 'fumador', phase: 'Tus hábitos', title: '¿Eres fumador?', options: SI_NO, allowOther: true },
    followUp('fumador', 'Indica la frecuencia por día', 'Tus hábitos'),
    { type: 'radio', key: 'alcohol', phase: 'Tus hábitos', title: '¿Consumes alcohol?', options: SI_NO, allowOther: true },
    followUp('alcohol', 'Indica la frecuencia por día', 'Tus hábitos'),
    { type: 'radio', key: 'drogas', phase: 'Tus hábitos', title: '¿Consumes drogas recreativas?', options: SI_NO, allowOther: true },
    followUp('drogas', 'Indica la frecuencia por día', 'Tus hábitos'),
    { type: 'radio', key: 'transito_intestinal', phase: 'Tus hábitos', title: 'Sobre tu tránsito intestinal', options: ['Tengo estreñimiento', 'Evacúo con normalidad', 'Tengo diarrea'], allowOther: true },
    { type: 'radio', key: 'defecaciones', phase: 'Tus hábitos', title: 'Frecuencia de defecaciones', options: ['< de 1 al día', '1 al día', '2 al día', '3 al día', '> de 3 al día'], allowOther: true },

    // Paso 4: Tu descanso
    { type: 'radio', key: 'horas_sueno', phase: 'Tu descanso', title: '¿Cuántas horas duermes al día?', options: ['< de 6 horas', '7,5 a 8 horas', '8,5 a 9 horas', '> de 9 horas'], allowOther: true },
    { type: 'radio', key: 'problemas_dormir', phase: 'Tu descanso', title: '¿Tienes problemas para dormir?', options: SI_NO, allowOther: true },
    followUp('problemas_dormir', 'Indica por qué', 'Tu descanso'),
    { type: 'scale', key: 'calidad_descanso', phase: 'Tu descanso', title: 'Califica la calidad de tu descanso', options: ['Insomnio o mal descanso', 'Varias noches malas', 'Descanso irregular', 'Duermo bien', 'Sueño profundo y reparador'] },

    // Paso 5: Tu organización
    { type: 'radio', key: 'comidas_en_casa', phase: 'Tu organización', title: 'En casa: ¿de dónde vienen tus comidas?', subtitle: 'Tanto en la semana como los findes', options: ['Mayormente cocinadas en casa', 'Mayormente delivery', 'Tanto de casa como delivery'], allowOther: true },
    { type: 'radio', key: 'comidas_fuera', phase: 'Tu organización', title: 'Fuera de casa: ¿de dónde vienen tus comidas?', subtitle: 'Tanto en la semana como los findes', options: ['Como en restaurantes/delivery', 'Llevo mi comida preparada', 'Tanto de casa como de restaurantes'], allowOther: true },
    { type: 'radio', key: 'frecuencia_comida_fuera', phase: 'Tu organización', title: '¿Cuántas veces viene de fuera la comida?', options: ['< de 1 por semana', '1-2 por semana', '3-4 por semana', '5-6 por semana', '> de 6 por semana'] },
    { type: 'radio', key: 'trabajo_limita_comer', phase: 'Tu organización', title: '¿Tu trabajo limita tu tiempo para comer?', options: SI_NO },
    followUp('trabajo_limita_comer', 'Indica por qué', 'Tu organización'),
    { type: 'radio', key: 'momento_mas_hambre', phase: 'Tu organización', title: '¿Cuándo sueles tener más hambre?', options: ['Mañana', 'Medio día', 'Tarde', 'Noche'] },

    // Paso 6: Tu cocina
    { type: 'radio', key: 'quien_cocina', phase: 'Tu cocina', title: '¿Quién suele cocinar en casa?', options: ['Yo mism@', 'Un familiar', 'Le pago a alguien'] },
    { type: 'number', key: 'horas_cocina_semana', phase: 'Tu cocina', title: 'Quien cocina, ¿de cuántas horas por semana dispone?', unit: 'horas', min: 0, max: 100 },
    { type: 'radio', key: 'aceite_uso', phase: 'Tu cocina', title: 'Quien cocina, ¿qué aceite suele usar?', options: ['Un chorrito (aceite de bote)', 'Un rociado (aceite de spray)', 'No se usa aceite'], allowOther: true },
    { type: 'checkbox', key: 'equipos_cocina', phase: 'Tu cocina', title: 'Equipos de cocina disponibles', subtitle: 'Marca las que apliquen', options: ['Estufa/vitro', 'Horno', 'Freidora de aire', 'Batidora', 'Microondas', 'Thermomix'] },
    { type: 'checkbox', key: 'accesorios_cocina', phase: 'Tu cocina', title: 'Accesorios de cocina disponibles', subtitle: 'Marca las que apliquen', options: ['Báscula de comida', 'Sartén antiadherente', 'Tostadora', 'Aceite en spray', 'Cortador/laminador de verduras', 'Tuppers y ziplocs'] },

    // Paso 7: Tu alimentación
    { type: 'text', long: true, key: 'alimentos_preferidos', phase: 'Tu alimentación', title: 'Tus alimentos preferidos a incluir' },
    { type: 'text', long: true, key: 'alimentos_no_gustan', phase: 'Tu alimentación', title: 'Alimentos que no te gusten' },
    { type: 'text', long: true, key: 'alimentos_mantener', phase: 'Tu alimentación', title: 'Alimentos actuales a mantener' },
    { type: 'radio', key: 'restricciones_religiosas', phase: 'Tu alimentación', title: 'Restricciones dietéticas religiosas', options: SI_NO },
    followUp('restricciones_religiosas', 'Sobre tus restricciones religiosas, ¿dime cuáles?', 'Tu alimentación'),
    { type: 'radio', key: 'restricciones_personales', phase: 'Tu alimentación', title: 'Restricciones dietéticas personales', options: SI_NO },
    followUp('restricciones_personales', 'Sobre tus restricciones personales, ¿dime cuáles?', 'Tu alimentación'),

    // Paso 8: Tus costumbres
    { type: 'radio', key: 'cantidad_comida', phase: 'Tus costumbres', title: '¿Cuánto sueles comer?', options: ['Mucha cantidad', 'Cantidad moderada', 'Poca cantidad'] },
    { type: 'radio', key: 'luego_de_comer', phase: 'Tus costumbres', title: 'Luego de comer…', options: ['Suelo repetir', 'Me quedo satisfech@', 'Me quedo con hambre'] },
    { type: 'radio', key: 'velocidad_comer', phase: 'Tus costumbres', title: 'Velocidad al comer', options: ['Rápida', 'Moderada', 'Lenta'] },
    { type: 'radio', key: 'protocolos_restrictivos', phase: 'Tus costumbres', title: '¿Haces protocolos restrictivos entre semana?', options: SI_NO, allowOther: true },
    { type: 'radio', key: 'desvio_findes', phase: 'Tus costumbres', title: '¿Te desvías de tu dieta en findes?', options: SI_NO, allowOther: true },
    { type: 'radio', key: 'relacion_comida', phase: 'Tus costumbres', title: '¿Cómo es tu relación con la comida?', options: ['Buena', 'Mediocre', 'Mala'] },
    { type: 'text', long: true, key: 'relacion_comida_detalle', phase: 'Tus costumbres', title: 'Explícanos por qué' },

    // Paso 9: Tu dieta reciente
    { type: 'radio', key: 'cambio_dieta_reciente', phase: 'Tu dieta reciente', title: '¿Has cambiado tu dieta recientemente?', options: SI_NO },
    { type: 'text', long: true, key: 'cambio_dieta_reciente_detalle', phase: 'Tu dieta reciente', title: 'Explícanos por qué' },
    { type: 'text', long: true, key: 'dieta_que_cuesta', phase: 'Tu dieta reciente', title: '¿Qué te cuesta más de una dieta?' },
    { type: 'text', long: true, key: 'dieta_que_cambiarias', phase: 'Tu dieta reciente', title: '¿Qué cambiarías de las dietas previas?' },
    { type: 'text', long: true, key: 'dieta_que_esperas', phase: 'Tu dieta reciente', title: '¿Qué esperas de un plan dietético?' },

    // Paso 10: Suplementación
    { type: 'multitext', key: 'supl_dietetica', phase: 'Suplementación', title: 'Suplementación dietética', subtitle: 'Complementos alimenticios, vitaminas, etc' },
    { type: 'multitext', key: 'supl_estetica', phase: 'Suplementación', title: 'Suplementación estética', subtitle: 'Uñas, pelo, piel, etc' },
    { type: 'multitext', key: 'supl_clinica', phase: 'Suplementación', title: 'Suplementación clínica', subtitle: 'Digestión, sueño, ansiedad, etc' },
    { type: 'multitext', key: 'farmacos', phase: 'Suplementación', title: 'Fármacos o medicación', subtitle: 'Diabetes, antidepresivos, hipertensión, etc' },
    { type: 'multitext', key: 'supl_deportiva', phase: 'Suplementación', title: 'Suplementación deportiva', subtitle: 'Proteína, creatina, esteroides, sarms, etc' },

    // Paso 11: Para mujeres (condicional: si es hombre se salta)
    ...[
      { type: 'radio', key: 'situacion_hormonal', title: 'Situación hormonal actual', options: ['Fértil', 'Embarazo', 'Lactancia', 'Menopausia'] },
      { type: 'radio', key: 'ciclos_regulares', title: '¿Tus ciclos son regulares?', options: ['Sí, menstruación normal', 'No, son irregulares'] },
      { type: 'text', key: 'duracion_ciclo', title: 'Duración del ciclo menstrual' },
      { type: 'radio', key: 'anticonceptivos', title: '¿Usas anticonceptivos orales?', options: SI_NO, allowOther: true },
      followUp('anticonceptivos', 'Indica el tipo', 'Para mujeres'),
      { type: 'radio', key: 'trastorno_menstrual', title: 'Sobre el trastorno menstrual', options: ['Sí, lo tengo', 'He tenido antes', 'No tengo'] },
      { type: 'radio', key: 'sindrome_premenstrual', title: 'Sobre síndrome premenstrual', options: ['Sí, tengo SPM intenso', 'He tenido antes', 'No tengo'] },
      { type: 'text', long: true, key: 'sintomas_periodo', title: 'Síntomas durante el periodo' },
      { type: 'radio', key: 'cambios_fisicos_ciclo', title: '¿Cambios físicos antes o durante el ciclo?', options: SI_NO, allowOther: true },
      followUp('cambios_fisicos_ciclo', 'Indica cuáles', 'Para mujeres'),
      { type: 'radio', key: 'rendimiento_ciclo', title: '¿Cambia tu rendimiento deportivo?', options: SI_NO, allowOther: true },
      followUp('rendimiento_ciclo', 'Indica cómo', 'Para mujeres'),
    ].map((s) => ({
      ...s, phase: 'Para mujeres',
      showIf: (a, ctx) => ctx.gender !== 'male' && (!s.showIf || s.showIf(a, ctx)),
    })),

    // Paso 12: Recuerdo de 24 h
    {
      type: 'intro', phase: 'Recuerdo de 24 h', title: 'Recuerdo de 24 h',
      body: 'Cuéntanos qué comiste ayer, comida a comida.\n\n• No busques hacerlo perfecto\n• Usa cantidades aproximadas\n• Añade detalles si lo deseas',
    },
    { type: 'mealtext', key: 'recuerdo_desayuno', phase: 'Recuerdo de 24 h', title: 'Desayuno' },
    { type: 'mealtext', key: 'recuerdo_media_manana', phase: 'Recuerdo de 24 h', title: 'Media mañana' },
    { type: 'mealtext', key: 'recuerdo_comida', phase: 'Recuerdo de 24 h', title: 'De comida' },
    { type: 'mealtext', key: 'recuerdo_merienda', phase: 'Recuerdo de 24 h', title: 'Merienda' },
    { type: 'mealtext', key: 'recuerdo_cena', phase: 'Recuerdo de 24 h', title: 'Para cenar' },
    { type: 'mealtext', key: 'recuerdo_pre_sueno', phase: 'Recuerdo de 24 h', title: 'Pre-sueño' },

    // Paso 13: Actividad física
    { type: 'text', key: 'profesion', phase: 'Actividad física', title: '¿Cuál es tu profesión actual?' },
    { type: 'multitext', key: 'hobbies', phase: 'Actividad física', title: '¿Cuáles son tus hobbies?', noneLabel: 'Marca esta casilla si no tienes ninguno' },
    { type: 'number', key: 'pasos_dia', phase: 'Actividad física', title: 'Tu media de pasos al día', unit: 'pasos/día', min: 0, max: 60000 },
    { type: 'radio', key: 'actividad_principal', phase: 'Actividad física', title: 'Actividad física principal', options: ['Fuerza', 'CrossFit', 'Cardio', 'Clases dirigidas', 'Deportes'] },
    { type: 'radio', key: 'actividad_secundaria', phase: 'Actividad física', title: 'Actividad física secundaria', options: ['Fuerza', 'CrossFit', 'Cardio', 'Clases dirigidas', 'Deportes'] },

    // Paso 14: Nivel de actividad
    { type: 'number', key: 'horas_entreno_semana', phase: 'Nivel de actividad', title: 'Horas de entreno por semana', unit: 'horas/semana', min: 0, max: 60 },
    { type: 'number', key: 'sesiones_semana', phase: 'Nivel de actividad', title: '¿Cuántas sesiones semanales?', unit: 'días/semana', min: 0, max: 7 },
    { type: 'text', key: 'actividad_adicional', phase: 'Nivel de actividad', title: 'Actividad física adicional', subtitle: 'Ej: deportes, hobbies, aficiones deportivas', optional: true },
    { type: 'radio', key: 'asmatico', phase: 'Nivel de actividad', title: '¿Eres asmático/a?', options: SI_NO },
    { type: 'radio', key: 'enfermedad', phase: 'Nivel de actividad', title: '¿Sufres de alguna enfermedad?', options: SI_NO, allowOther: true },
    followUp('enfermedad', 'Indica cuál', 'Nivel de actividad'),
    { type: 'radio', key: 'lesiones', phase: 'Nivel de actividad', title: 'Lesiones que limiten al entreno', options: ['Sí, tengo', 'No tengo'], allowOther: true },
    followUp('lesiones', 'Sobre tus lesiones, ¿dime cuáles?', 'Nivel de actividad', 'Sí, tengo'),
    { type: 'radio', key: 'cirugias', phase: 'Nivel de actividad', title: '¿Cirugías que afecten al entreno?', options: ['Sí, tengo', 'No tengo'], allowOther: true },
    followUp('cirugias', 'Sobre tus cirugías, ¿dime cuáles y cuándo?', 'Nivel de actividad', 'Sí, tengo'),

    // Paso 15: Tus analíticas (condicional)
    { type: 'radio', key: 'analitica_reciente', phase: 'Tus analíticas', title: 'Analítica en los últimos 12 meses', options: ['Sí, tengo', 'No tengo'] },
    ...[
      { key: 'glucosa', title: 'Niveles de glucosa', unit: 'mg/dl' },
      { key: 'colesterol_total', title: 'Colesterol total', unit: 'mg/dl' },
      { key: 'hdl', title: 'Niveles HDL', unit: 'mg/dl' },
      { key: 'ldl', title: 'Niveles LDL', unit: 'mg/dl' },
      { key: 'trigliceridos', title: 'Niveles de TG', unit: 'mg/dl' },
      { key: 'presion_arterial', title: 'Presión arterial', unit: 'mmHg' },
    ].map((s) => ({
      type: 'number', ...s, phase: 'Tus analíticas', optional: true,
      showIf: (a) => a.analitica_reciente === 'Sí, tengo',
    })),

    // Paso 16: Entreno de fuerza
    { type: 'radio', key: 'dias_fuerza', phase: 'Entreno de fuerza', title: 'Días por semana a entrenar fuerza', options: ['2 días', '3 días', '4 días', '5 días'] },
    { type: 'number', key: 'tiempo_por_sesion', phase: 'Entreno de fuerza', title: 'Tiempo disponible por sesión', unit: 'min/entreno', min: 10, max: 240 },
    { type: 'radio', key: 'objetivo_entreno', phase: 'Entreno de fuerza', title: 'Objetivos de tu entrenamiento', options: ['Salud', 'Rendimiento', 'Estética', 'Fuerza'], allowOther: true },
    { type: 'radio', key: 'repeticiones_preferidas', phase: 'Entreno de fuerza', title: 'Repeticiones preferidas', options: ['Repes bajas y pesado (5-8)', 'Repes medias y moderado (9-12)', 'Repes altas y ligero (15-20)'] },
    { type: 'radio', key: 'equipo_preferido', phase: 'Entreno de fuerza', title: 'Tipo de equipo preferido', options: ['Mayormente peso libre', 'Mayormente máquinas', 'Ambas por igual'], allowOther: true },
    { type: 'text', key: 'grupo_priorizar', phase: 'Entreno de fuerza', title: 'Grupo muscular a priorizar' },
    { type: 'text', key: 'grupo_debil', phase: 'Entreno de fuerza', title: 'Grupo muscular más débil' },

    // Paso 17: Tus preferencias
    { type: 'multitext', key: 'ejercicios_incluir', phase: 'Tus preferencias', title: 'Ejercicios que quieres incluir', noneLabel: 'Marca si no tienes ninguno en mente' },
    { type: 'multitext', key: 'ejercicios_evitar', phase: 'Tus preferencias', title: 'Ejercicios que quieres evitar', noneLabel: 'Marca si no hay ninguno' },
    { type: 'multitext', key: 'ejercicios_dolor', phase: 'Tus preferencias', title: 'Ejercicios con molestia o dolor', noneLabel: 'Marca si no hay ninguno' },
    { type: 'radio', key: 'lugar_entreno', phase: 'Tus preferencias', title: 'Lugar donde entrenas', options: ['En casa', 'Gimnasio'] },
    { type: 'multitext', key: 'material_casa', phase: 'Tus preferencias', title: 'Material disponible en casa', noneLabel: 'Marca si no tienes material', showIf: (a) => a.lugar_entreno === 'En casa' },
    { type: 'scale', key: 'material_gimnasio', phase: 'Tus preferencias', title: 'Material de tu gimnasio', options: ['No puedo entrenar bien', 'Muy justo para mi plan', 'Me apaño', 'Tengo casi todo', 'Tengo de todo'], showIf: (a) => a.lugar_entreno === 'Gimnasio' },

    // Paso 18: Medidas antropométricas
    ...[
      { key: 'peso', title: 'Peso', unit: 'kg', min: 30, max: 350 },
      { key: 'altura', title: 'Altura', unit: 'cm', min: 100, max: 250 },
      { key: 'brazo', title: 'Brazo', unit: 'cm', min: 10, max: 80 },
      { key: 'pecho', title: 'Pecho', unit: 'cm', min: 40, max: 200 },
      { key: 'cintura', title: 'Cintura', unit: 'cm', min: 30, max: 250 },
      { key: 'cadera', title: 'Cadera', unit: 'cm', min: 30, max: 250 },
      { key: 'gluteo', title: 'Glúteo', unit: 'cm', min: 30, max: 250 },
      { key: 'muslo', title: 'Muslo', unit: 'cm', min: 20, max: 150 },
    ].map((s) => ({ type: 'number', phase: 'Medidas', ...s, key: `medida_${s.key}` })),

    // Consentimiento
    {
      type: 'consent', key: 'consentimiento_datos', phase: 'Consentimiento', title: 'Consentimiento',
      label: 'Consiento que Squad Fit reciba mis fotos y datos antropométricos con fines de procesar y recibir los servicios contratados. Squad Fit nunca publicará tus datos ni fotos sin tu consentimiento firmado.',
    },
  ],
};

/* ===================== 14.2 SEGUIMIENTO SEMANAL ===================== */
// Claves estables = habit_engine_config.json (scores adherence/recovery/stress)

const seguimientoSemanal = {
  slug: 'seguimiento-semanal',
  title: 'Seguimiento semanal',
  phases: ['Tu semana'],
  steps: [
    {
      type: 'intro', title: 'Seguimiento semanal',
      body: 'Completa estas preguntas para ajustar tu semana y mantener el proceso en marcha.',
    },
    { type: 'scale', key: 'weekly_training_adherence', phase: 'Tu semana', title: 'Sensaciones del entreno', options: ['No he entrenado nada esta semana', 'He hecho la mitad o menos', 'He cumplido aproximadamente la mitad', 'He cumplido con ajustes', 'He cumplido todas las sesiones'] },
    { type: 'scale', key: 'weekly_menu_adherence', phase: 'Tu semana', title: 'Cumplimiento de menús', options: ['No he cumplido nada', 'He cumplido 2-3 días', 'He cumplido 4-5 días', 'He cumplido calorías con intercambios', 'He cumplido completamente'] },
    { type: 'scale', key: 'weekly_hunger', phase: 'Tu semana', title: 'Nivel de hambre', options: ['Muchísima hambre constante', 'Hambre frecuente o antojos', 'Saciedad adecuada', 'Me sobra algo de comida', 'Me cuesta acabar las comidas'] },
    { type: 'scale', key: 'weekly_hydration_urine_color', phase: 'Tu semana', title: 'Hidratación (color de orina)', options: ['Marrón amarillento (muy deshidratado)', 'Amarillo oscuro (bastante deshidratado)', 'Amarillo (algo deshidratado)', 'Amarillo claro / color paja (hidratación óptima)', 'Transparente (exceso de hidratación)'] },
    { type: 'scale', key: 'weekly_sleep_hours', phase: 'Tu semana', title: 'Horas de sueño semanal', options: ['Muy pocas horas de sueño', 'Sueño insuficiente', 'Sueño aceptable', 'Buen descanso semanal', 'Descanso óptimo'] },
    { type: 'scale', key: 'weekly_sleep_quality', phase: 'Tu semana', title: 'Calidad del descanso', options: ['Insomnio o mal descanso', 'Varias noches malas', 'Descanso irregular', 'Duermo bien', 'Sueño profundo y reparador'] },
    { type: 'scale', key: 'weekly_energy', phase: 'Tu semana', title: 'Energía / cansancio general', options: ['Fatiga extrema', 'Mucho cansancio', 'Energía variable', 'Buena energía diaria', 'Energía óptima'] },
    { type: 'scale', key: 'weekly_stress', phase: 'Tu semana', title: 'Nivel de estrés', options: ['Estrés incapacitante', 'Estrés alto', 'Estrés moderado', 'Estrés bajo', 'Sin estrés'] },
    { type: 'scale', key: 'weekly_steps_level', phase: 'Tu semana', title: 'Media de pasos semanal', options: ['Muy poca actividad diaria', 'Actividad baja', 'Actividad moderada', 'Buen nivel de pasos', 'Muy activo diariamente'] },
    { type: 'number', key: 'weekly_weight_kg', phase: 'Tu semana', title: 'Peso actual en ayunas', subtitle: 'Opcional: se puede rellenar al final del mes', unit: 'kg', min: 30, max: 350, optional: true },
  ],
};

/* ===================== 14.3 REVISIÓN MENSUAL ===================== */

const lowCompliance = (key) => (a) => a[key] !== undefined && a[key] <= 2;
const MOTIVOS_BAJO = ['Falta de tiempo', 'Falta de organización', 'Falta de motivación', 'Cansancio / baja energía', 'Estrés o problemas personales', 'Viajes o imprevistos'];
const AYUDAS = ['Un plan más simple', 'Menos días de entreno', 'Cambiar de horario', 'Más acompañamiento', 'Ajustar la intensidad'];

const revisionMensual = {
  slug: 'revision-mensual',
  title: 'Revisión mensual',
  phases: ['Tus medidas', 'Tu entreno', 'Sobre la dieta', 'La adherencia'],
  steps: [
    {
      type: 'intro', title: 'Revisión mensual',
      body: 'Responde con sinceridad para evaluar tu progreso.\n\nAsí podremos ajustar tu plan si fuese necesario.',
    },

    // Paso 1: Tus medidas actuales
    ...[
      { key: 'peso', title: 'Peso', unit: 'kg', min: 30, max: 350 },
      { key: 'altura', title: 'Altura', unit: 'cm', min: 100, max: 250 },
      { key: 'brazo', title: 'Brazo', unit: 'cm', min: 10, max: 80 },
      { key: 'pecho', title: 'Pecho', unit: 'cm', min: 40, max: 200 },
      { key: 'cintura', title: 'Cintura', unit: 'cm', min: 30, max: 250 },
      { key: 'cadera', title: 'Cadera', unit: 'cm', min: 30, max: 250 },
      { key: 'gluteo', title: 'Glúteo', unit: 'cm', min: 30, max: 250 },
      { key: 'muslo', title: 'Muslo', unit: 'cm', min: 20, max: 150 },
    ].map((s) => ({ type: 'number', phase: 'Tus medidas', ...s, key: `medida_${s.key}` })),

    // Paso 2: Tu entreno
    { type: 'radio', key: 'nueva_lesion', phase: 'Tu entreno', title: '¿Nueva lesión este mes?', options: SI_NO, allowOther: true },
    followUp('nueva_lesion', 'Sobre la lesión, ¿dime cuál?', 'Tu entreno'),
    { type: 'radio', key: 'cambiar_ejercicio', phase: 'Tu entreno', title: '¿Quieres cambiar algún ejercicio?', subtitle: 'Recomendamos cambiar solo tras 4-6 meses', options: SI_NO, allowOther: true },
    { type: 'scale', key: 'pasos_cumplimiento', phase: 'Tu entreno', title: 'Sobre tus pasos diarios', options: ['Pasos sin cumplir', 'Cumplidos al 25 %', 'Cumplidos al 50 %', 'Cumplidos al 75 %', 'Cumplidos al 100 %'] },
    { type: 'checkbox', key: 'pasos_motivos_bajo', phase: 'Tu entreno', title: 'Motivo(s) del bajo cumplimiento de pasos', subtitle: 'Marca las que apliquen', options: MOTIVOS_BAJO, showIf: lowCompliance('pasos_cumplimiento') },
    { type: 'checkbox', key: 'pasos_que_ayudaria', phase: 'Tu entreno', title: '¿Qué te ayudaría a cumplir los pasos?', subtitle: 'Marca las que apliquen', options: AYUDAS, showIf: lowCompliance('pasos_cumplimiento') },
    { type: 'scale', key: 'entrenos_cumplimiento', phase: 'Tu entreno', title: 'Cumplimiento de entrenos', options: ['Entrenos sin hacer', 'Hechos al 25 %', 'Hechos al 50 %', 'Hechos al 75 %', 'Hechos al 100 %'] },
    { type: 'checkbox', key: 'entrenos_motivos_bajo', phase: 'Tu entreno', title: 'Motivo(s) del bajo cumplimiento de entrenos', subtitle: 'Marca las que apliquen', options: MOTIVOS_BAJO, showIf: lowCompliance('entrenos_cumplimiento') },
    { type: 'checkbox', key: 'entrenos_que_ayudaria', phase: 'Tu entreno', title: '¿Qué te ayudaría a cumplir los entrenos?', subtitle: 'Marca las que apliquen', options: AYUDAS, showIf: lowCompliance('entrenos_cumplimiento') },

    // Paso 3: Sobre la dieta
    { type: 'scale', key: 'menu_cumplimiento', phase: 'Sobre la dieta', title: 'Cumplimiento de menús', options: ['No he cumplido nada', 'He cumplido 2-3 días', 'He cumplido 4-5 días', 'He cumplido con intercambios', 'He cumplido completamente'] },
    { type: 'scale', key: 'nivel_hambre', phase: 'Sobre la dieta', title: 'Nivel de hambre', options: ['Muchísima hambre constante', 'Hambre frecuente o antojos', 'Saciedad adecuada', 'Me sobra algo de comida', 'Me cuesta acabar las comidas'] },
    { type: 'scale', key: 'sensaciones_dieta', phase: 'Sobre la dieta', title: 'Sensaciones con la dieta', options: ['Siento que no encaja conmigo', 'Me cuesta seguirla', 'La sigo, pero sin disfrutarla', 'Me siento a gusto', 'Encaja perfecto conmigo'] },
    { type: 'scale', key: 'energia_rendimiento', phase: 'Sobre la dieta', title: 'Tu energía y rendimiento', options: ['Muy baja energía', 'Energía algo baja o irregular', 'Energía/rendimiento normal', 'Buena energía y rendimiento', 'Alta energía, me siento fuerte'] },

    // Paso 4: La adherencia
    { type: 'scale', key: 'antojos', phase: 'La adherencia', title: '¿Has tenido antojos?', options: ['Sí, muy frecuentes/sin control', 'Sí, algo frecuentes', 'Alguno puntual', 'Raros y fáciles de gestionar', 'No he tenido antojos'] },
    { type: 'radio', key: 'cambiar_alimento', phase: 'La adherencia', title: '¿Quieres cambiar algún alimento?', options: SI_NO, allowOther: true },
    followUp('cambiar_alimento', 'Sobre los alimentos a cambiar, ¿dime cuáles?', 'La adherencia'),
    { type: 'radio', key: 'sobra_comida', phase: 'La adherencia', title: '¿Te sobra comida en algún menú?', options: SI_NO, allowOther: true },
    followUp('sobra_comida', 'Sobre los menús con comida de más, ¿dime cuáles?', 'La adherencia'),
    { type: 'text', key: 'menu_favorito', phase: 'La adherencia', title: '¿Cuál es tu menú favorito?', subtitle: 'Escribe el nombre o número del menú' },
    { type: 'radio', key: 'eliminar_menu', phase: 'La adherencia', title: '¿Quieres eliminar algún menú?', options: SI_NO, allowOther: true },
    followUp('eliminar_menu', 'Sobre el menú a eliminar, ¿dime cuál?', 'La adherencia'),
  ],
};

export const FORM_DEFINITIONS = {
  'evaluacion-inicial': evaluacionInicial,
  'seguimiento-semanal': seguimientoSemanal,
  'revision-mensual': revisionMensual,
};

// Cálculo de scores del motor de hábitos (habit_engine_config.json §scores):
// se guardan junto a la respuesta semanal para el motor de Alertas.
export function computeWeeklyScores(a) {
  const mean = (keys) => {
    const vals = keys.map((k) => a[k]).filter((v) => typeof v === 'number');
    return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null;
  };
  const adherence = mean(['weekly_training_adherence', 'weekly_menu_adherence', 'weekly_steps_level']);
  const recovery = mean(['weekly_sleep_hours', 'weekly_sleep_quality', 'weekly_energy', 'weekly_hydration_urine_color']);
  const stress = mean(['weekly_hunger', 'weekly_stress']);
  const total = adherence !== null && recovery !== null && stress !== null
    ? +((adherence * 0.4) + (recovery * 0.4) + (stress * 0.2)).toFixed(2)
    : null;
  return { score_adherence: adherence, score_recovery: recovery, score_stress: stress, score_total: total };
}

// Identificador de semana ISO (p. ej. "2026-W29") para weekly_form_submission.
export function isoWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
