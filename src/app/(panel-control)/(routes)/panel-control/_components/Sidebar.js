'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// --- Icon Components ---
const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3932C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
  </svg>
)

const HomeIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
    ) : (
        <>
            <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
        </>
    )}
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

const AppleIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <path d="M15 2a1 1 0 0 1 .117 1.993l-.117 .007c-.693 0 -1.33 .694 -1.691 1.552a5.1 5.1 0 0 1 1.982 -.544l.265 -.008c2.982 0 5.444 3.053 5.444 6.32c0 3.547 -.606 5.862 -2.423 8.578c-1.692 2.251 -4.092 2.753 -6.41 1.234a.31 .31 0 0 0 -.317 -.01c-2.335 1.528 -4.735 1.027 -6.46 -1.27c-1.783 -2.668 -2.39 -4.984 -2.39 -8.532l.004 -.222c.108 -3.181 2.526 -6.098 5.44 -6.098c.94 0 1.852 .291 2.688 .792c.419 -1.95 1.818 -3.792 3.868 -3.792m-7.034 6.154c-1.36 .858 -1.966 2.06 -1.966 3.846a1 1 0 0 0 2 0c0 -1.125 .28 -1.678 1.034 -2.154a1 1 0 1 0 -1.068 -1.692" />
    ) : (
        <>
            <path d="M4 11.319c0 3.102 .444 5.319 2.222 7.978c1.351 1.797 3.156 2.247 5.08 .988c.426 -.268 .97 -.268 1.397 0c1.923 1.26 3.728 .809 5.079 -.988c1.778 -2.66 2.222 -4.876 2.222 -7.977c0 -2.661 -1.99 -5.32 -4.444 -5.32c-1.267 0 -2.41 .693 -3.22 1.44a.5 .5 0 0 1 -.672 0c-.809 -.746 -1.953 -1.44 -3.22 -1.44c-2.454 0 -4.444 2.66 -4.444 5.319" />
            <path d="M7 12c0 -1.47 .454 -2.34 1.5 -3" />
            <path d="M12 7c0 -1.2 .867 -4 3 -4" />
        </>
    )}
  </svg>
)

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
    ) : (
        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    )}
  </svg>
)

// Cursos: birrete. El estado activo usa la MISMA forma de contorno pero en
// naranja (antes el "filled" era un glyph distinto y no correspondía).
const SchoolIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={filled ? "#FF690B" : "#3932C0"} strokeWidth={filled ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
    <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
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

const SettingsIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#3932C0"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    {filled ? (
        <path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" />
    ) : (
        <>
        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        </>
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
const MENU_ITEMS = [
  { id: 0, label: 'Inicio', href: '/panel-control', Icon: HomeIcon },
  { id: 1, label: 'Alertas', href: null, Icon: BellIcon },
  { id: 2, label: 'Cocina', href: '/panel-cocina', Icon: AppleIcon },
  { id: 3, label: 'Planes', href: '/panel-planes', Icon: StarIcon },
  { id: 4, label: 'Cursos', href: '/panel-cursos', Icon: SchoolIcon },
  { id: 5, label: 'Perfil', href: '/profile-panel', Icon: UserIcon },
  { id: 6, label: 'Contacto', href: '/panel-contacto', Icon: MessageIcon },
  { id: 8, label: 'Info', href: '/panel-info', Icon: InfoIcon },
  { id: 7, label: 'Ajustes', href: null, Icon: SettingsIcon },
]

// ─── Default (navigation) Sidebar ───────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname()
  const [activeId, setActiveId] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const activeItem = MENU_ITEMS.find(item => item.href && pathname.startsWith(item.href))
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
        {MENU_ITEMS.map((item) => {
          if (item.label === 'Ajustes') return null;
          const isActive = activeId === item.id
          const Content = (
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleItemClick(item.id)}>
              <div className="transition-transform group-hover:scale-110"><item.Icon filled={isActive} /></div>
              <span className={`text-lg transition-colors ${isActive ? 'font-bold text-[#FF690B]' : 'text-[#3932C0] group-hover:text-[#FF690B]'}`}>{item.label}</span>
            </div>
          )
          return item.href ? (<Link key={item.id} href={item.href} className="no-underline" onClick={onNavigate}>{Content}</Link>) : (<div key={item.id}>{Content}</div>)
        })}
      </div>

      {/* Bottom Items (Ajustes) */}
      <div className="mt-auto pt-8">
        {MENU_ITEMS.filter(item => item.label === 'Ajustes').map((item) => {
          const isActive = activeId === item.id
          return (
            <div key={item.id} className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleItemClick(item.id)}>
              <div className="transition-transform group-hover:scale-110"><item.Icon filled={isActive} /></div>
              <span className={`text-lg transition-colors ${isActive ? 'font-bold text-[#FF690B]' : 'text-[#3932C0] group-hover:text-[#FF690B]'}`}>{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Barra superior (solo móvil/tablet, < lg): logo + hamburguesa */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-[#FFF6F0] border-b border-orange-100 flex items-center justify-between px-4">
        <Link href="/">
          <Image src="/LogotipoSquatfit.png" width={44} height={44} alt="Logo" />
        </Link>
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
export function BookIndexSidebar({ isOpen, onClose, items = [], activePage, onItemClick }) {
  const flatItems = React.useMemo(() => {
    return flattenIndexTree(items);
  }, [items]);

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
            Índice
          </span>
          <button onClick={onClose} className="text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteo de secciones */}
        {flatItems.length > 0 && (
          <p className="text-[10px] text-[#3932C0]/40 mb-6">
            {flatItems.length} {flatItems.length === 1 ? 'sección' : 'secciones'}
          </p>
        )}

        {/* Contenido del índice */}
        {flatItems.length === 0 ? (
          /* Estado vacío cuando no hay índices */
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-8">
            <span className="text-4xl">📖</span>
            <p className="text-[#3932C0]/50 text-sm font-medium leading-relaxed">
              Este libro no tiene<br />índice disponible.
            </p>
          </div>
        ) : (
          /* Lista de items con indentación jerárquica */
          <div className="flex flex-col space-y-2">
            {flatItems.map((item, index) => {
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

