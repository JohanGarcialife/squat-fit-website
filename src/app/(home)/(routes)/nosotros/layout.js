// La página es un componente de cliente ('use client') y por eso no puede
// exportar `metadata` ella misma: Next solo la lee de módulos de servidor.
// Este layout existe únicamente para darle título y descripción propios.
export const metadata = {
  title: 'Quiénes somos',
  description:
    'Conoce al equipo de Squad Fit: quiénes somos, cómo trabajamos y por qué hacemos las cosas de esta manera.',
};

export default function NosotrosLayout({ children }) {
  return children;
}
