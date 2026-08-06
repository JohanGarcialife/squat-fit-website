// src/app/components/icons/RecipeBookIcon.js
// «Mis recetas» del Sidebar: mismo contrato que el resto de iconos del menú
// (prop `filled` para el estado activo) y mismo trazo tabler que AppleIcon.
export default function RecipeBookIcon({ filled, width = 30, height = 30 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill={filled ? "#FF690B" : "none"} stroke={filled ? "none" : "#363C98"} strokeWidth={filled ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      {filled ? (
        <path d="M18 2a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3h-11a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2 4h-7a1 1 0 0 0 -.117 1.993l.117 .007h7a1 1 0 0 0 0 -2m-3 4h-4a1 1 0 0 0 -.117 1.993l.117 .007h4a1 1 0 0 0 0 -2" />
      ) : (
        <>
          <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1" />
          <path d="M5 16h14" />
          <path d="M9 8h6" />
          <path d="M9 11h3" />
        </>
      )}
    </svg>
  );
}
