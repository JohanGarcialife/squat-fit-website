'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

/**
 * Paso de acceso del checkout SIN muro de login:
 * 1. Pide solo el email.
 * 2. Si la cuenta no existe → se crea como invitado y se continúa directo.
 * 3. Si existe con contraseña → aparece el campo de contraseña (login inline).
 * 4. Si existe sin contraseña → se le reenvía el enlace para crearla.
 * Nunca se saca al cliente del carrito hacia /login o /registro.
 */
export default function CheckoutAccess({ onReady }) {
  const { setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [activationSent, setActivationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validEmail = /.+@.+\..+/.test(email.trim());

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!validEmail || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/user/begin-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo continuar');

      if (data.mode === 'guest' && data.token) {
        setToken(data.token);
        toast.success('¡Listo! Continuemos con tu compra');
        onReady();
      } else if (data.mode === 'password_required') {
        setNeedsPassword(true);
      } else if (data.mode === 'activation_sent') {
        setActivationSent(true);
      }
    } catch (err) {
      toast.error(err.message || 'Error al continuar, inténtalo de nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error('Contraseña incorrecta');
      setToken(data.token);
      toast.success('Sesión iniciada');
      onReady();
    } catch (err) {
      toast.error(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-white flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2">Tu email para el pedido</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Lo usamos para enviarte el acceso a tu compra. Sin registros largos: si ya tienes cuenta te pediremos solo tu
          contraseña.
        </p>

        {activationSent ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-gray-700">
            Ya tienes una cuenta creada con <strong>{email}</strong> pero sin contraseña. Te hemos enviado un email con
            un enlace para crearla: en cuanto la tengas, vuelve aquí y continúa tu compra.
          </div>
        ) : (
          <form onSubmit={needsPassword ? handleLogin : handleEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled={needsPassword}
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
                autoFocus
              />
            </div>

            {needsPassword && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  className="mt-1 text-xs text-indigo-800 underline"
                  onClick={() => {
                    setNeedsPassword(false);
                    setPassword('');
                  }}
                >
                  Usar otro email
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !validEmail || (needsPassword && !password)}
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Un momento…' : needsPassword ? 'Iniciar sesión y continuar' : 'Continuar con la compra'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
