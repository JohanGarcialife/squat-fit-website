'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';

/**
 * Recorte de la foto de perfil: acercar, alejar y mover antes de subir.
 *
 * POR QUÉ EXISTE. El avatar es un círculo y la foto que sube la gente casi
 * nunca lo es: al ajustarla con `object-cover` el navegador recorta por el
 * centro, que en una foto de cuerpo entero deja el ombligo y no la cara. Aquí
 * la persona decide qué parte se ve.
 *
 * SIN DEPENDENCIAS NUEVAS. Un `<img>` con `transform` dentro de una ventana con
 * `overflow: hidden` para la previsualización, y un `<canvas>` para el recorte
 * real. Añadir una librería de cropping por esto sería meter un paquete en
 * producción para 200 líneas.
 *
 * SALE CUADRADO Y MÁS LIGERO. El resultado es un JPEG de 512×512: es el tamaño
 * al que se ve un avatar, y de paso una foto de móvil de 4 MB acaba en unos
 * pocos cientos de KB, que es menos que subir el original y recortarlo después.
 */

const VISTA = 288; // lado del recuadro de previsualización, en px
const SALIDA = 512; // lado de la imagen final, en px
const ZOOM_MAX = 4;

export default function PhotoCropModal({ file, onCancel, onConfirm }) {
  const [url, setUrl] = useState('');
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [procesando, setProcesando] = useState(false);

  const marcoRef = useRef(null);
  // Punteros activos: uno = arrastrar, dos = pellizcar para el zoom.
  const punteros = useRef(new Map());
  const gesto = useRef(null);

  // Cargar la imagen elegida y medirla.
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    const imagen = new Image();
    imagen.onload = () => setImg(imagen);
    imagen.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // Escala mínima: la que hace que la foto CUBRA el recuadro. Por debajo de
  // esto aparecerían franjas vacías en el avatar.
  const escalaBase = img ? VISTA / Math.min(img.naturalWidth, img.naturalHeight) : 1;
  const escala = escalaBase * zoom;
  const anchoPintado = img ? img.naturalWidth * escala : 0;
  const altoPintado = img ? img.naturalHeight * escala : 0;

  /** Impide arrastrar la foto más allá de sus bordes. */
  const limitar = useCallback(
    (o, escalaActual) => {
      if (!img) return { x: 0, y: 0 };
      const maxX = Math.max(0, (img.naturalWidth * escalaActual - VISTA) / 2);
      const maxY = Math.max(0, (img.naturalHeight * escalaActual - VISTA) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, o.x)),
        y: Math.min(maxY, Math.max(-maxY, o.y)),
      };
    },
    [img],
  );

  const cambiarZoom = useCallback(
    (nuevo) => {
      const z = Math.min(ZOOM_MAX, Math.max(1, nuevo));
      setZoom(z);
      // Al alejar hay que recolocar: lo que antes era un desplazamiento válido
      // puede dejar un hueco con la foto más pequeña.
      setOffset((o) => limitar(o, escalaBase * z));
    },
    [escalaBase, limitar],
  );

  // ── Gestos ────────────────────────────────────────────────────────────────
  const distanciaEntrePunteros = () => {
    const [a, b] = [...punteros.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 2) {
      gesto.current = { distancia: distanciaEntrePunteros(), zoom };
    } else {
      gesto.current = { x: e.clientX, y: e.clientY, offset };
    }
  };

  const onPointerMove = (e) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size === 2 && gesto.current?.distancia) {
      const ahora = distanciaEntrePunteros();
      cambiarZoom(gesto.current.zoom * (ahora / gesto.current.distancia));
      return;
    }

    if (gesto.current && gesto.current.offset) {
      const dx = e.clientX - gesto.current.x;
      const dy = e.clientY - gesto.current.y;
      setOffset(limitar({ x: gesto.current.offset.x + dx, y: gesto.current.offset.y + dy }, escala));
    }
  };

  const onPointerUp = (e) => {
    punteros.current.delete(e.pointerId);
    gesto.current = null;
  };

  // La rueda del ratón no se puede escuchar con onWheel de React: ese listener
  // es pasivo y preventDefault no surte efecto, así que la página se movería
  // por debajo mientras se hace zoom.
  useEffect(() => {
    const nodo = marcoRef.current;
    if (!nodo) return;
    const alGirar = (e) => {
      e.preventDefault();
      cambiarZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
    };
    nodo.addEventListener('wheel', alGirar, { passive: false });
    return () => nodo.removeEventListener('wheel', alGirar);
  }, [zoom, cambiarZoom]);

  // ── Recorte real ──────────────────────────────────────────────────────────
  const confirmar = () => {
    if (!img) return;
    setProcesando(true);

    // La ventana de previsualización, traducida a coordenadas de la imagen
    // original: esquina de la foto en pantalla → cuánto queda fuera del marco.
    const esquinaX = VISTA / 2 + offset.x - anchoPintado / 2;
    const esquinaY = VISTA / 2 + offset.y - altoPintado / 2;
    const sx = -esquinaX / escala;
    const sy = -esquinaY / escala;
    const lado = VISTA / escala;

    const canvas = document.createElement('canvas');
    canvas.width = SALIDA;
    canvas.height = SALIDA;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, lado, lado, 0, 0, SALIDA, SALIDA);

    canvas.toBlob(
      (blob) => {
        setProcesando(false);
        if (!blob) return;
        const recortada = new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' });
        onConfirm(recortada);
      },
      'image/jpeg',
      0.9,
    );
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8F9FC]">
          <h3 className="text-[#363C98] font-extrabold text-lg">Ajusta tu foto</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {/* Ventana de recorte. El círculo es solo la guía de lo que se verá en
              el avatar; lo que se guarda es el cuadrado completo, que es lo que
              usan las tarjetas donde la foto sale sin recortar en redondo. */}
          <div
            ref={marcoRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative overflow-hidden rounded-2xl bg-slate-900 cursor-grab active:cursor-grabbing touch-none select-none"
            style={{ width: VISTA, height: VISTA, maxWidth: '100%' }}
          >
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt=""
                draggable={false}
                className="absolute max-w-none pointer-events-none"
                style={{
                  width: anchoPintado,
                  height: altoPintado,
                  left: VISTA / 2 + offset.x - anchoPintado / 2,
                  top: VISTA / 2 + offset.y - altoPintado / 2,
                }}
              />
            )}
            {/* Guía circular: oscurece lo que quedará fuera del avatar. */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, transparent 0, transparent 49.5%, rgba(15,23,42,0.55) 50%)',
              }}
            />
            <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-white/70 m-0" />
          </div>

          {/* Zoom con botones y barra: el pellizco y la rueda están bien, pero
              con ratón y sin rueda no habría forma de acercar. */}
          <div className="flex items-center gap-3 w-full max-w-[288px]">
            <button
              type="button"
              onClick={() => cambiarZoom(zoom - 0.25)}
              aria-label="Alejar"
              className="shrink-0 p-2 rounded-full border border-slate-200 text-[#363C98] hover:bg-slate-50 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={ZOOM_MAX}
              step={0.01}
              value={zoom}
              onChange={(e) => cambiarZoom(parseFloat(e.target.value))}
              aria-label="Acercar o alejar la foto"
              className="w-full accent-[#FF690B] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => cambiarZoom(zoom + 0.25)}
              aria-label="Acercar"
              className="shrink-0 p-2 rounded-full border border-slate-200 text-[#363C98] hover:bg-slate-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-400 text-xs text-center">
            Arrastra la foto para moverla. Pellizca o usa la barra para acercarla.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 py-2 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!img || procesando}
            className="bg-[#FF690B] text-white font-bold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all text-sm shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {procesando ? 'Recortando…' : 'Usar esta foto'}
          </button>
        </div>
      </div>
    </div>
  );
}
