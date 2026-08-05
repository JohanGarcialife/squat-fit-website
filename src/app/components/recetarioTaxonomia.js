// Acceso a la taxonomía del libro (ver recetarioTaxonomia.data.js para de
// dónde sale cada dato y qué significa cada icono).
//
// Por qué vive en el front y no en el backend: `recipe/system` no devuelve hoy
// ni la categoría ni los iconos —la columna `recipe.category_id` está sembrada
// con «Libro de cocina 1/2», que es el volumen, no la sección del pie— y el
// endpoint ni siquiera la selecciona. Meter la taxonomía real en la base
// pide migración y resiembra; esto es el mismo dato, leído del mismo sitio
// (los PDFs), disponible ya. Cuando el backend lo sirva, `taxonomiaDe()` es
// el único punto que hay que cambiar.

import { TAXONOMIA_LIBRO } from './recetarioTaxonomia.data'

export function normalizarTitulo(titulo) {
  return String(titulo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Taxonomía de una receta de `recipe/system`, o `null` si no es del libro. */
export function taxonomiaDe(receta) {
  if (!receta) return null
  return TAXONOMIA_LIBRO[normalizarTitulo(receta.name || receta.title)] || null
}

// Orden de las secciones tal cual van en el libro (no alfabético: es el orden
// del índice, y el cliente que hojea el libro lo reconoce).
export const CATEGORIAS = [
  { id: 'Desayunos', icono: '☕' },
  { id: 'Comidas', icono: '🍽️' },
  { id: 'Cenas', icono: '🌙' },
  { id: 'Guarniciones', icono: '🥗' },
  { id: 'Snacks', icono: '🍎' },
  { id: 'Postres', icono: '🧁' },
  { id: 'Salsas saladas', icono: '🥫' },
  { id: 'Salsas dulces', icono: '🍯' },
  { id: 'Zona tropical', icono: '🌴' },
]

const ORDEN_CATEGORIA = new Map(CATEGORIAS.map((c, i) => [c.id, i]))

export function ordenDeCategoria(categoria) {
  const i = ORDEN_CATEGORIA.get(categoria)
  return i === undefined ? CATEGORIAS.length : i
}

export function iconoDeCategoria(categoria) {
  return CATEGORIAS.find((c) => c.id === categoria)?.icono || '🍳'
}

// Facetas de filtro = los iconos del libro, ni uno más ni uno menos.
// `sinLacteos` acepta el condicional «queso» del libro (sin lácteos si cambias
// el queso por uno vegano): filtrar por «sin lácteos» y esconder esas 37
// recetas sería más falso que enseñarlas, porque el libro las marca aptas.
export const FACETAS = [
  { id: 'sinLacteos', label: 'Sin lácteos', casa: (v) => v === true || v === 'queso' },
  { id: 'sinHuevo', label: 'Sin huevo', casa: (v) => v === true },
  { id: 'sinGluten', label: 'Sin gluten', casa: (v) => v === true },
  { id: 'vegan', label: 'Vegana', casa: (v) => v === true },
  { id: 'keto', label: 'Keto', casa: (v) => v === true },
  { id: 'kcal', label: 'Ligera', casa: (v) => v === true },
  { id: 'sacia', label: 'Sacia', casa: (v) => v === true },
  { id: 'fibra', label: 'Con fibra', casa: (v) => v === true },
]

/** ¿Esta receta cumple TODAS las facetas activas? */
export function cumpleFacetas(taxonomia, activas) {
  if (!activas || activas.length === 0) return true
  const iconos = taxonomia?.iconos
  if (!iconos) return false
  return activas.every((id) => {
    const faceta = FACETAS.find((f) => f.id === id)
    return faceta ? faceta.casa(iconos[id]) : true
  })
}

/** Iconos que SÍ tiene una receta, listos para pintar como etiquetas. */
export function etiquetasDe(taxonomia) {
  const iconos = taxonomia?.iconos
  if (!iconos) return []
  return FACETAS.filter((f) => f.casa(iconos[f.id])).map((f) => ({
    id: f.id,
    label: f.id === 'sinLacteos' && iconos.sinLacteos === 'queso' ? 'Sin lácteos*' : f.label,
    condicional: f.id === 'sinLacteos' && iconos.sinLacteos === 'queso',
  }))
}
