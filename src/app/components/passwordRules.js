'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Las reglas de contraseña, en un solo sitio.
 *
 * POR QUÉ EXISTE. La contraseña se elige en TRES pantallas —registro, crear la
 * primera desde el enlace del correo, y cambiarla desde el perfil— y hasta
 * ahora solo el registro iba diciendo en vivo lo que faltaba. En las otras dos
 * el criterio estaba escrito otra vez, con otras palabras, y el usuario se
 * enteraba de que la contraseña no valía al pulsar el botón. Peor todavía: si
 * las reglas de un sitio y otro se separan, hay pantallas que aceptan lo que el
 * servidor rechaza.
 *
 * Las reglas son las del backend (`regex` de reset-password.dto.ts): 8 o más
 * caracteres, mayúscula, minúscula, número y un símbolo. Si allí cambian, aquí
 * también — y con esto, en las tres pantallas a la vez.
 */

export const PASSWORD_RULES = [
  { label: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
  { label: '1 letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { label: '1 letra minúscula', test: (v) => /[a-z]/.test(v) },
  { label: '1 número', test: (v) => /[0-9]/.test(v) },
  { label: '1 carácter especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** ¿Cumple todas? Es lo que hay que comprobar antes de dejar enviar. */
export function cumpleReglas(valor = '') {
  return PASSWORD_RULES.every((r) => r.test(valor));
}

/**
 * Lista de requisitos que se van poniendo en verde al escribir.
 *
 * No aparece hasta que se escribe el primer carácter: enseñar cinco cruces
 * rojas a alguien que todavía no ha tecleado nada es recibirle con un suspenso.
 *
 * `tono` cambia solo los colores: 'oscuro' para fondos de marca (el registro),
 * 'claro' para tarjetas blancas (activar cuenta, perfil).
 */
export function PasswordChecklist({ value = '', tono = 'claro', className = '' }) {
  if (!value) return null;

  const oscuro = tono === 'oscuro';

  return (
    <ul className={`mt-2 space-y-1 ${className}`} aria-label="Requisitos de la contraseña">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              ok
                ? oscuro
                  ? 'text-green-200'
                  : 'text-green-600'
                : oscuro
                  ? 'text-white/70'
                  : 'text-slate-400'
            }`}
          >
            {/* El icono además del color: quien no distingue el verde del gris
                necesita ver la diferencia de forma, no solo de tono. */}
            <span className="w-4 shrink-0">
              {ok ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" />}
            </span>
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
