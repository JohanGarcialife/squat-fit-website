// Listas de países para el desplegable que cuelga de «Europa» y de
// «Latinoamérica» en el formulario de prellamada.
//
// El orden NO es alfabético puro a propósito: delante van los países de donde
// viene la mayoría de los leads, para que no tengan que buscar. El resto, en
// orden alfabético (con `localeCompare` en español, que ordena bien las tildes
// y la eñe).
//
// Al ser un <select> nativo, el navegador ya da gratis el salto por teclado:
// pulsar una letra lleva al primer país que empieza por ella.

const ordenar = (lista) => [...lista].sort((a, b) => a.localeCompare(b, 'es'));

const EUROPA_RESTO = ordenar([
  'Albania', 'Alemania', 'Andorra', 'Austria', 'Bélgica', 'Bielorrusia',
  'Bosnia y Herzegovina', 'Bulgaria', 'Chipre', 'Ciudad del Vaticano',
  'Croacia', 'Dinamarca', 'Eslovaquia', 'Eslovenia', 'Estonia', 'Finlandia',
  'Francia', 'Grecia', 'Hungría', 'Irlanda', 'Islandia', 'Italia', 'Kosovo',
  'Letonia', 'Liechtenstein', 'Lituania', 'Luxemburgo', 'Macedonia del Norte',
  'Malta', 'Moldavia', 'Mónaco', 'Montenegro', 'Noruega', 'Países Bajos',
  'Polonia', 'Portugal', 'Reino Unido', 'República Checa', 'Rumanía', 'Rusia',
  'San Marino', 'Serbia', 'Suecia', 'Suiza', 'Turquía', 'Ucrania',
]);

const LATAM_RESTO = ordenar([
  'Bolivia', 'Brasil', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador',
  'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela',
]);

// España primero: es de donde viene la mayor parte del tráfico.
export const PAISES_EUROPA = ['España', ...EUROPA_RESTO];

// Argentina, Chile y México primero, por el mismo motivo.
export const PAISES_LATAM = ['Argentina', 'Chile', 'México', ...LATAM_RESTO];
