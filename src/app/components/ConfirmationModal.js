'use client';

import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full">
        <p className="text-xl text-secondary text-center mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
