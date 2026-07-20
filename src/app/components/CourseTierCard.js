'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/stores/cart.store';
import { useUiStore } from '@/stores/ui.store';
import {
  TIER_META,
  TIER_ORDER,
  buildTierCartItem,
  coverForCourse,
  formatEuros,
} from './courseCatalog';

// UNA tarjeta por curso con el selector Mensual / Anual / De por vida (15.1):
// mensual = suscripción X €/mes; anual = pago único con 12 meses de acceso;
// permanente = pago único con acceso para siempre. `group` viene de
// groupTieredProducts()/fetchTieredCourses().
export default function CourseTierCard({ group, defaultTier = 'anual', subtitle, goToCart = true }) {
  const [tierKey, setTierKey] = useState(group.tiers[defaultTier] ? defaultTier : TIER_ORDER[0]);
  const { setDirectCheckoutItem, cart } = useCartStore();
  const { peekCart } = useUiStore();
  const router = useRouter();

  const tier = group.tiers[tierKey];
  const meta = TIER_META[tierKey];

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
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#363C98]/10 to-[#FF690B]/10">
        <Image
          src={coverForCourse(group.baseName)}
          alt={group.baseName}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <p className="text-[#FF690B] text-xs font-bold uppercase tracking-widest mb-1.5">Curso</p>
        <h3 className="text-[#363C98] text-2xl font-extrabold leading-tight mb-1">{group.baseName}</h3>
        {subtitle && <p className="text-slate-400 text-sm mb-2">{subtitle}</p>}

        {/* Selector de tramo */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F3F2F9] rounded-2xl p-1.5 mt-4" role="tablist" aria-label="Modalidad de acceso">
          {TIER_ORDER.map((key) => {
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

        <button
          type="button"
          onClick={handleBuy}
          className="mt-6 w-full bg-[#363C98] hover:bg-[#2c317c] text-white font-bold py-3.5 rounded-2xl text-base active:scale-[0.98] transition-all shadow-md cursor-pointer"
        >
          {tierKey === 'mensual' ? 'Suscribirme' : 'Comprarlo'}
        </button>
      </div>
    </div>
  );
}
