// src/app/components/icons/SchoolIcon.js
// Compartido entre el Sidebar del panel ("Mis cursos") y el tour de
// bienvenida (AppTour): mismo SVG en los dos.
// Activo = RELLENO naranja, como el resto del menú (Inicio, Mi programa, Mi
// cocina…). Hasta ahora este icono y el de la mancuerna eran los dos únicos
// que al activarse solo cambiaban el color del trazo y lo engordaban, así que
// «Mis cursos» activo se veía en contorno naranja y desentonaba con los demás.
export default function SchoolIcon({ filled, width = 30, height = 30 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#363C98"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      {filled ? (
        <>
          {/* Birrete */}
          <path d="M12.37 3.1a1 1 0 0 0 -.74 0l-9.5 3.8a1 1 0 0 0 0 1.86l9.5 3.8a1 1 0 0 0 .74 0l9.5 -3.8a1 1 0 0 0 0 -1.86z" />
          {/* Cuerpo bajo el birrete */}
          <path d="M6.5 11.06l5.13 2.05a2 2 0 0 0 1.48 0l5.13 -2.05v4.94c0 2.07 -2.79 3.4 -6 3.4s-6 -1.33 -6 -3.4z" />
          {/* Borla */}
          <path d="M21 9.35a1 1 0 0 1 1 1v4.4a1 1 0 0 1 -2 0v-4.4a1 1 0 0 1 1 -1z" />
        </>
      ) : (
        <>
          <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
          <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
        </>
      )}
    </svg>
  );
}
