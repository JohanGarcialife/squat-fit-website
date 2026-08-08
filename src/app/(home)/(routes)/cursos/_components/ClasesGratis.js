import React from 'react';
import Link from 'next/link';
import { Unlock } from 'lucide-react';

/**
 * «Pruébalo antes de pagar» — contar en el escaparate algo que ya se regala.
 *
 * POR QUÉ EXISTE. Medido el 4-ago y confirmado el 8: cada uno de los seis cursos
 * tiene DOS clases marcadas como muestra gratuita —doce en total, y siempre las
 * primeras: «Clase 01. Intro», «Fundamentos de la nutrición», «Movilidad del
 * tren superior»—. El panel privado ya las respeta y las abre a quien no ha
 * comprado. Pero /cursos no lo mencionaba en ningún sitio: cero apariciones de
 * «gratis» en el HTML servido.
 *
 * O sea que el producto regalaba doce clases y el escaparate se lo callaba, que
 * es la peor combinación posible: se paga el coste de regalarlas y no se cobra
 * el beneficio de que alguien entre por ellas.
 *
 * EL COPY DICE «CON TU CUENTA» A PROPÓSITO, y es lo que más cuidado tuvo.
 * Comprobado en el backend: `course.module.ts` deja fuera del token solo
 * `course/all`, `course/detail/:id` y `course/answer-types`. Ver el vídeo NO está
 * en esa lista, y la lógica de muestra (`if (!isAdmin && !isTutor &&
 * !isFreeSample)`) salta la comprobación de COMPRA, no la de SESIÓN. Así que la
 * muestra se ve con una cuenta gratuita sin haber comprado, pero no sin cuenta.
 * Prometer «míralas ahora» sería mentir en la cara de quien llega, y a los tres
 * clics se daría cuenta.
 *
 * SE RESUELVE EN EL SERVIDOR, y esto se cambió a propósito. La primera versión
 * era `'use client'` con `useEffect`, y el texto no salía en el HTML: no lo veía
 * Google, no lo veía quien tuviera el JS lento, y aparecía de golpe un segundo
 * después. Para un bloque cuyo único trabajo es que alguien se registre, no
 * estar en el HTML es no existir la mitad de las veces. Ahora el dato se pide
 * al renderizar en servidor y viaja ya escrito en la página.
 *
 * EL NÚMERO SE PREGUNTA, NO SE ESCRIBE. Hoy son dos en todos los cursos, pero un
 * «2» a mano empieza a mentir el día que alguien marque una tercera desde el back
 * office. `GET /api/v1/course/all` es público y devuelve `free_sample_count`
 * desde el 3-ago, o sea el mismo sitio del que ya lo lee el panel.
 *
 * SI FALLA, NO SE PINTA NADA. Mismo criterio que el panel: sin datos no se
 * inventa una promesa. Y con `revalidate` de una hora, un backend frío no frena
 * la página más de una vez.
 */
async function cuantasMuestrasPorCurso() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

  try {
    const res = await fetch(`${API}/api/v1/course/all`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 0;

    const datos = await res.json();
    const cursos = Array.isArray(datos) ? datos : datos?.courses || [];

    // El MÍNIMO, no el máximo ni la suma: es lo que se puede prometer de
    // cualquier curso que elija quien está leyendo. Si un curso tuviera una
    // sola muestra, decir «dos» sería falso justo para ese.
    const recuentos = cursos
      .map((c) => c?.free_sample_count)
      .filter((n) => typeof n === 'number');

    if (recuentos.length === 0) return 0;
    return Math.min(...recuentos);
  } catch {
    return 0;
  }
}

export default async function ClasesGratis() {
  const porCurso = await cuantasMuestrasPorCurso();
  if (!porCurso) return null;

  const clases = porCurso === 1 ? 'la primera clase' : `las ${porCurso} primeras clases`;

  return (
    <div className="px-3 md:px-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-2xl bg-[#FFF4EC] px-6 py-8 text-center md:flex-row md:gap-6 md:px-10 md:text-left">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
          <Unlock className="h-7 w-7 text-[#EE7C39]" aria-hidden="true" />
        </span>

        <div className="flex-1">
          <p className="text-xl font-bold text-[#2F2A95] md:text-2xl">Pruébalo antes de pagar</p>
          <p className="mt-1 text-base text-black md:text-lg">
            Crea tu cuenta gratis y mira {clases} de cada curso. Sin pagar nada y sin
            compromiso: si no te convence, no sigues.
          </p>
        </div>

        <Link
          href="/register"
          className="shrink-0 rounded-full bg-[#2F2A95] px-8 py-3 text-base font-bold text-white transition hover:opacity-90"
        >
          Crear mi cuenta
        </Link>
      </div>
    </div>
  );
}
