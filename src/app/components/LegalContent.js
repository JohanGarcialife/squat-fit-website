'use client';

import React from 'react';
import { LEGAL_DATA } from './legalData';

// Contenido legal compartido entre la web pública (/politicas) y el panel del
// cliente (panel-info). Los textos reales del cliente están en legalData.js
// (migrados de squatfit.es); aquí van el renderer, el índice y el callout.
// Titular: Squat Fit, S.L.U. · NIF B19463066.

const COMPANY = [
  ['Razón social', 'Squat Fit, S.L.U.'],
  ['NIF', 'B19463066'],
  ['Domicilio', 'Av. Maisonnave 41, 3 B'],
  ['C. Postal', '03003'],
  ['Ciudad', 'Alicante, España'],
  ['Teléfono', '+34 623 020 494'],
  ['Correo', 'hola@squatfit.es'],
];

// Callout destacado con los datos de empresa (imita el bloque resaltado de squatfit.es).
export function CompanyCallout({ title = 'Datos de la empresa' }) {
  return (
    <div className="my-6 rounded-2xl border border-[#363C98]/15 bg-[#F1F2FC] p-5 sm:p-6">
      <p className="text-[#363C98] font-bold text-xs uppercase tracking-[0.12em] mb-4">{title}</p>
      <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-2">
        {COMPANY.map(([k, v]) => (
          <div key={k} className="flex gap-3 text-sm sm:text-[15px]">
            <dt className="text-gray-500 w-24 flex-shrink-0">{k}</dt>
            <dd className="text-gray-800 font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const H1 = ({ children }) => (
  <h1 className="text-2xl sm:text-3xl font-bold text-[#363C98] tracking-tight mb-2">{children}</h1>
);

// Formato en línea: negrita (**texto**) y enlaces markdown ([texto](url)).
function inline(s, key) {
  return String(s).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={`${key}-${i}`} className="text-gray-800 font-semibold">{p.slice(2, -2)}</strong>;
    }
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={`${key}-${i}`} href={link[2]} target="_blank" rel="noopener noreferrer"
           className="text-[#FF690B] font-medium underline underline-offset-2 hover:text-[#363C98] transition-colors break-words">
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={`${key}-${i}`}>{p}</React.Fragment>;
  });
}

// Si un título viene TODO EN MAYÚSCULAS, lo pasamos a mayúscula inicial (menos
// gritón). Los que ya traen minúsculas (p. ej. "1. Aceptación") se dejan igual.
function tidyHeading(s) {
  const t = s.trim();
  if (/[a-záéíóúñü]/.test(t)) return t;
  return t.toLowerCase().replace(/[a-záéíóúñü]/, (c) => c.toUpperCase());
}

// Ancla legible a partir del título.
function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 40);
}

// Renderer markdown-ligero: "## " → h2 (con ancla), "- "/"* " → lista, resto →
// párrafo. Devuelve { toc, body } para poder construir el índice de la pestaña.
function renderPolicy(text, prefix) {
  const toc = [];
  let hn = 0; // contador de apartados: numeramos todas las políticas por igual
  const body = text.trim().split(/\n{2,}/).map((block, i) => {
    const lines = block.split('\n');
    if (lines[0].startsWith('## ')) {
      hn += 1;
      // Quitamos cualquier número que ya trajera el original y ponemos el nuestro,
      // así Aviso/Privacidad/Cookies quedan numerados igual que Términos/Devoluciones.
      const raw = tidyHeading(lines[0].slice(3)).replace(/^\d+\.\s*/, '');
      const label = `${hn}. ${raw}`;
      const id = `${prefix}-${slugify(raw)}-${i}`;
      toc.push({ id, label });
      return (
        <h2 key={i} id={id} className="scroll-mt-28 text-lg sm:text-xl font-bold text-[#363C98] mt-8 mb-3">
          {inline(label, i)}
        </h2>
      );
    }
    const items = lines.map((l) => l.trim()).filter(Boolean);
    if (items.length && items.every((l) => /^[-*]\s/.test(l))) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1.5 my-3 text-gray-600 leading-relaxed">
          {items.map((l, j) => <li key={j}>{inline(l.replace(/^[-*]\s/, ''), `${i}-${j}`)}</li>)}
        </ul>
      );
    }
    return (
      <p key={i} className="text-gray-600 leading-relaxed my-3">
        {inline(block.replace(/\n/g, ' '), i)}
      </p>
    );
  });
  return { toc, body, count: hn };
}

// Índice "En esta página": desplaza suavemente a cada apartado de la pestaña
// activa. Usamos el id del apartado + scrollIntoView en lugar de dejar que el
// enlace navegue: así no se cambia la URL (no añade #ancla) ni hay recarga,
// solo un deslizamiento in-page. El scroll-margin-top (scroll-mt-28) de cada
// h2 hace que caiga por debajo de la cabecera fija.
function Toc({ items }) {
  if (items.length < 2) return null;
  const scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav aria-label="Índice de la página" className="my-6 rounded-2xl border border-slate-100 bg-[#F8F9FC] p-4 sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">En esta página</p>
      <ol className="space-y-1.5">
        {items.map((it, i) => (
          <li key={it.id} className="flex gap-2 text-sm sm:text-[15px]">
            <span className="text-gray-300 tabular-nums">{i + 1}.</span>
            <a href={`#${it.id}`} onClick={(e) => scrollTo(e, it.id)}
               className="text-[#363C98] hover:text-[#FF690B] transition-colors cursor-pointer">
              {/* Si la cabecera ya trae su número (p. ej. "1. Derecho…"), lo
                  quitamos aquí para no duplicarlo con el del índice. */}
              {it.label.replace(/^\d+\.\s*/, '')}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Tabla real de cookies del sitio (auditada): localStorage propio + Stripe, y
// las de Google Analytics SOLO si el usuario activa la analítica en el banner.
function CookiesTable() {
  const rows = [
    ['cart-storage · auth-storage · sf_origin · sqf-cookie-consent', 'Propia (local)', 'Recordar tu carrito, tu sesión iniciada, el origen de tu visita y tu elección de cookies.', 'Hasta que borres los datos del navegador'],
    ['__stripe_mid', 'De terceros (Stripe)', 'Procesar el pago de forma segura y prevenir el fraude (solo al pagar).', '1 año'],
    ['__stripe_sid', 'De terceros (Stripe)', 'Procesar el pago de forma segura y prevenir el fraude (solo al pagar).', '30 minutos'],
    ['_ga', 'De terceros (Google Analytics)', 'Estadísticas anónimas de uso de la web. Solo si activas la analítica en las preferencias del banner (desactivada por defecto).', '2 años'],
    ['_ga_<id>', 'De terceros (Google Analytics)', 'Mantener el estado de la sesión de medición. Solo si activas la analítica en las preferencias del banner (desactivada por defecto).', '2 años'],
  ];
  const isConditional = (name) => name.startsWith('_ga');
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 my-5">
      <table className="w-full text-left text-sm border-collapse min-w-[540px]">
        <thead>
          <tr className="bg-slate-50 text-[#363C98]">
            <th className="p-3 font-bold">Nombre</th>
            <th className="p-3 font-bold">Tipo</th>
            <th className="p-3 font-bold">Finalidad</th>
            <th className="p-3 font-bold">Duración</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100 text-gray-600">
              <td className="p-3 font-mono text-xs">
                {r[0]}
                {isConditional(r[0]) && (
                  <span className="ml-2 inline-block align-middle rounded-full bg-[#FFF6F0] text-[#FF690B] text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
                    solo si activas analítica
                  </span>
                )}
              </td>
              <td className="p-3">{r[1]}</td>
              <td className="p-3">{r[2]}</td>
              <td className="p-3">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Sección extra de cookies (nuestra tabla auditada). Recibe el número de
// apartado que le toca para continuar la numeración del resto de la política.
const COOKIES_EXTRA_ID = 'cookies-que-usamos-en-esta-web';
const cookiesExtra = (num) => ({
  toc: [{ id: COOKIES_EXTRA_ID, label: `${num}. ¿Qué usamos en esta web?` }],
  body: (
    <React.Fragment key="cookies-extra">
      <h2 id={COOKIES_EXTRA_ID} className="scroll-mt-28 text-lg sm:text-xl font-bold text-[#363C98] mt-8 mb-3">
        {num}. ¿Qué usamos en esta web?
      </h2>
      <p className="text-gray-600 leading-relaxed my-3">
        Somos especialmente respetuosos con tu privacidad:{' '}
        <strong className="text-gray-800 font-semibold">no usamos cookies de publicidad ni de seguimiento de terceros, y la analítica (Google) está desactivada por defecto</strong>
        {' '}— solo se activa si tú lo eliges en las preferencias del banner de cookies. El resto es
        el almacenamiento imprescindible para que la web funcione:
      </p>
      <CookiesTable />
    </React.Fragment>
  ),
});

// Estructura común de una política: H1 + callout de empresa + índice + cuerpo.
function Policy({ h1, calloutTitle, mdKey, prefix, extra }) {
  const { toc, body, count } = renderPolicy(LEGAL_DATA[mdKey], prefix);
  const extraData = extra ? extra(count + 1) : null;
  const fullToc = extraData ? [...toc, ...extraData.toc] : toc;
  return (
    <div className="animate-fadeIn">
      <H1>{h1}</H1>
      <CompanyCallout title={calloutTitle} />
      <Toc items={fullToc} />
      {body}
      {extraData?.body}
    </div>
  );
}

export const ContenidoAvisoLegal = () => (
  <Policy h1="Aviso legal" calloutTitle="Datos identificativos" mdKey="avisoLegal" prefix="aviso" />
);
export const ContenidoTerminos = () => (
  <Policy h1="Términos y Condiciones" calloutTitle="Identificación del titular" mdKey="terminos" prefix="terminos" />
);
export const ContenidoPrivacidad = () => (
  <Policy h1="Política de Privacidad" calloutTitle="Responsable del tratamiento" mdKey="privacidad" prefix="privacidad" />
);
export const ContenidoCookies = () => (
  <Policy h1="Política de Cookies" calloutTitle="Titular" mdKey="cookies" prefix="cookies" extra={cookiesExtra} />
);
export const ContenidoDevoluciones = () => (
  <Policy h1="Política de Devoluciones y Reembolsos" calloutTitle="Identificación del titular" mdKey="devoluciones" prefix="devoluciones" />
);

// Orden y etiquetas de las secciones legales, para construir menús/tabs.
export const LEGAL_SECTIONS = [
  { id: 'aviso-legal', label: 'Aviso Legal', Component: ContenidoAvisoLegal },
  { id: 'terminos', label: 'Términos y Condiciones', Component: ContenidoTerminos },
  { id: 'privacidad', label: 'Política de Privacidad', Component: ContenidoPrivacidad },
  { id: 'cookies', label: 'Política de Cookies', Component: ContenidoCookies },
  { id: 'devoluciones', label: 'Política de Devoluciones', Component: ContenidoDevoluciones },
];
