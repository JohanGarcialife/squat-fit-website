'use client'
import React, { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { toast } from 'react-hot-toast'
import {
  TIER_META,
  buildTierCartItem,
  fetchTieredGroup,
  groupTierOrder,
} from '@/app/components/courseCatalog'

// Sección de precios de Cocina Squad Fit: 4 tarjetas
// (Impreso Vol 1 · Pack impreso · Biblioteca digital con tramos · Bundle
// "Lo quiero todo"). Diseño portado de la página Divi de WordPress; la compra
// va por el carrito/Stripe del proyecto, no por enlaces de WooCommerce.
// La tarjeta digital usa el grupo «Biblioteca digital» del catálogo real
// (Fase 13): selector mensual / trimestral / anual / de por vida, cobro por
// el checkout de tramos de la Fase 9/12.

// Identificadores reales de los productos físicos en producción (28-jul-2026).
// El emparejamiento va PRIMERO por id y solo después por nombre: los títulos que
// tienen en la BD son frases de marketing («Comienza la verdadera transformacion
// hoy» para el Volumen 1, pack «Nutricion» para los dos volúmenes) y NO contienen
// «Vol 1» ni «Vol 1 y 2», así que las regex de abajo no casaban con nada y las
// dos tarjetas salían «No disponible» en la landing pública. Las regex se quedan
// como red de seguridad por si algún día se recrean los productos con otros ids.
const PRINT_IDS = {
  vol1Version: 'fff42a02-ce53-4fed-9be4-6e9fcccd51a4', // versión de «Libro de cocina 1» · 49 €
  printPack: '8559bb5e-3f26-48f6-8ac9-04d3db678c37',   // pack «Nutricion» = los dos volúmenes
}

// Nombres de tarjeta y de carrito: los ponemos aquí y no los tomamos de la BD.
// El diseño de esta landing es fijo (portado de Divi) y los nombres de la BD no
// describen el producto, así que mostrarlos confundiría al comprador.
const PRINT_TITLES = {
  vol1: 'Volumen 1',
  pack: 'Pack Vol. 1 y 2',
}

// Colores del diseño
const C = {
  print: '#FF690B',       // naranja de marca (impreso)
  printSoft: '#FFB489',   // naranja suave (bordes/líneas)
  digital: '#363C98',     // índigo (digital)
  digitalSoft: '#AFB1DD', // azul suave
  hero: '#363C98',        // índigo (bundle / mejor valor)
  heroText: '#2A2F78',
  grayEdge: '#d4d4d4',
}

function formatPrice(n) {
  if (n === null || n === undefined) return '—'
  const num = typeof n === 'string' ? parseFloat(n) : n
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace('.', ',')
}

function PricingCard({
  tag, tagColor, edgeOff, edgeOn, title, titleColor, price, per, save,
  desc, ctaLabel, ctaColor, badge, selected, onSelect, onCta, disabled, disabledLabel,
  selector,
}) {
  return (
    <div
      onClick={onSelect}
      tabIndex={0}
      style={{
        borderColor: selected ? edgeOn : edgeOff,
        boxShadow: selected ? `0 0 0 1px ${edgeOn}, 0 14px 32px rgba(0,0,0,.10)` : undefined,
      }}
      className={`relative flex flex-col bg-white border-2 rounded-[20px] px-6 py-7 text-center min-h-[340px] w-full max-w-[400px] sm:max-w-none cursor-pointer transition-all duration-300 ${
        selected ? '-translate-y-1' : 'hover:-translate-y-1 hover:shadow-xl'
      }`}
    >
      {badge && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: C.hero }}
        >
          {badge}
        </span>
      )}

      {/* Antetítulo con rayitas laterales */}
      <span
        className="flex items-center justify-center gap-2.5 text-[13px] font-bold tracking-[0.09em] uppercase mb-3.5"
        style={{ color: tagColor }}
      >
        <span className="w-7 h-[2px] rounded-full transition-colors duration-300" style={{ background: selected ? edgeOn : edgeOff }} />
        {tag}
        <span className="w-7 h-[2px] rounded-full transition-colors duration-300" style={{ background: selected ? edgeOn : edgeOff }} />
      </span>

      <h3 className="text-[22px] font-bold leading-tight mb-3.5" style={{ color: titleColor }}>
        {title}
      </h3>

      {selector}

      <div className="flex items-baseline justify-center gap-1 mb-1.5">
        <span className="text-lg font-semibold" style={{ color: tagColor }}>€</span>
        <span className="text-[40px] font-bold leading-none text-[#1f1f1f]">{price}</span>
        <span className="text-[13px] text-gray-500 ml-1">{per}</span>
      </div>

      {save && (
        <p className="text-[13px] mb-3">
          <s className="text-[#b7b7b7]">{save.before}</s> · <b className="text-[#1a8a5a] font-semibold">{save.label}</b>
        </p>
      )}

      <div
        className="border-t border-dashed my-3.5 transition-colors duration-300"
        style={{ borderColor: selected ? edgeOn : edgeOff }}
      />

      <p className="text-sm leading-relaxed text-gray-500 mb-5 flex-1">{desc}</p>

      <button
        onClick={(e) => { e.stopPropagation(); onCta() }}
        disabled={disabled}
        className={`block w-full text-white text-[15px] font-semibold py-3.5 px-3.5 rounded-[14px] transition-all duration-300 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-[1.02] active:scale-[0.98] hover:brightness-95 cursor-pointer'
        }`}
        style={{ background: ctaColor }}
      >
        {disabled ? disabledLabel : ctaLabel}
      </button>
    </div>
  )
}

export default function Shop() {
  const { addToCart, setDirectCheckoutItem, cart } = useCartStore()
  const { subscriptionType } = useAuthStore()
  const { peekCart } = useUiStore()

  const hasPermanent = subscriptionType === 'permanent'

  const [selectedCard, setSelectedCard] = useState('bundle')

  // Grupo «Biblioteca digital» del catálogo real (4 tramos: mensual /
  // trimestral / anual / de por vida) y tramo elegido en la tarjeta digital.
  const [bibGroup, setBibGroup] = useState(null)
  const [bibTier, setBibTier] = useState('permanente')

  // Productos físicos reales desde la API (volumen suelto y pack)
  const [vol1, setVol1] = useState(null)
  const [pack, setPack] = useState(null)
  const [bundle, setBundle] = useState(null)
  // Versión de PRUEBA del flujo de compra (solo existe mientras haya una
  // versión cuyo título empiece por 🧪 en el catálogo; al borrarla desaparece)
  const [testItem, setTestItem] = useState(null)

  React.useEffect(() => {
    // Catálogo de tramos de la biblioteca (con espejo local de respaldo).
    fetchTieredGroup('Biblioteca digital').then(setBibGroup).catch(() => {})

    async function fetchProducts() {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app'
        const [booksRes, packsRes] = await Promise.all([
          fetch(`${API}/api/v1/book/all`),
          fetch(`${API}/api/v1/book/packs`),
        ])
        const booksData = await booksRes.json()
        const packsData = await packsRes.json()

        // Versión de prueba del flujo de compra (🧪), si existe
        if (Array.isArray(booksData)) {
          for (const b of booksData) {
            const tv = (b.versions || []).find((v) => (v.version_title || '').startsWith('🧪'))
            if (tv) {
              setTestItem({
                id: tv.version_id,
                type: 'version',
                name: tv.version_title,
                price: tv.version_price,
                image: '/LibrosFisicos.png',
              })
              break
            }
          }
        }

        // Volumen 1 físico: se busca ENTRE TODOS los libros la versión cuyo
        // título case con "Vol(umen) 1" (admite "Vol. 1"); si ninguna versión
        // casa, vale también que case el título del libro. Si NO hay ningún
        // match NO se muestra un producto arbitrario: vol1 queda null y la
        // tarjeta se renderiza como «No disponible» (sin botón de compra), para
        // no meter al carrito un item equivocado de 1000 €. La 🧪 queda fuera.
        if (Array.isArray(booksData)) {
          const VOL1_RE = /vol(umen)?\.?\s*1/i
          const noTest = (v) => !(v.version_title || '').startsWith('🧪')

          let book = null
          let version = null
          // 1) por id real de producción
          for (const b of booksData) {
            const v = (b.versions || []).find((x) => x.version_id === PRINT_IDS.vol1Version)
            if (v) { book = b; version = v; break }
          }
          // 2) red de seguridad por nombre, por si el producto se recrea con otro id
          if (!version) {
            for (const b of booksData) {
              const versions = (b.versions || []).filter(noTest)
              const v = versions.find((x) => VOL1_RE.test(x.version_title || ''))
              if (v) { book = b; version = v; break }
              if (!book && VOL1_RE.test(b.title || '') && versions.length > 0) {
                book = b
                version = versions[0]
                // seguimos buscando por si otra versión casa directamente
              }
            }
          }

          if (version) {
            setVol1({
              id: version.version_id,
              type: 'version',
              name: PRINT_TITLES.vol1,
              price: version.version_price,
              image: version.version_image || book.image || '/LibrosFisicos.png',
            })
          } else {
            console.warn('[cocina] No se encontró el Volumen 1 físico en /book/all')
          }
        }

        if (Array.isArray(packsData) && packsData.length > 0) {
          // Solo packs a la venta. `GET /book/packs` NO filtra por is_active
          // (el back office usa ese mismo listado para gestionarlos, y ahí sí
          // hacen falta los apagados), así que el filtro va aquí. Sin esto, un
          // pack desactivado se seguiría anunciando en la landing y la compra
          // moriría con un 400 «Pack not found», porque el backend sí lo
          // excluye al cobrar.
          // `=== true` y no `!== false`: al cobrar, el backend filtra con
          // `andWhereNot('is_active', false)`, que en SQL descarta también los
          // NULL. Con `!== false` un pack con is_active NULL se anunciaría aquí
          // y moriría con un 400 al comprar — justo lo que este filtro evita.
          const alaVenta = packsData.filter((p) => p.is_active === true)

          // Pack impreso: primero por id real y, si ese id ya no existe, el que
          // se llame "Vol 1 y 2" (o "1 y 2" / "1 + 2"). Si NO hay match NO se
          // cae a un pack arbitrario: printPack queda undefined y la tarjeta se
          // muestra como «No disponible» (sin botón), para no meter al carrito
          // un pack equivocado.
          const printPack =
            alaVenta.find((p) => p.id === PRINT_IDS.printPack) ||
            alaVenta.find((p) => /vol.*1.*(y|\+).*2|1\s*y\s*2/i.test(p.name || ''))
          // El bundle (físico + digital) se identifica por nombre; hasta que
          // exista en el backend, la tarjeta se muestra como "muy pronto".
          // Nunca puede ser el pack impreso: son dos tarjetas distintas.
          const bundlePack = alaVenta.find(
            (p) => /todo|bundle|digital/i.test(p.name) && p.id !== printPack?.id
          )
          if (printPack) {
            setPack({
              id: printPack.id,
              type: 'pack',
              name: PRINT_TITLES.pack,
              price: parseFloat(printPack.price),
              image: printPack.image || '/LibrosFisicos.png',
            })
          } else {
            console.warn('[cocina] No se encontró el pack impreso en /book/packs')
          }
          if (bundlePack) {
            setBundle({
              id: bundlePack.id,
              type: 'pack',
              name: bundlePack.name,
              price: parseFloat(bundlePack.price),
              image: bundlePack.image || '/LibrosFisicos.png',
            })
          }
        }
      } catch (error) {
        console.error('Error cargando el catálogo:', error)
        toast.error('Error cargando el catálogo de libros')
      }
    }
    fetchProducts()
  }, [])

  const addPhysical = (product) => {
    if (!product) return
    if (cart.some((item) => item.isDirectCheckout)) {
      toast.error('Tu suscripción fue removida por seguridad (no se pueden mezclar productos físicos y suscripciones).', { duration: 5000 })
    }
    addToCart({
      id: product.id,
      type: product.type,
      name: `Libro Físico - ${product.name}`,
      price: product.price,
      image: product.image || '/LibrosFisicos.png',
    })
    // En vez de un toast, el carrito se asoma por la derecha como sugerencia:
    // un clic lo abre entero, un clic fuera lo retira. Menos invasivo que
    // abrirlo del todo en cada producto añadido.
    peekCart()
  }

  // Compra de la biblioteca con el tramo elegido: item de compra directa del
  // catálogo (mismo flujo que los cursos con tramos → checkout de la Fase 9/12).
  const buyBiblioteca = () => {
    if (!bibGroup || !bibGroup.tiers[bibTier]) return
    if (hasPermanent) {
      toast.error('Ya tienes el acceso de por vida activo.')
      return
    }
    if (cart.length > 0 && !cart.some((item) => item.isDirectCheckout)) {
      toast.error('Tus productos físicos fueron removidos por seguridad (no se pueden mezclar suscripciones y productos).', { duration: 5000 })
    }
    setDirectCheckoutItem(buildTierCartItem(bibGroup, bibTier))
    toast.success(`Biblioteca digital (${TIER_META[bibTier].label.toLowerCase()}) añadida al carrito`)
    peekCart()
  }

  const buyBundle = () => {
    if (bundle) {
      addPhysical(bundle)
    } else {
      toast('Disponible muy pronto 🙌', { icon: '⏳' })
    }
  }

  const bibTierData = bibGroup?.tiers?.[bibTier]
  const bibPer =
    bibTier === 'mensual' ? '/mes'
    : bibTier === 'trimestral' ? '/trimestre'
    : bibTier === 'anual' ? 'pago único · 12 meses'
    : 'pago único'

  // Selector de tramo 2×2 dentro de la tarjeta digital.
  const bibSelector = bibGroup ? (
    <div className="grid grid-cols-2 gap-1.5 bg-[#F3F2F9] rounded-2xl p-1.5 mb-4" role="tablist" aria-label="Modalidad de acceso a la biblioteca">
      {groupTierOrder(bibGroup).map((key) => {
        const active = key === bibTier
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={(e) => { e.stopPropagation(); setBibTier(key); setSelectedCard('digital') }}
            className={`rounded-xl py-1.5 text-[13px] font-bold transition-all cursor-pointer ${active ? 'bg-white shadow-sm' : 'hover:opacity-80'}`}
            style={{ color: active ? C.digital : '#8B87C9' }}
          >
            {TIER_META[key].label}
          </button>
        )
      })}
    </div>
  ) : null

  // El «antes» del bundle = pack impreso + biblioteca de por vida, con los
  // precios vivos cuando los hay (si falta alguno, el estático de siempre).
  const bundleBefore = pack && bundle && bibGroup?.tiers?.permanente
    ? pack.price + bibGroup.tiers.permanente.price
    : null
  const bundleSave = bundleBefore && bundleBefore > bundle.price
    ? { before: `${formatPrice(bundleBefore)} €`, label: `ahorras ${formatPrice(bundleBefore - bundle.price)} €` }
    : { before: '238 €', label: 'ahorras 79 €' }

  return (
    <section id="shop" className="py-16 px-4 bg-gray-50">
      <div className="max-w-[1120px] mx-auto">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#363C98] mb-2">
            Elige cómo quieres disfrutar de Cocina Squad Fit
          </h2>
          <p className="text-gray-500 text-base">
            Libros físicos, biblioteca digital de por vida, o todo junto.
          </p>
        </div>

        {/* Las 4 tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[18px] items-stretch justify-items-center sm:justify-items-stretch pt-4">

          {/* 1. Impreso Vol 1 (simple) */}
          <PricingCard
            tag="Impreso"
            tagColor={C.print}
            edgeOff={C.grayEdge}
            edgeOn={C.printSoft}
            title={PRINT_TITLES.vol1}
            titleColor={C.print}
            price={vol1 ? formatPrice(vol1.price) : '—'}
            per="+ envío"
            desc="El libro físico del Volumen 1, para tu cocina."
            ctaLabel="Comprar ahora"
            ctaColor={C.print}
            selected={selectedCard === 'vol1'}
            onSelect={() => setSelectedCard('vol1')}
            onCta={() => addPhysical(vol1)}
            disabled={!vol1}
            disabledLabel="No disponible"
          />

          {/* 2. Pack impreso (completa) */}
          <PricingCard
            tag="Impreso"
            tagColor={C.print}
            edgeOff={C.printSoft}
            edgeOn={C.print}
            title={PRINT_TITLES.pack}
            titleColor={C.print}
            price={pack ? formatPrice(pack.price) : '—'}
            per="+ envío"
            desc="Los dos volúmenes físicos en un solo pedido."
            ctaLabel="Comprar el pack"
            ctaColor={C.print}
            selected={selectedCard === 'pack'}
            onSelect={() => setSelectedCard('pack')}
            onCta={() => addPhysical(pack)}
            disabled={!pack}
            disabledLabel="No disponible"
          />

          {/* Tarjeta TEMPORAL de prueba del flujo de compra (0,05 €): solo se
              muestra mientras exista la versión 🧪 en el catálogo */}
          {testItem && (
            <PricingCard
              tag="Prueba"
              tagColor={C.print}
              edgeOff={C.grayEdge}
              edgeOn={C.printSoft}
              title={testItem.name}
              titleColor={C.print}
              price={formatPrice(testItem.price)}
              per="pago de prueba"
              desc="Tarjeta temporal para validar el flujo de compra completo."
              ctaLabel="Comprar prueba"
              ctaColor={C.print}
              selected={selectedCard === 'test'}
              onSelect={() => setSelectedCard('test')}
              onCta={() => addPhysical(testItem)}
            />
          )}

          {/* 3. Biblioteca digital con tramos (grupo real del catálogo) */}
          <PricingCard
            tag="Digital"
            tagColor={C.digital}
            edgeOff={C.grayEdge}
            edgeOn={C.digitalSoft}
            title="Biblioteca digital"
            titleColor={C.digital}
            selector={bibSelector}
            price={bibTierData ? formatPrice(bibTierData.price) : '—'}
            per={bibPer}
            desc="Toda la biblioteca: Vol. 1, 2, el 3 (próximamente) y futuros. Con 5 recetas nuevas cada semana."
            ctaLabel={bibTier === 'mensual' || bibTier === 'trimestral' ? 'Suscribirme' : bibTier === 'anual' ? 'Acceso anual' : 'Acceso de por vida'}
            ctaColor={C.digital}
            selected={selectedCard === 'digital'}
            onSelect={() => setSelectedCard('digital')}
            onCta={buyBiblioteca}
            disabled={hasPermanent || !bibTierData}
            disabledLabel={hasPermanent ? '✓ Ya lo tienes' : 'Cargando…'}
          />

          {/* 4. Bundle / hero (completa). Mientras el bundle no exista en el
              backend el botón no promete una compra que no se puede hacer:
              se anuncia como «próximamente» y al pulsarlo sale «muy pronto». */}
          <PricingCard
            tag="Impreso + Digital"
            tagColor={C.heroText}
            edgeOff={C.digitalSoft}
            edgeOn={C.hero}
            title="Lo quiero todo"
            titleColor={C.heroText}
            price={bundle ? formatPrice(bundle.price) : '159'}
            per="+ envío"
            save={bundleSave}
            desc="Los dos libros físicos + la biblioteca digital completa y siempre actualizada, para siempre."
            ctaLabel={bundle ? 'Lo quiero todo' : 'Muy pronto'}
            ctaColor={C.hero}
            badge={bundle ? 'Mejor valor' : 'Próximamente'}
            selected={selectedCard === 'bundle'}
            onSelect={() => setSelectedCard('bundle')}
            onCta={buyBundle}
          />

        </div>
      </div>
    </section>
  )
}
