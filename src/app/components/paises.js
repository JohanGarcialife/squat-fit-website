// Países del selector del formulario de prellamada.
//
// ── Por qué hay ISO y no solo nombre ─────────────────────────────────────────
//
// Hasta el 31-jul-2026 se preguntaba primero la REGIÓN (Europa / Estados Unidos
// / Latinoamérica) y de ella colgaba un desplegable con el país, porque en
// WordPress no había forma de saber el país y responder una región es más
// rápido. Ahora el país se preselecciona con el de la IP y la región sobra: la
// deduce el backend (`regionDesdeIso`) para que la columna «Region» de la hoja
// y sus pestañas de KPI sigan funcionando igual que hasta ahora.
//
// Lo que viaja al backend es el **ISO** (`pais_iso`), no el nombre: el texto que
// se escribe en la hoja lo pone el backend a partir del ISO, con su bandera
// («🇪🇸 España»), y así hay UNA lista de nombres y no dos que se separen.
//
// ⚠️ Este conjunto de ISOs es GEMELO de `PAIS_POR_ISO` en el backend
// (src/core/integrations/pais-telefono.ts). Si aquí se añade un país que allí no
// está, el lead llega con un ISO que el backend no sabe traducir y la columna
// «País» de la hoja se queda con lo que diga el prefijo del teléfono.

/** Bandera a partir del ISO, con los «regional indicator symbols»: ES → 🇪🇸. */
export function bandera(iso) {
  const code = String(iso || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// Nombre en español por ISO. Tres van acortados a propósito, porque son los que
// se escriben en la hoja del equipo y allí la columna es estrecha:
// US → «U.S.A.», DO → «Rep. Dom.», NL → «Holanda».
const NOMBRES = {
  // América
  US: 'U.S.A.', CA: 'Canadá', MX: 'México', GT: 'Guatemala', SV: 'El Salvador',
  HN: 'Honduras', NI: 'Nicaragua', CR: 'Costa Rica', PA: 'Panamá', CU: 'Cuba',
  DO: 'Rep. Dom.', PR: 'Puerto Rico', CO: 'Colombia', VE: 'Venezuela',
  EC: 'Ecuador', PE: 'Perú', BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay',
  AR: 'Argentina', CL: 'Chile', BR: 'Brasil',
  // Europa
  ES: 'España', PT: 'Portugal', FR: 'Francia', IT: 'Italia', DE: 'Alemania',
  GB: 'Reino Unido', IE: 'Irlanda', NL: 'Holanda', BE: 'Bélgica',
  LU: 'Luxemburgo', CH: 'Suiza', AT: 'Austria', DK: 'Dinamarca', SE: 'Suecia',
  NO: 'Noruega', FI: 'Finlandia', IS: 'Islandia', PL: 'Polonia', CZ: 'Chequia',
  SK: 'Eslovaquia', HU: 'Hungría', RO: 'Rumanía', BG: 'Bulgaria', GR: 'Grecia',
  HR: 'Croacia', SI: 'Eslovenia', RS: 'Serbia', UA: 'Ucrania', AD: 'Andorra',
  MC: 'Mónaco', MT: 'Malta', CY: 'Chipre', EE: 'Estonia', LV: 'Letonia',
  LT: 'Lituania', LI: 'Liechtenstein', AL: 'Albania',
  BA: 'Bosnia y Herzegovina', BY: 'Bielorrusia', MD: 'Moldavia',
  ME: 'Montenegro', MK: 'Macedonia del Norte', SM: 'San Marino',
  VA: 'Ciudad del Vaticano', XK: 'Kosovo', RU: 'Rusia',
  // Resto
  MA: 'Marruecos', DZ: 'Argelia', TN: 'Túnez', EG: 'Egipto', ZA: 'Sudáfrica',
  IL: 'Israel', AE: 'Emiratos Árabes Unidos', TR: 'Turquía', IN: 'India',
  CN: 'China', JP: 'Japón', KR: 'Corea del Sur', TH: 'Tailandia',
  PH: 'Filipinas', ID: 'Indonesia', AU: 'Australia', NZ: 'Nueva Zelanda',
};

/**
 * Los de donde viene la mayoría de los leads, arriba del todo y sin repetirse
 * abajo. No es capricho: en un desplegable de 70 países, obligar a un español a
 * bajar hasta la E es fricción en la pregunta 3 de 15.
 */
const DESTACADOS = ['ES', 'MX', 'AR', 'CL', 'CO', 'US', 'PE'];

const item = (iso) => ({
  iso,
  nombre: NOMBRES[iso],
  etiqueta: `${bandera(iso)} ${NOMBRES[iso]}`,
});

const RESTO = Object.keys(NOMBRES)
  .filter((iso) => !DESTACADOS.includes(iso))
  .map(item)
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

/** Lista del desplegable: los destacados primero y el resto en orden alfabético. */
export const PAISES = [...DESTACADOS.map(item), ...RESTO];

/** ¿Conocemos este ISO? Evita preseleccionar basura que llegue de la cabecera. */
export function esIsoConocido(iso) {
  return Boolean(NOMBRES[String(iso || '').trim().toUpperCase()]);
}

export function nombreDePais(iso) {
  return NOMBRES[String(iso || '').trim().toUpperCase()] || '';
}
