'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgramAccess } from '@/app/components/useProgramAccess'
import HomeIcon from '@/app/components/icons/HomeIcon'
import StarIcon from '@/app/components/icons/StarIcon'
import BarbellIcon from '@/app/components/icons/BarbellIcon'
import AppleIcon from '@/app/components/icons/AppleIcon'
import RecipeBookIcon from '@/app/components/icons/RecipeBookIcon'
import SchoolIcon from '@/app/components/icons/SchoolIcon'
import SettingsIcon from '@/app/components/icons/SettingsIcon'
import { trackRecipeEvent } from '@/app/components/recipeMetrics'

// --- Icon Components ---
const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3932C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
  </svg>
)

const BellIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <>
            <path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z" />
            <path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004z" />
        </>
    ) : (
        <>
            <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
        </>
    )}
  </svg>
)

const UserIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <>
        <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
        <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
        </>
    ) : (
        <>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </>
    )}
  </svg>
)

const MessageIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <path d="M5.821 4.91c3.899 -2.765 9.468 -2.539 13.073 .535c3.667 3.129 4.168 8.238 1.152 11.898c-2.841 3.447 -7.965 4.583 -12.231 2.805l-.233 -.101l-4.374 .931l-.04 .006l-.035 .007h-.018l-.022 .005h-.038l-.033 .004l-.021 -.001l-.023 .001l-.033 -.003h-.035l-.022 -.004l-.022 -.002l-.035 -.007l-.034 -.005l-.016 -.004l-.024 -.005l-.049 -.016l-.024 -.005l-.011 -.005l-.022 -.007l-.045 -.02l-.03 -.012l-.011 -.006l-.014 -.006l-.031 -.018l-.045 -.024l-.016 -.011l-.037 -.026l-.04 -.027l-.002 -.004l-.013 -.009l-.043 -.04l-.025 -.02l-.006 -.007l-.056 -.062l-.013 -.014l-.011 -.014l-.039 -.056l-.014 -.019l-.005 -.01l-.042 -.073l-.007 -.012l-.004 -.008l-.007 -.012l-.014 -.038l-.02 -.042l-.004 -.016l-.004 -.01l-.017 -.061l-.007 -.018l-.002 -.015l-.005 -.019l-.005 -.033l-.008 -.042l-.002 -.031l-.003 -.01v-.016l-.004 -.054l.001 -.036l.001 -.023l.002 -.053l.004 -.025v-.019l.008 -.035l.005 -.034l.005 -.02l.004 -.02l.018 -.06l.003 -.013l1.15 -3.45l-.022 -.037c-2.21 -3.747 -1.209 -8.391 2.413 -11.119z" />
    ) : (
        <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
    )}
  </svg>
)

const InfoIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    {filled ? (
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
    ) : (
        <>
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
            <path d="M12 9h.01" />
            <path d="M11 12h1v4h1" />
        </>
    )}
  </svg>
)

// --- Configuration ---
// Menú definitivo (spec programas TMV + reestructura Mi entreno): Inicio ·
// Mi programa · Mi entreno · Mis cursos · Mi cocina · Perfil, con Ajustes
// abajo (Contacto, Conócenos, Legal y las notificaciones viven en Ajustes).
// `tour` = ancla del tour de bienvenida (AppTour usa [data-tour="..."]).
//
// «Mis recetas» es sección propia desde la fase B del recetario: el recetario
// (índice, filtros, rejilla/lista) tiene entidad de sobra para no vivir
// colgando de «Mi cocina», que se queda con lo de la dieta — Mi pauta y sus
// sustituciones. `tambien` son rutas que también encienden ese ítem del menú:
// la ficha de una receta y el lector de un libro son «Mis recetas» aunque
// cuelguen de /panel-cocina.
const MENU_ITEMS = [
  { id: 0, label: 'Inicio', href: '/panel-control', Icon: HomeIcon, tour: 'inicio' },
  { id: 3, label: 'Mi programa', href: '/mi-programa', Icon: StarIcon, tour: 'mi-programa' },
  { id: 8, label: 'Mi entreno', href: '/mi-entreno', Icon: BarbellIcon, tour: 'mi-entreno' },
  { id: 4, label: 'Mis cursos', href: '/panel-cursos', Icon: SchoolIcon, tour: 'mis-cursos' },
  { id: 2, label: 'Mi cocina', href: '/panel-cocina', Icon: AppleIcon, tour: 'mi-cocina' },
  {
    id: 9,
    label: 'Mis recetas',
    href: '/panel-cocina/recetas',
    tambien: ['/panel-cocina/receta', '/panel-cocina/libro'],
    Icon: RecipeBookIcon,
    tour: 'mis-recetas',
  },
  { id: 5, label: 'Perfil', href: '/profile-panel', Icon: UserIcon },
  { id: 7, label: 'Ajustes', href: '/panel-ajustes', Icon: SettingsIcon, tour: 'ajustes' },
]

// Gana el prefijo MÁS LARGO que case, no el primero de la lista. Con
// /panel-cocina y /panel-cocina/recetas conviviendo, un `find` a secas
// encendía siempre «Mi cocina» estando en el recetario.
function itemActivo(pathname) {
  let mejor = null
  for (const item of MENU_ITEMS) {
    for (const ruta of [item.href, ...(item.tambien || [])]) {
      if (ruta && pathname.startsWith(ruta) && (!mejor || ruta.length > mejor.longitud)) {
        mejor = { item, longitud: ruta.length }
      }
    }
  }
  return mejor?.item || null
}

// ─── Default (navigation) Sidebar ───────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname()
  const [activeId, setActiveId] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Mismos criterios de acceso que las páginas (advice/by-user y
  // course/by-user, llamada compartida vía caché del hook):
  //   - «Mi entreno» solo aparece con programa o con el curso Entrena en casa.
  //   - «Mi programa» se oculta a quien SOLO tiene el curso Entrena en casa
  //     (sin programa); con programa —o sin datos aún— se muestra como hasta
  //     ahora (incluida la pantalla de contratar para quien no tiene nada).
  //
  // OJO si a alguien le tienta quitar el filtro de «Mi entreno»: es a
  // propósito, no un descuido (commit af791d7, "Sidebar con visibilidad por
  // acceso"). /mi-entreno en sí NO está bloqueada — quien entra por URL
  // directa sin programa ni curso ve el mismo tipo de pantalla de "contratar"
  // que Mi programa/Mi cocina/Mis cursos (mi-entreno/page.js:42-71) — pero en
  // el menú se oculta para no anunciar una sección que, además, hoy tiene
  // contenido vacío incluso para quien SÍ paga: la "Técnica de ejercicios" es
  // un EmptyState sin condición de acceso (mi-entreno/page.js:124-126). Antes
  // de enseñarla en el menú a quien no tiene acceso, esa biblioteca necesita
  // contenido real.
  const { checked, hasProgram, hasEntrenaCourse } = useProgramAccess()
  const menuItems = MENU_ITEMS.filter((item) => {
    if (item.label === 'Mi entreno') return checked && (hasProgram || hasEntrenaCourse)
    if (item.label === 'Mi programa') return !(checked && !hasProgram && hasEntrenaCourse)
    return true
  })

  useEffect(() => {
    const activeItem = itemActivo(pathname)
    if (activeItem) setActiveId(activeItem.id)
  }, [pathname])

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Bloquea el scroll de fondo mientras el drawer está abierto.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  const handleItemClick = (id) => setActiveId(id)

  // Contenido del menú, reutilizado en escritorio y en el drawer móvil.
  const renderNav = (onNavigate) => (
    <div className="flex flex-col w-full max-w-[200px] h-full mx-auto">
      {/* Logo */}
      <Link href="/" className="mx-auto mb-8" onClick={onNavigate}>
        <Image src="/LogotipoSquatfit.png" width={80} height={80} alt="Logo" className="hover:scale-105 transition-transform" />
      </Link>

      {/* Menu Items */}
      <div className="flex flex-col space-y-4 flex-grow">
        {menuItems.map((item) => {
          if (item.label === 'Ajustes') return null;
          const isActive = activeId === item.id
          const Content = (
            <div data-tour={item.tour} className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleItemClick(item.id)}>
              <div className="transition-transform group-hover:scale-110"><item.Icon filled={isActive} /></div>
              <span className={`text-lg transition-colors ${isActive ? 'font-bold text-[#FF690B]' : 'text-[#3932C0] group-hover:text-[#FF690B]'}`}>{item.label}</span>
            </div>
          )
          return item.href ? (<Link key={item.id} href={item.href} className="no-underline" onClick={onNavigate}>{Content}</Link>) : (<div key={item.id}>{Content}</div>)
        })}
      </div>

      {/* Bottom Items (Ajustes) */}
      <div className="mt-auto pt-8">
        {menuItems.filter(item => item.label === 'Ajustes').map((item) => {
          const isActive = activeId === item.id
          const Content = (
            <div data-tour={item.tour} className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleItemClick(item.id)}>
              <div className="transition-transform group-hover:scale-110"><item.Icon filled={isActive} /></div>
              <span className={`text-lg transition-colors ${isActive ? 'font-bold text-[#FF690B]' : 'text-[#3932C0] group-hover:text-[#FF690B]'}`}>{item.label}</span>
            </div>
          )
          return item.href
            ? (<Link key={item.id} href={item.href} className="no-underline" onClick={onNavigate}>{Content}</Link>)
            : (<div key={item.id}>{Content}</div>)
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Barra superior (solo móvil/tablet, < lg): hamburguesa + logo.
          El botón va a la IZQUIERDA (mismo lado que el cajón, que ya sale
          por la izquierda) para que quede alineado con dónde aparece el menú. */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-[#FFF6F0] border-b border-orange-100 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="p-2 text-[#3932C0] hover:text-[#FF690B] transition-colors cursor-pointer"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/">
          <Image src="/LogotipoSquatfit.png" width={44} height={44} alt="Logo" />
        </Link>
      </div>

      {/* Sidebar de escritorio (lg+) */}
      <div className="hidden lg:flex bg-[#FFF6F0] rounded-[40px] flex-col items-center py-8 px-6 h-[calc(100vh-40px)] sticky top-[20px] ml-[20px] overflow-y-auto shrink-0">
        {renderNav()}
      </div>

      {/* Drawer móvil */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[80%] max-w-[300px] bg-[#FFF6F0] shadow-2xl flex flex-col py-8 px-6 overflow-y-auto transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            className="self-end p-1 text-[#FF690B] hover:opacity-80 transition-opacity mb-2 cursor-pointer"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          {renderNav(() => setMobileOpen(false))}
        </aside>
      </div>
    </>
  )
}

// Helper to contextually choose an emoji icon based on title keywords and level
function getIconForTitle(title, level) {
  if (!title) return level === 0 ? '📘' : '🔸';
  const t = title.toLowerCase();
  if (t.includes('índice') || t.includes('indice') || t.includes('contenido')) return '📋';
  if (t.includes('antes') || t.includes('empezar') || t.includes('bienvenida') || t.includes('presentación') || t.includes('presentacion')) return '👋';
  if (t.includes('esenciales') || t.includes('básicos') || t.includes('basicos')) return '🍳';
  if (t.includes('desayuno')) return '☕';
  if (t.includes('comida') || t.includes('almuerzo')) return '🍽️';
  if (t.includes('cena')) return '🌙';
  if (t.includes('snack') || t.includes('merienda') || t.includes('entre horas') || t.includes('fruta')) return '🍎';
  if (t.includes('postre') || t.includes('dulce')) return '🧁';
  if (t.includes('salsa') || t.includes('aderezo')) return '🥫';
  if (t.includes('tropical')) return '🌴';
  if (t.includes('cierre') || t.includes('final') || t.includes('contacto') || t.includes('gracias')) return '🤍';
  
  // Default based on level
  if (level === 0) return '📘';
  if (level === 1) return '🔸';
  return '▪️';
}

// Helper to flatten hierarchical tree nodes recursively
// Soporta tanto:
//   - Árboles del backend: { id, title, page_number, level, sort_order, children[] }
//   - Arrays planos del fallback: { title, icon, page }
function flattenIndexTree(nodes, inheritedLevel = 0) {
  let flat = [];
  if (!nodes || !Array.isArray(nodes)) return flat;
  
  // Sort by sort_order to maintain correct order of chapters
  const sortedNodes = [...nodes].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  
  for (const node of sortedNodes) {
    // Soporte dual: API usa page_number + level, fallback usa page + (sin level)
    const nodeLevel = node.level ?? inheritedLevel;
    const pageNum = node.page_number ?? node.page ?? 1;
    
    flat.push({
      id: node.id || `node-${pageNum}-${Math.random().toString(36).slice(2,7)}`,
      title: node.title,
      page: pageNum,
      level: nodeLevel,
      icon: node.icon || getIconForTitle(node.title, nodeLevel)
    });
    
    if (node.children && node.children.length > 0) {
      flat.push(...flattenIndexTree(node.children, nodeLevel + 1));
    }
  }
  return flat;
}


// ─── Book Index Overlay Sidebar ──────────────────────────────────────────────
// Props:
//   isOpen        – boolean para mostrar/ocultar
//   onClose       – callback al cerrar
//   items         – VersionIndexTreeNode[] del backend o array plano del fallback
//   activePage    – número de página actual del PDF
//   onItemClick   – callback(page) al hacer clic en un ítem
//
// Los textos son configurables porque este mismo índice lo usa ahora el
// recetario de «Mis recetas» (donde los ítems son recetas, no páginas de un
// PDF). Los valores por defecto son los del lector de libro de siempre, así
// que ese uso no cambia ni una letra. `page` puede ser un número de página o
// cualquier identificador: aquí solo se compara y se devuelve tal cual.
export function BookIndexSidebar({
  isOpen,
  onClose,
  items = [],
  activePage,
  onItemClick,
  etiqueta = 'Índice',
  placeholder = 'Buscar en este libro…',
  unidad = { singular: 'sección', plural: 'secciones' },
  vacio = <>Este libro no tiene<br />índice disponible.</>,
}) {
  const flatItems = React.useMemo(() => {
    return flattenIndexTree(items);
  }, [items]);

  // Filtro de texto sobre el índice de este libro. No es un buscador de
  // biblioteca (no existe esa función hoy): busca dentro de los títulos ya
  // cargados en este índice.
  const [query, setQuery] = useState('');
  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatItems;
    return flatItems.filter((item) => (item.title || '').toLowerCase().includes(q));
  }, [flatItems, query]);

  // Un evento de "search" por pausa de escritura (debounce de 500ms), no uno
  // por tecla — recipeMetrics además agrupa antes de mandar nada a red.
  // Antes etiquetaba el evento con book_id/version_id/results_count — ninguno
  // de los tres existe en el contrato real (content_type/content_id/
  // event_type/duration_seconds/search_term). "search" es el único tipo de
  // evento que NO necesita content_id, así que se adapta en vez de
  // retirarse: mismo patrón que ya usa el buscador de recetas nativas más
  // abajo (panel-cocina/libro/[id]/page.js), solo con searchTerm.
  useEffect(() => {
    const q = query.trim();
    if (!q) return undefined;
    const t = setTimeout(() => {
      trackRecipeEvent('search', { searchTerm: q });
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Al cerrar el índice, vacía el filtro: la próxima vez que se abra no
  // debe arrastrar una búsqueda vieja.
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-[20px] right-[20px] h-[calc(100vh-40px)] w-[260px] bg-[#FFF6F0] rounded-[40px] shadow-2xl z-50 flex flex-col py-8 px-6 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+20px)]'
        }`}
      >
        {/* Header: label + close button */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#3932C0] uppercase tracking-widest opacity-50">
            {etiqueta}
          </span>
          <button onClick={onClose} className="text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Buscador dentro del índice de este libro */}
        {flatItems.length > 0 && (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="mb-4 w-full rounded-xl border border-[#3932C0]/15 bg-white px-3 py-2 text-sm text-[#3932C0] placeholder:text-[#3932C0]/40 focus:outline-none focus:border-[#FF690B] transition-colors"
          />
        )}

        {/* Conteo de secciones */}
        {flatItems.length > 0 && (
          <p className="text-[10px] text-[#3932C0]/40 mb-6">
            {query.trim()
              ? `${filteredItems.length} de ${flatItems.length} ${flatItems.length === 1 ? unidad.singular : unidad.plural}`
              : `${flatItems.length} ${flatItems.length === 1 ? unidad.singular : unidad.plural}`}
          </p>
        )}

        {/* Contenido del índice */}
        {flatItems.length === 0 ? (
          /* Estado vacío cuando no hay índices */
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-8">
            <span className="text-4xl">📖</span>
            <p className="text-[#3932C0]/50 text-sm font-medium leading-relaxed">
              {vacio}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Búsqueda sin resultados */
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-8">
            <span className="text-4xl">🔍</span>
            <p className="text-[#3932C0]/50 text-sm font-medium leading-relaxed">
              Nada con «{query.trim()}».
            </p>
          </div>
        ) : (
          /* Lista de items con indentación jerárquica */
          <div className="flex flex-col space-y-2">
            {filteredItems.map((item, index) => {
              const isActive = activePage === item.page;
              const indentStyle = { paddingLeft: `${item.level * 14}px` };
              const fontSizeClass = item.level === 0
                ? 'text-base font-bold'
                : item.level === 1
                  ? 'text-sm font-semibold'
                  : 'text-xs font-medium';
              const colorClass = isActive
                ? 'text-[#FF690B]'
                : item.level === 0
                  ? 'text-[#3932C0] group-hover:text-[#FF690B]'
                  : 'text-[#3932C0]/70 group-hover:text-[#FF690B]';

              return (
                <button
                  key={item.id || index}
                  onClick={() => onItemClick(item.page)}
                  style={indentStyle}
                  className={`flex items-center gap-2.5 cursor-pointer group text-left w-full transition-all duration-150 hover:translate-x-0.5 rounded-xl px-2 py-1.5 ${
                    isActive ? 'bg-[#FF690B]/10' : 'hover:bg-[#3932C0]/5'
                  }`}
                >
                  <span className="text-lg w-6 flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className={`transition-colors leading-snug flex-1 ${fontSizeClass} ${colorClass}`}>
                    {item.title}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF690B] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

