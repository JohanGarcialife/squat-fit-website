import { NextResponse } from 'next/server';

/**
 * País de la IP de quien está mirando la página, para PRESELECCIONAR el
 * selector del formulario de prellamada.
 *
 * Lo da Vercel gratis en la cabecera `x-vercel-ip-country` (ISO-3166 alfa-2):
 * no hay que contratar ninguna GeoIP ni meter una base de datos en el bundle.
 * En local esa cabecera no existe y se devuelve `null`, que el formulario
 * entiende como «no preseleccionar nada».
 *
 * Es una PISTA, no un dato: con VPN o con el móvil en itinerancia se equivoca,
 * así que el selector queda editable y lo que se guarda es lo que deje la
 * persona. Por eso tampoco se manda al backend desde aquí — el backend recibe
 * el país que ella confirmó, no el que adivinamos.
 *
 * `no-store`: si esto se cachea, el primer visitante le fija el país a todos
 * los demás. Es el fallo clásico de geolocalizar en el borde y no se vería en
 * pruebas, solo en producción y con leads reales.
 */
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const iso = request.headers.get('x-vercel-ip-country');
  return NextResponse.json(
    { iso: iso && /^[A-Za-z]{2}$/.test(iso) ? iso.toUpperCase() : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
