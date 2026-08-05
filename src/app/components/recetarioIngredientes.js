// Lectura de los ingredientes tal y como los imprime el libro.
//
// Cada línea de `ingredients` viene del backend con dos campos:
//   · `subtitle` — el SUBTÍTULO DE BLOQUE del libro («Para el macerado»,
//     «Para el rebozado»). En la ficha antiguo se colgaba de cada línea con un
//     guion («2 huevos batidos — Para el rebozado») y quedaba fatal: en el
//     libro es una cabecera en negrita encima del grupo, y una sola vez.
//   · `title` — la línea entera, con sus paréntesis dentro.
//
// LOS PARÉNTESIS NO SON TODOS IGUALES. En el libro van en gris, pero unos son
// SUSTITUCIONES y otros son ACLARACIONES DE CANTIDAD, y confundirlos llena el
// desplegable de notas que no sustituyen nada:
//   «250 g de leche desnatada sin lactosa (o bebida de avena 0%)»  → sustitución
//   «400 g pan rallado + 10 g sal (Sólo se gastarán 100 g)»        → aclaración
// La marca que las separa es la conjunción de apertura: «o », «ó » y también
// «u » (la variante castellana ante palabra que empieza por o-: «u 80 g»,
// «u otra verdura»). Comprobado sobre las 1.287 líneas de los dos libros:
// 452 empiezan por o/ó, 28 por u, y las 474 restantes son aclaraciones de
// cantidad («≈80 g»), referencias cruzadas («ver pág. 88») o notas de kcal.
//
// El libro tiene además 37 sustituciones etiquetadas con la dieta a la que
// sirven —«(vegano: 30 g Vegg Biográ + 80 g leche de almendras 0%)»—, que no
// llevan conjunción pero son sustituciones de pleno derecho.

const APERTURA_SUSTITUCION = /^[oóu]\s+/i;
const ETIQUETA_DIETA = /^(vegan[oa]?s?|vegetarian[oa]s?|celiac[oa]s?|sin gluten|sin lactosa|sin l[aá]cteos)\s*:\s*/i;

// Palabras del propio libro que delatan a qué preferencia sirve una
// sustitución. Deliberadamente conservador: si no hay señal clara, la
// sustitución se enseña igual, solo que sin promocionarse a principal.
const PISTAS = {
  vegano: /\bvegan|vegetarian|vegg biogr|harina de garbanzos?|yogur vegetal|queso vegano|leche vegetal|bebida de avena|leche de almendras?|almendras 0%|\btofu\b|\bheura\b|levadura de queso|anacardos?|soja\b/i,
  sin_lactosa: /sin lactosa|deslactosad|bebida de avena|leche de almendras?|yogur vegetal|queso vegano|leche vegetal|bebida vegetal/i,
  sin_gluten: /sin gluten|celiac|sin trigo|harina de garbanzos?|maicena/i,
  sin_huevo: /sin huevo|vegg biogr|harina de garbanzos?/i,
};

// Trocea una línea en sus paréntesis de primer nivel. No se usa una expresión
// regular con `[^()]*` porque se rompería con un paréntesis anidado; contar la
// profundidad cuesta lo mismo y aguanta cualquier caso.
function trozos(texto) {
  const salida = [];
  let profundidad = 0;
  let actual = '';
  for (const c of texto) {
    if (c === '(') {
      if (profundidad === 0) {
        if (actual) salida.push({ tipo: 'texto', texto: actual });
        actual = '';
      } else {
        actual += c;
      }
      profundidad += 1;
    } else if (c === ')' && profundidad > 0) {
      profundidad -= 1;
      if (profundidad === 0) {
        salida.push({ tipo: 'parentesis', texto: actual });
        actual = '';
      } else {
        actual += c;
      }
    } else {
      actual += c;
    }
  }
  if (actual) salida.push({ tipo: profundidad > 0 ? 'parentesis' : 'texto', texto: actual });
  return salida;
}

function limpia(t) {
  return String(t || '').replace(/\s+/g, ' ').trim();
}

// Preferencias a las que sirve un texto de sustitución (puede servir a varias:
// una bebida de avena vale igual para vegano y para sin lactosa).
function preferenciasQueCubre(texto, etiqueta) {
  const cubre = new Set();
  if (etiqueta) {
    if (/vegan|vegetarian/i.test(etiqueta)) cubre.add('vegano');
    if (/celiac|gluten/i.test(etiqueta)) cubre.add('sin_gluten');
    if (/lactosa|l[aá]cteos/i.test(etiqueta)) cubre.add('sin_lactosa');
  }
  for (const [clave, patron] of Object.entries(PISTAS)) {
    if (patron.test(texto)) cubre.add(clave);
  }
  return [...cubre];
}

/**
 * Analiza una línea de ingrediente.
 * @returns {{principal: string, aclaraciones: string[], sustituciones: Array<{texto: string, cubre: string[]}>}}
 *   `principal` conserva las aclaraciones entre paréntesis en su sitio (son
 *   parte de la cantidad: «2 claras (≈80 g)»); solo salen de la línea las
 *   sustituciones, que son las que van al desplegable.
 */
export function analizarIngrediente(title) {
  const partes = trozos(String(title || ''));
  let principal = '';
  const aclaraciones = [];
  const sustituciones = [];

  for (const parte of partes) {
    if (parte.tipo === 'texto') {
      principal += parte.texto;
      continue;
    }
    const dentro = limpia(parte.texto);
    if (!dentro) continue;
    const etiqueta = dentro.match(ETIQUETA_DIETA);
    if (etiqueta) {
      const texto = limpia(dentro.slice(etiqueta[0].length));
      sustituciones.push({ texto, cubre: preferenciasQueCubre(texto, etiqueta[1]) });
    } else if (APERTURA_SUSTITUCION.test(dentro)) {
      const texto = limpia(dentro.replace(APERTURA_SUSTITUCION, ''));
      sustituciones.push({ texto, cubre: preferenciasQueCubre(texto, null) });
    } else {
      aclaraciones.push(dentro);
      principal += `(${dentro})`;
    }
  }

  return { principal: limpia(principal), aclaraciones, sustituciones };
}

/**
 * Agrupa los ingredientes en los BLOQUES del libro, respetando el orden.
 * Un bloque nuevo empieza cada vez que cambia el subtítulo, así que dos
 * bloques con el mismo nombre separados por otro no se fusionan (el libro
 * tampoco los fusiona).
 * @returns {Array<{titulo: string|null, items: object[]}>}
 */
export function bloquesDeIngredientes(ingredientes) {
  const bloques = [];
  for (const ing of ingredientes || []) {
    const titulo = limpia(ing?.subtitle) || null;
    const ultimo = bloques[bloques.length - 1];
    if (!ultimo || ultimo.titulo !== titulo) {
      bloques.push({ titulo, items: [ing] });
    } else {
      ultimo.items.push(ing);
    }
  }
  return bloques;
}

/**
 * Coloca como PRINCIPAL la opción que encaja con las preferencias del cliente
 * y manda el resto —incluida la original del libro— a las sustituciones.
 * Sin preferencias (o sin ninguna que encaje) todo se queda como en el libro.
 * @param {object} analisis salida de analizarIngrediente
 * @param {string[]} preferencias claves de preferenciasAlimentarias
 */
export function conPreferencias(analisis, preferencias) {
  const activas = (preferencias || []).filter(Boolean);
  if (!activas.length || !analisis.sustituciones.length) {
    return { principal: analisis.principal, promocionada: false, alternativas: analisis.sustituciones };
  }
  const indice = analisis.sustituciones.findIndex((s) => s.cubre.some((c) => activas.includes(c)));
  if (indice < 0) {
    return { principal: analisis.principal, promocionada: false, alternativas: analisis.sustituciones };
  }
  const elegida = analisis.sustituciones[indice];
  const resto = analisis.sustituciones.filter((_, i) => i !== indice);
  return {
    principal: elegida.texto,
    promocionada: true,
    // La del libro nunca se pierde: baja a la primera alternativa.
    alternativas: [{ texto: analisis.principal, cubre: [], original: true }, ...resto],
  };
}
