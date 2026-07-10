import { useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';

// Velocidad dinámica para carruseles react-slick con loop infinito:
//   - `fast` (200ms) en los clics normales, para que se sientan ágiles.
//   - `wrap` (300ms) SOLO cuando el carrusel da la vuelta (último→primero o
//     primero→último). Así, al pulsar rápido, ese "reinicio" se percibe pero
//     el resto de pasos corren rápido.
//
// flushSync fuerza a que el nuevo `speed` llegue al <Slider> ANTES de que
// slickNext/slickPrev lean la velocidad; si no, react-slick usaría el valor
// anterior en esa misma transición.
//
// Uso:
//   const { speed, onBeforeChange, next, prev } = useSlickWrapSpeed(items.length, sliderRef);
//   settings = { ...otros, speed, beforeChange: onBeforeChange };
//   <button onClick={prev}> ... <button onClick={next}>
export default function useSlickWrapSpeed(length, sliderRef, { fast = 200, wrap = 300 } = {}) {
  const currentRef = useRef(0);
  const [speed, setSpeed] = useState(fast);

  const onBeforeChange = useCallback((_current, next) => {
    currentRef.current = next;
  }, []);

  const next = useCallback(() => {
    const isWrap = currentRef.current === length - 1;
    flushSync(() => setSpeed(isWrap ? wrap : fast));
    if (sliderRef.current) sliderRef.current.slickNext();
  }, [length, sliderRef, fast, wrap]);

  const prev = useCallback(() => {
    const isWrap = currentRef.current === 0;
    flushSync(() => setSpeed(isWrap ? wrap : fast));
    if (sliderRef.current) sliderRef.current.slickPrev();
  }, [length, sliderRef, fast, wrap]);

  return { speed, onBeforeChange, next, prev };
}
