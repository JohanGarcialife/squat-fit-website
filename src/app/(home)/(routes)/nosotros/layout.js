// La página es un componente de cliente ('use client') y por eso no puede
// exportar `metadata` ella misma: Next solo la lee de módulos de servidor.
// Este layout existe únicamente para darle título y descripción propios.
export const metadata = {
  // Esta es LA página que busca quien escribe «maria squat fit» en Google, y
  // hasta ahora ni el título ni la descripción decían su nombre. Ver la nota
  // de (home)/layout.js con la medición: 76 impresiones de consultas con
  // «maria», cero clics.
  title: 'Quiénes somos · María Casas y el equipo',
  description:
    'Conoce a María Casas y al equipo de Squad Fit: quiénes somos, cómo trabajamos y por qué hacemos las cosas de esta manera.',
};

export default function NosotrosLayout({ children }) {
  return children;
}
