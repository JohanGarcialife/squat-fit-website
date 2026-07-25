// Conversión kg/lb compartida (perfil + onboarding). El backend guarda SIEMPRE
// kilos; estas utilidades solo convierten para mostrar/editar en pantalla.

export const KG_PER_LB = 0.45359237;

const round1 = (n) => Math.round(n * 10) / 10;

// De kilos (valor canónico) a texto en la unidad elegida, con coma decimal.
export const fmtWeight = (kg, unit) => {
  const n = parseFloat(kg);
  if (isNaN(n)) return '';
  const v = unit === 'kg' ? n : n / KG_PER_LB;
  return String(round1(v)).replace('.', ',');
};

// De lo tecleado (en la unidad elegida) a kilos canónicos (string con punto).
export const weightToKg = (raw, unit) => {
  const n = parseFloat(String(raw).replace(',', '.'));
  if (isNaN(n)) return '';
  return String(unit === 'kg' ? n : n * KG_PER_LB);
};
