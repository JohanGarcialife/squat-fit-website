// Normalización de nombres y apellidos (15.16): «Primera Mayúscula» en cada
// palabra, con las partículas de/del/la/las/los/y en minúscula («María de los
// Ángeles», «Juan del Río García-López»). Se aplica SOLO al guardar (submit),
// nunca mientras la persona teclea. También colapsa espacios repetidos.
//
// Nota asumida: el resto de cada palabra se pasa a minúscula (así «MARÍA» →
// «María»); grafías tipo «McDonald» pierden su mayúscula interna, un caso
// residual en castellano que se prefirió frente a dejar «MARÍA GARCÍA» tal cual.

const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

function capitalizeWord(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function normalizeName(value) {
  if (!value) return value;
  const words = String(value).trim().replace(/\s+/g, ' ').toLowerCase().split(' ');
  return words
    .map((word, i) => {
      // Partícula en minúscula, salvo que sea la primera palabra del campo
      // («De la Torre» como apellido suelto, pero «María de la Torre» entera).
      if (i > 0 && PARTICLES.has(word)) return word;
      // Nombres compuestos con guion o apóstrofo: cada tramo con su mayúscula.
      return word
        .split('-')
        .map((part) => part.split("'").map(capitalizeWord).join("'"))
        .join('-');
    })
    .join(' ');
}
