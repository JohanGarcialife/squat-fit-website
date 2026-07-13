'use client';
import { Toaster } from 'react-hot-toast';

// Proveedor único de toasts para toda la web. Centrado arriba y con ancho
// responsive para que en el iPhone no salgan descolocados ni recortados.
export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      containerStyle={{ top: 20, left: 12, right: 12 }}
      toastOptions={{
        duration: 4000,
        style: {
          maxWidth: '92vw',
          width: 'fit-content',
          padding: '12px 16px',
          borderRadius: '16px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#363C98',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error: {
          iconTheme: { primary: '#FF690B', secondary: '#fff' },
          style: { color: '#9a3412' },
        },
      }}
    />
  );
}
