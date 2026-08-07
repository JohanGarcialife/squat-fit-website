'use client'

/**
 * SPINNER DE MARCA — el único indicador de carga de Squad Fit.
 *
 * Un aro con degradado cónico que va del naranja de marca (#FF690B) al azul
 * (#363C98) y se desvanece hasta transparente, girando. El degradado hace de
 * estela: no hace falta el clásico «tres bordes de un color y uno de otro»,
 * que se ve duro y deja una muesca visible al girar.
 *
 * Por qué existe: había 31 spinners escritos a mano por la web, cada uno con
 * su tamaño y su color —`border-b-2 border-indigo-600`, `border-t-2 border-white`,
 * `border-[#363C98]`…—, o sea que la misma marca cargaba de cinco maneras
 * distintas según la pantalla. Aquí solo hay tres tamaños y dos variantes.
 *
 * Uso:
 *   <Spinner />                        // mediano, colores de marca
 *   <Spinner size="sm" tono="claro" /> // dentro de un botón de color
 *   <Spinner size="lg" texto="Cargando tus cursos…" />
 *
 * El aro se dibuja con `mask`, que Safari todavía quiere con prefijo; van las
 * dos propiedades. Y respeta «reducir movimiento»: quien lo tenga activado ve
 * el aro latir despacio en vez de girar.
 */

const TAMANOS = {
  sm: { px: 20, grosor: 2.5 },
  md: { px: 40, grosor: 4 },
  lg: { px: 64, grosor: 6 },
}

// El degradado da la vuelta entera: arranca transparente, pasa por el azul y
// remata en el naranja, que es la cabeza de la estela.
const DEGRADADO_MARCA =
  'conic-gradient(from 0deg, rgba(54,60,152,0) 0deg, rgba(54,60,152,0.15) 90deg, #363C98 250deg, #FF690B 360deg)'
const DEGRADADO_CLARO =
  'conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.25) 90deg, rgba(255,255,255,0.75) 250deg, #FFFFFF 360deg)'

export default function Spinner({
  size = 'md',
  tono = 'marca',
  texto = '',
  className = '',
}) {
  const { px, grosor } = TAMANOS[size] || TAMANOS.md
  const hueco = `calc(100% - ${grosor}px)`
  const mascara = `radial-gradient(farthest-side, transparent ${hueco}, #000 0)`

  return (
    <div
      className={`inline-flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className="sf-spinner block rounded-full"
        style={{
          width: px,
          height: px,
          background: tono === 'claro' ? DEGRADADO_CLARO : DEGRADADO_MARCA,
          WebkitMask: mascara,
          mask: mascara,
        }}
      />
      {texto ? (
        <span
          className={`text-sm font-semibold ${
            tono === 'claro' ? 'text-white/90' : 'text-slate-500'
          }`}
        >
          {texto}
        </span>
      ) : null}
      {/* Para lectores de pantalla, que un aro girando no dice nada. */}
      <span className="sr-only">{texto || 'Cargando…'}</span>
    </div>
  )
}

/** El mismo spinner centrado en su hueco, para pantallas que aún no tienen datos. */
export function SpinnerPantalla({ texto = 'Cargando…', className = '' }) {
  return (
    <div className={`w-full flex items-center justify-center py-20 ${className}`}>
      <Spinner size="lg" texto={texto} />
    </div>
  )
}
