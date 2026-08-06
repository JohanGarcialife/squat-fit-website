import { NextResponse } from 'next/server';

/**
 * Qué versión está desplegada AHORA MISMO.
 *
 * Sirve para detectar pestañas viejas: el navegador guarda la página en su
 * caché de atrás/adelante (bfcache) cuando te vas a otro sitio —por ejemplo al
 * pagar, que sale de nuestro dominio— y al volver la restaura tal cual estaba,
 * sin pedir nada al servidor. Si entre medias se ha desplegado, lo que se ve
 * es la web anterior, y así se queda hasta que se recarga a mano. Comparando
 * esto con la versión que lleva incrustada el bundle cargado se sabe si la
 * pestaña se quedó atrás (ver RecargaSiHayDespliegue.js).
 *
 * `force-dynamic` + `no-store`: si esto se cachea deja de responder a la
 * pregunta que se le hace, que es justamente cuál es la versión de ahora.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { id: process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || 'dev' },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
