// src/app/components/icons/SchoolIcon.js
// Compartido entre el Sidebar del panel ("Mis cursos") y el tour de
// bienvenida (AppTour): mismo SVG en los dos.
export default function SchoolIcon({ filled, width = 30, height = 30 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={filled ? "#FF690B" : "#3932C0"} strokeWidth={filled ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
      <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
    </svg>
  );
}
