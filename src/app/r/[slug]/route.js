// /r/<slug> — redirecciones cortas gestionadas desde el back office (13.7).
// Consulta GET {API}/api/v1/redirects/{slug} y responde con un 302 real al
// destino. El endpoint del backend llega con la Fase 6 (en paralelo): hasta
// que exista, REDIRECTS_API_READY queda en false y servimos un 404 amable sin
// tocar la red. Para encenderlo: poner true y listo.

const REDIRECTS_API_READY = false;

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// Página 404 amable con la marca (este route handler no puede usar JSX).
function notFoundPage(slug) {
  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Enlace no encontrado · Squad Fit</title>
  <style>
    body { margin: 0; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #F8F9FC;
           min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border-radius: 28px; box-shadow: 0 10px 40px rgba(54,60,152,.08);
            padding: 48px 40px; max-width: 420px; margin: 24px; text-align: center; }
    .emoji { font-size: 56px; margin-bottom: 12px; }
    h1 { color: #363C98; font-size: 26px; margin: 0 0 12px; }
    p { color: #64748B; line-height: 1.6; margin: 0 0 28px; }
    code { background: #F1F2FC; color: #363C98; border-radius: 8px; padding: 2px 8px; font-size: 14px; }
    a { display: inline-block; background: #FF690B; color: #fff; text-decoration: none; font-weight: 700;
        padding: 14px 32px; border-radius: 16px; }
    a:hover { background: #e05b08; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🔗</div>
    <h1>Este enlace no existe (aún)</h1>
    <p>No encontramos el enlace corto <code>/r/${slug}</code>. Puede que esté mal
       escrito o que ya no esté activo.</p>
    <a href="/">Ir a squatfit.es</a>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(request, { params }) {
  const { slug } = await params;
  const clean = String(slug || '').trim();

  if (!REDIRECTS_API_READY || !clean) return notFoundPage(clean || '');

  try {
    const res = await fetch(`${API}/api/v1/redirects/${encodeURIComponent(clean)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return notFoundPage(clean);
    const data = await res.json();
    const destination = data?.destination || data?.url || data?.target;
    if (!destination) return notFoundPage(clean);
    return Response.redirect(destination, 302);
  } catch {
    return notFoundPage(clean);
  }
}
