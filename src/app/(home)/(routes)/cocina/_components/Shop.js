'use client'
import React, { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'react-hot-toast'

// Sección de precios de Cocina Squad Fit: 4 tarjetas
// (Impreso Vol 1 · Pack impreso · Digital de por vida · Bundle "Lo quiero todo").
// Diseño portado de la página Divi de WordPress; la compra va por el
// carrito/Stripe del proyecto, no por enlaces de WooCommerce.

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

const PERMANENT_PRICE = 149

function formatPrice(n) {
  if (n === null || n === undefined) return '—'
  const num = typeof n === 'string' ? parseFloat(n) : n
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace('.', ',')
}

function PricingCard({
  tag, tagColor, edgeOff, edgeOn, title, titleColor, price, per, save,
  desc, ctaLabel, ctaColor, badge, selected, onSelect, onCta, disabled, disabledLabel,
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

  const TIER_RANK = { monthly: 1, annual: 2, permanent: 3 }
  const currentTierRank = TIER_RANK[subscriptionType] || 0
  const hasPermanent = subscriptionType === 'permanent'

  const [selectedCard, setSelectedCard] = useState('bundle')

  // Productos físicos reales desde la API (volumen suelto y pack)
  const [vol1, setVol1] = useState(null)
  const [pack, setPack] = useState(null)
  const [bundle, setBundle] = useState(null)
  // Versión de PRUEBA del flujo de compra (solo existe mientras haya una
  // versión cuyo título empiece por 🧪 en el catálogo; al borrarla desaparece)
  const [testItem, setTestItem] = useState(null)

  React.useEffect(() => {
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
        // casa, vale también que case el título del libro. Solo si no hay
        // match se cae al comportamiento anterior (primera versión del primer
        // libro), que hoy trae un producto equivocado. La 🧪 queda fuera.
        if (Array.isArray(booksData)) {
          const VOL1_RE = /vol(umen)?\.?\s*1/i
          const noTest = (v) => !(v.version_title || '').startsWith('🧪')

          let book = null
          let version = null
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

          // Fallback: primer libro con alguna versión que no sea la de prueba
          if (!version) {
            const withVersion = booksData.find((b) => (b.versions || []).some(noTest))
            if (withVersion) {
              book = withVersion
              version = withVersion.versions.find(noTest)
            }
          }

          if (version) {
            setVol1({
              id: version.version_id,
              type: 'version',
              name: version.version_title || book.title,
              price: version.version_price,
              image: version.version_image || book.image || '/LibrosFisicos.png',
            })
          }
        }

        if (Array.isArray(packsData) && packsData.length > 0) {
          // El bundle (físico + digital) se identifica por nombre; hasta que
          // exista en el backend, la tarjeta se muestra como "muy pronto".
          const bundlePack = packsData.find((p) => /todo|bundle|digital/i.test(p.name))
          // Pack impreso: el que se llame "Vol 1 y 2" (o "1 y 2" / "1 + 2");
          // si no hay match, el fallback anterior (primer pack que no sea el
          // bundle), que hoy trae un pack equivocado.
          const printPack =
            packsData.find((p) => /vol.*1.*(y|\+).*2|1\s*y\s*2/i.test(p.name || '')) ||
            packsData.find((p) => p !== bundlePack) ||
            packsData[0]
          if (printPack) {
            setPack({
              id: printPack.id,
              type: 'pack',
              name: printPack.name,
              price: parseFloat(printPack.price),
              image: printPack.image || '/LibrosFisicos.png',
            })
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
    toast.success('Añadido al carrito')
  }

  const buyDigitalPermanent = () => {
    if (hasPermanent) {
      toast.error('Ya tienes el acceso de por vida activo.')
      return
    }
    if (cart.length > 0 && !cart.some((item) => item.isDirectCheckout)) {
      toast.error('Tus productos físicos fueron removidos por seguridad (no se pueden mezclar suscripciones y productos).', { duration: 5000 })
    }
    setDirectCheckoutItem({
      id: 'digital-permanent',
      name: 'Suscripción Digital - Permanente',
      price: PERMANENT_PRICE,
      image: '/Group32.png',
      endpoint: '/api/v1/book/create-payment-intent-digital',
      payload: { subscription_type: 'permanent' },
    })
    toast.success(currentTierRank > 0 ? 'Upgrade añadido al carrito' : 'Acceso de por vida añadido al carrito')
  }

  const buyBundle = () => {
    if (bundle) {
      addPhysical(bundle)
    } else {
      toast('Disponible muy pronto 🙌', { icon: '⏳' })
    }
  }

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
            title={vol1 ? vol1.name : 'Volumen 1'}
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
            title={pack ? pack.name : 'Pack Vol. 1 y 2'}
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

          {/* 3. Digital de por vida (simple) */}
          <PricingCard
            tag="Digital"
            tagColor={C.digital}
            edgeOff={C.grayEdge}
            edgeOn={C.digitalSoft}
            title="Digital de por vida"
            titleColor={C.digital}
            price={formatPrice(PERMANENT_PRICE)}
            per="pago único"
            desc="Toda la biblioteca, ahora y siempre: Vol. 1, 2, el 3 (próximamente) y futuros. Recetas siempre actualizadas."
            ctaLabel={currentTierRank > 0 && !hasPermanent ? 'Mejorar a de por vida' : 'Acceso de por vida'}
            ctaColor={C.digital}
            selected={selectedCard === 'digital'}
            onSelect={() => setSelectedCard('digital')}
            onCta={buyDigitalPermanent}
            disabled={hasPermanent}
            disabledLabel="✓ Ya lo tienes"
          />

          {/* 4. Bundle / hero (completa) */}
          <PricingCard
            tag="Impreso + Digital"
            tagColor={C.heroText}
            edgeOff={C.digitalSoft}
            edgeOn={C.hero}
            title="Lo quiero todo"
            titleColor={C.heroText}
            price={bundle ? formatPrice(bundle.price) : '159'}
            per="+ envío"
            save={{ before: '238 €', label: 'ahorras 79 €' }}
            desc="Los dos libros físicos + la biblioteca digital completa y siempre actualizada, para siempre."
            ctaLabel="Lo quiero todo"
            ctaColor={C.hero}
            badge="Mejor valor"
            selected={selectedCard === 'bundle'}
            onSelect={() => setSelectedCard('bundle')}
            onCta={buyBundle}
          />

        </div>
      </div>
    </section>
  )
}
