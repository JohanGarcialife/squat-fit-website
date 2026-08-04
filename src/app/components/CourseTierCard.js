'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/stores/cart.store';
import { useUiStore } from '@/stores/ui.store';
import SequraSimulador from './SequraSimulador';
import Link from 'next/link';
import {
  TIER_META,
  buildTierCartItem,
  coverForCourse,
  formatEuros,
  groupTierOrder,
  usuarioYaTiene,
} from './courseCatalog';
import { useProgramAccess } from './useProgramAccess';

// UNA tarjeta por curso con el selector Mensual / Anual / De por vida (15.1):
// mensual = suscripción X €/mes; anual = pago único con 12 meses de acceso;
// permanente = pago único con acceso para siempre. `group` viene de
// groupTieredProducts()/fetchTieredCourses().
export default function CourseTierCard({ group, defaultTier = 'anual', subtitle, goToCart = true }) {
  const tierKeys = groupTierOrder(group);
  const [tierKey, setTierKey] = useState(group.tiers[defaultTier] ? defaultTier : tierKeys[0]);
  const { setDirectCheckoutItem, cart } = useCartStore();
  const { peekCart } = useUiStore();
  const router = useRouter();

  const tier = group.tiers[tierKey];
  const meta = TIER_META[tierKey];

  // ¿Ya lo tiene? Sin sesión, useProgramAccess no llama a nada, así que el
  // visitante anónimo no paga ni una petición por esto.
  //
  // El aviso NO bloquea la compra, y es a propósito. Comprobado el 3-ago: el
  // checkout de catálogo no mira la propiedad y el webhook concede con
  // onConflict→ignore, así que hoy alguien puede pagar dos veces el mismo curso
  // y no recibir nada nuevo, sin un solo aviso. Pero impedirlo del todo mataría
  // el paso de mensual a permanente, que es una venta legítima. Así que se
  // informa y se le ofrece ir a su curso; decidir él.
  const { courses, checked } = useProgramAccess();
  const yaLoTiene = checked && usuarioYaTiene(courses, group.baseName);

  const handleBuy = () => {
    if (cart.length > 0 && !cart.some((item) => item.isDirectCheckout)) {
      toast.error('Tus productos físicos fueron removidos por seguridad (no se pueden mezclar suscripciones y productos de pago único).', { duration: 5000 });
    }
    setDirectCheckoutItem(buildTierCartItem(group, tierKey));
    toast.success(`${group.baseName} (${meta.label.toLowerCase()}) añadido al carrito`);
    if (goToCart) router.push('/cart?step=1');
    else peekCart();
  };

  return (
    <div className="flex flex-col bg-white border-2 border-slate-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-full max-w-md">
      {/* Portada */}
      {/* Cuadrada, no 16/9: las portadas son verticales y en apaisado se les
          cortaba la cabeza y el pie. `contain` sobre el degradado de marca las
          enseña enteras en vez de recortarlas. */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-[#363C98]/10 to-[#FF690B]/10">
        <Image
          src={coverForCourse(group.baseName)}
          alt={group.baseName}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-contain"
        />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <p className="text-[#FF690B] text-xs font-bold uppercase tracking-widest mb-1.5">Curso</p>
        <h3 className="text-[#363C98] text-2xl font-extrabold leading-tight mb-1">{group.baseName}</h3>
        {subtitle && <p className="text-slate-400 text-sm mb-2">{subtitle}</p>}

        {/* Selector de tramo (2×2 si el grupo trae el trimestral, p. ej. la
            Biblioteca digital; 3 en línea para los cursos) */}
        <div className={`grid ${tierKeys.length === 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 bg-[#F3F2F9] rounded-2xl p-1.5 mt-4`} role="tablist" aria-label="Modalidad de acceso">
          {tierKeys.map((key) => {
            const active = key === tierKey;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTierKey(key)}
                className={`rounded-xl py-2 text-sm font-bold transition-all cursor-pointer ${
                  active ? 'bg-white text-[#363C98] shadow-sm' : 'text-[#8B87C9] hover:text-[#363C98]'
                }`}
              >
                {TIER_META[key].label}
              </button>
            );
          })}
        </div>

        {/* Precio del tramo activo */}
        <div className="flex items-baseline gap-1.5 mt-5">
          <span className="text-[#363C98] text-4xl font-extrabold leading-none">{formatEuros(tier.price)}</span>
          <span className="text-[#8B87C9] font-bold">{meta.priceSuffix}</span>
        </div>
        <p className="text-slate-500 text-sm font-semibold mt-1.5">{meta.note}</p>

        {yaLoTiene && (
          <div className="mt-6 rounded-2xl bg-[#F3F2F9] border border-[#363C98]/15 p-4 text-left">
            <p className="text-[#363C98] font-bold text-sm">Ya tienes este curso</p>
            <p className="text-slate-500 text-sm mt-0.5">
              Puedes verlo en tu panel. Si compras otra vez, pagarás de nuevo sin
              añadir nada.
            </p>
            <Link
              href="/panel-cursos"
              className="inline-block mt-2 text-[#FF690B] font-bold text-sm hover:underline"
            >
              Ir a mis cursos →
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={handleBuy}
          className={`w-full font-bold py-3.5 rounded-2xl text-base active:scale-[0.98] transition-all shadow-md cursor-pointer ${
            yaLoTiene
              ? 'mt-3 bg-white text-[#363C98] border-2 border-[#363C98] hover:bg-[#F3F2F9]'
              : 'mt-6 bg-[#363C98] hover:bg-[#2c317c] text-white'
          }`}
        >
          {tierKey === 'mensual' || tierKey === 'trimestral' ? 'Suscribirme' : 'Comprarlo'}
        </button>

        {/* Simulador de cuotas de seQura, DESPUÉS del botón de compra.
            Estaba justo debajo de «Pago único · 12 meses de acceso», y las dos
            líneas seguidas se contradecían: «pago único» e inmediatamente «18,06 €
            al mes». Quien lee rápido no sabe cuál de las dos aplica.
            Ahora el bloque del precio dice una sola cosa —lo que cuesta y qué
            incluye—, y el fraccionado aparece después del botón, como lo que es:
            una alternativa para quien ya ha decidido comprar.

            Solo en los tramos de PAGO ÚNICO: «anual» y «permanente». En mensual
            y trimestral no, porque seQura fracciona un importe cerrado y una
            suscripción no lo es — anunciar cuotas ahí sería prometer algo que el
            checkout no puede cumplir. */}
        <SequraSimulador
          importeEur={tier.price}
          pagoUnico={tierKey !== 'mensual' && tierKey !== 'trimestral'}
          className="mt-3"
        />
      </div>
    </div>
  );
}
