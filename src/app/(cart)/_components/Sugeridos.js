'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { buildTierCartItem, formatEuros, groupTierOrder } from '@/app/components/courseCatalog';

/** Dónde se apunta lo que el cliente miró y no compró, en ESTA visita. */
const CLAVE_VISTOS = 'sf_vistos';

/**
 * Deja constancia de que el cliente ha mirado un producto.
 *
 * `sessionStorage` y no `localStorage` a propósito: lo que miró hace tres
 * semanas no dice nada de lo que quiere hoy, y guardar un historial de
 * navegación permanente para sugerir un libro es desproporcionado. Al cerrar la
 * pestaña desaparece.
 */
export function anotarVisto(base) {
  if (!base?.baseName) return;
  try {
    const previos = JSON.parse(sessionStorage.getItem(CLAVE_VISTOS) || '[]');
    const sinRepetir = [base.baseName, ...previos.filter((n) => n !== base.baseName)];
    sessionStorage.setItem(CLAVE_VISTOS, JSON.stringify(sinRepetir.slice(0, 8)));
  } catch {
    /* modo incógnito con almacenamiento capado: sugerir es opcional */
  }
}

/**
 * «Por solo X € más, llévate también…»
 *
 * ── A quién se le enseña qué ────────────────────────────────────────────────
 *
 * Primero, lo que MIRÓ en esta visita y no añadió: es lo único que sabemos con
 * certeza que le interesaba. Si no miró nada, los más vendidos.
 *
 * ── Por qué «por solo X € más» y no el precio a secas ───────────────────────
 *
 * Es el mismo número dicho desde donde el cliente ya está. Ha decidido gastar
 * 187 €; «39,90 €» le pide una decisión nueva, «por 39,90 € más» la encuadra
 * como un añadido a la que ya tomó. Y el precio es el real: no hay descuento
 * inventado, que es lo que convierte esto en un truco.
 *
 * ── Cuándo NO aparece ───────────────────────────────────────────────────────
 *
 * Con el carrito vacío (no hay a qué añadir), y nunca se sugiere algo que ya
 * esté dentro. Tampoco se insiste: una sola tarjeta, no una parrilla.
 */
export default function Sugeridos({ catalogo, className = '' }) {
  const { cart, setDirectCheckoutItem, addToCart } = useCartStore();
  const [vistos, setVistos] = useState([]);

  useEffect(() => {
    try {
      setVistos(JSON.parse(sessionStorage.getItem(CLAVE_VISTOS) || '[]'));
    } catch {
      setVistos([]);
    }
  }, []);

  const sugerido = useMemo(() => {
    if (!cart.length || !catalogo?.length) return null;
    const yaEsta = (base) =>
      cart.some((i) => i.tierGroup?.baseName === base || i.name?.startsWith(base));

    const candidatos = catalogo.filter((g) => !yaEsta(g.baseName));
    if (!candidatos.length) return null;

    // 1) Lo que miró en esta visita y no se llevó.
    for (const nombre of vistos) {
      const visto = candidatos.find((g) => g.baseName === nombre);
      if (visto) return visto;
    }
    // 2) Si no miró nada, el primero del catálogo — que la web ya ordena por
    //    lo que más se vende.
    return candidatos[0];
  }, [cart, catalogo, vistos]);

  if (!sugerido) return null;

  // El tramo más barato: la sugerencia tiene que sonar a «un poco más», no a
  // duplicar el pedido.
  //
  // OJO: `tiers` es un OBJETO indexado por tramo ('mensual', 'anual'…), no una
  // lista. Recorrerlo como array devuelve vacío y la sugerencia no se pinta —
  // sin error, sin nada: simplemente no aparece nunca.
  const clavesTramo = groupTierOrder(sugerido);
  const tramoClave = clavesTramo
    .slice()
    .sort((a, b) => sugerido.tiers[a].price - sugerido.tiers[b].price)[0];
  const tramo = tramoClave ? { ...sugerido.tiers[tramoClave], tier: tramoClave } : null;
  if (!tramo) return null;

  const anadir = () => {
    const item = buildTierCartItem(sugerido, tramo.tier);
    // `addToCart` y no `setDirectCheckoutItem`: este último SUSTITUYE el
    // carrito, que es lo correcto al elegir tramo desde la ficha y lo
    // exactamente contrario a lo que se quiere aquí.
    addToCart(item);
  };

  return (
    <div
      className={`rounded-2xl border border-orange-200 bg-orange-50/50 p-4 flex items-center gap-4 ${className}`}
    >
      {sugerido.image && (
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
          <Image src={sugerido.image} alt="" fill sizes="48px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-600">
          Por solo{' '}
          <span className="font-bold text-orange-600">{formatEuros(tramo.price)} más</span>,
          llévate también
        </p>
        <p className="font-bold text-indigo-900 truncate">{sugerido.baseName}</p>
      </div>
      <button
        type="button"
        onClick={anadir}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-orange-600 active:scale-95 cursor-pointer"
      >
        <Plus size={16} strokeWidth={3} />
        Añadir
      </button>
    </div>
  );
}
