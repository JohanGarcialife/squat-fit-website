// src/app/components/icons/BarbellIcon.js
// Compartido entre el Sidebar del panel ("Mi entreno") y el tour de
// bienvenida (AppTour): mismo SVG en los dos.
// Activo = RELLENO naranja, igual que el resto del menú (ver SchoolIcon.js:
// estos dos eran los únicos que se quedaban en contorno al activarse).
// La geometría del relleno es la misma que la del contorno: puntas, discos
// pequeños, discos grandes y barra.
export default function BarbellIcon({ filled, width = 30, height = 30 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#363C98"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      {filled ? (
        <>
          <path d="M2.6 10.9h1.1v2.2h-1.1a.55 .55 0 0 1 -.55 -.55v-1.1a.55 .55 0 0 1 .55 -.55z" />
          <path d="M4.2 7.8h1.9v8.4h-1.9a1.2 1.2 0 0 1 -1.2 -1.2v-6a1.2 1.2 0 0 1 1.2 -1.2z" />
          <path d="M7.1 5.9h1.5a1.2 1.2 0 0 1 1.2 1.2v9.8a1.2 1.2 0 0 1 -1.2 1.2h-1.5a1.2 1.2 0 0 1 -1.2 -1.2v-9.8a1.2 1.2 0 0 1 1.2 -1.2z" />
          <path d="M9.6 10.9h4.8v2.2h-4.8z" />
          <path d="M15.4 5.9h1.5a1.2 1.2 0 0 1 1.2 1.2v9.8a1.2 1.2 0 0 1 -1.2 1.2h-1.5a1.2 1.2 0 0 1 -1.2 -1.2v-9.8a1.2 1.2 0 0 1 1.2 -1.2z" />
          <path d="M17.9 7.8h1.9a1.2 1.2 0 0 1 1.2 1.2v6a1.2 1.2 0 0 1 -1.2 1.2h-1.9z" />
          <path d="M20.3 10.9h1.1a.55 .55 0 0 1 .55 .55v1.1a.55 .55 0 0 1 -.55 .55h-1.1z" />
        </>
      ) : (
        <>
          <path d="M2 12h1" />
          <path d="M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2" />
          <path d="M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z" />
          <path d="M9 12h6" />
          <path d="M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z" />
          <path d="M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2" />
          <path d="M22 12h-1" />
        </>
      )}
    </svg>
  );
}
