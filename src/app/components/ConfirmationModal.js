'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  if (!isOpen || !isClient) return null;

  // Portal a document.body: el header es sticky y se traslada (-translate-y-full)
  // para ocultarse al bajar. Un `fixed` dentro de un ancestro con transform se
  // posiciona respecto a ESE ancestro, no a la ventana, y el modal salía pegado
  // arriba, metido en la barra del navegador. El portal lo saca de ahí.
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-5">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full">
        <p className="text-xl text-secondary text-center mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
