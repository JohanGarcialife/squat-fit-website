'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Beef, Clock, Flame, Users } from 'lucide-react';
import FreeSampleBadge from '@/app/components/FreeSampleBadge';
import { etiquetasDe } from '@/app/components/recetarioTaxonomia';

// Mismo criterio que el resto de Mi cocina para imágenes que llegan sucias.
export function urlDeImagen(url) {
  if (!url) return '/group32.png';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

// `recipe.kcal` es texto libre (la columna que sirve el backend es
// `description`): a veces "350", a veces "350 kcal" ya escrito.
export function formatoKcal(kcal) {
  if (kcal === null || kcal === undefined) return null;
  const texto = String(kcal).trim();
  if (!texto) return null;
  return /^\d+$/.test(texto) ? `${texto} kcal` : texto;
}

// 19 de las 149 recetas no traen ninguno de los dos tiempos: en esas no se
// pinta el reloj en vez de enseñar un «0 min» que no dice nada.
export function minutosTotales(receta) {
  const total = (Number(receta?.time_to_prepare) || 0) + (Number(receta?.time_to_cook) || 0);
  return total > 0 ? `${total} min` : null;
}

// Proteínas por ración, tal cual las sirve el backend en `nutritional_value`
// (número pelado casi siempre: "23", a veces "23 g"). Se enseña junto a las
// kcal porque es el dato por el que se elige una receta en un programa de
// fuerza, y hasta ahora había que entrar en la ficha para verlo.
export function formatoProteinas(receta) {
  const valor = receta?.nutritional_value?.proteins;
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === '0') return null;
  // El backend manda casi siempre el número pelado («23»), pero a veces con la
  // unidad ya escrita («23 g»). Se acepta cualquiera de los dos: con el patrón
  // estricto de antes, las que traían «23 g» se escapaban del formato y salían
  // con un aspecto distinto al resto en la misma rejilla.
  const soloNumero = texto.match(/^([\d.,]+)\s*g?$/i);
  if (!soloNumero) return texto;
  // «P: 30 g», no «30.4 g prot.».
  //
  // Va en la tarjeta, al lado de las kcal y con el nombre de la receta al
  // lado: el sitio con menos ancho de todo el panel. La abreviatura y el
  // redondeo lo dejan en la mitad de caracteres, y el decimal no aporta —
  // nadie elige una receta por 0,4 g de proteína.
  //
  // Se redondea, no se trunca: 30,6 es más 31 que 30. La coma decimal española
  // se cambia por punto antes de convertir, porque `Number('30,6')` es NaN y
  // habría dejado la tarjeta sin el dato.
  const numero = Number(soloNumero[1].replace(',', '.'));
  if (!Number.isFinite(numero)) return texto;
  return `P: ${Math.round(numero)} g`;
}

function Datos({ receta, className = '' }) {
  const kcal = formatoKcal(receta.kcal);
  const proteinas = formatoProteinas(receta);
  const tiempo = minutosTotales(receta);
  const raciones = Number(receta.racion) > 0 ? Number(receta.racion) : null;
  if (!kcal && !proteinas && !tiempo && !raciones) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold ${className}`}>
      {kcal && (
        <span className="inline-flex items-center gap-1 text-[#FF690B]">
          <Flame className="w-3.5 h-3.5" /> {kcal}
        </span>
      )}
      {proteinas && (
        <span className="inline-flex items-center gap-1 text-[#363C98]">
          <Beef className="w-3.5 h-3.5" /> {proteinas}
        </span>
      )}
      {tiempo && (
        <span className="inline-flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5" /> {tiempo}
        </span>
      )}
      {raciones && (
        <span className="inline-flex items-center gap-1 text-slate-400">
          <Users className="w-3.5 h-3.5" /> {raciones}
        </span>
      )}
    </div>
  );
}

function Etiquetas({ taxonomia, max = 3 }) {
  const etiquetas = etiquetasDe(taxonomia).slice(0, max);
  if (!etiquetas.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {etiquetas.map((e) => (
        <span
          key={e.id}
          className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#F1F0FB] text-[#363C98]/70 px-2 py-0.5"
        >
          {e.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Una receta, en rejilla o en lista.
 *
 * La foto va SIEMPRE en 3:4 vertical, en los dos formatos: todas las fotos del
 * libro son verticales y cualquier hueco apaisado les corta el plato por
 * arriba y por abajo. En la lista eso significa una miniatura estrecha y alta
 * al lado del texto, no un cuadrado.
 */
export default function TarjetaReceta({ receta, taxonomia, href, onClick, vista = 'rejilla' }) {
  if (vista === 'lista') {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="group flex items-stretch gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <div className="relative w-[84px] sm:w-[100px] shrink-0 aspect-[3/4] bg-[#FFF6F0]">
          <Image
            src={urlDeImagen(receta.image)}
            alt={receta.name || 'Receta'}
            fill
            sizes="100px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-1.5 py-3 pr-4 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[#363C98] font-bold leading-snug group-hover:text-[#FF690B] transition-colors">
              {receta.name || 'Receta'}
            </h3>
            {receta.is_free_sample && <FreeSampleBadge />}
          </div>
          <Datos receta={receta} />
          <Etiquetas taxonomia={taxonomia} max={4} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex flex-col rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FFF6F0]">
        <Image
          src={urlDeImagen(receta.image)}
          alt={receta.name || 'Receta'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {receta.is_free_sample && <FreeSampleBadge className="absolute top-3 left-3" />}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-[#363C98] font-bold leading-snug line-clamp-2 group-hover:text-[#FF690B] transition-colors">
          {receta.name || 'Receta'}
        </h3>
        <Datos receta={receta} />
        <Etiquetas taxonomia={taxonomia} />
      </div>
    </Link>
  );
}
