import { useRef, type RefObject, type TouchEvent } from "react";
import type { ChapterRef } from "@/lib/bible/catalog";

/**
 * Deslizar para os lados troca de capítulo (como virar a página).
 * Com dois dedos é pinça (tamanho da letra), não troca de capítulo.
 * A página acompanha o dedo com resistência; um arraste longo ou um gesto rápido troca de capítulo.
 */
export function useChapterSwipe(
  mainRef: RefObject<HTMLElement | null>,
  previous: ChapterRef | null,
  next: ChapterRef | null,
  go: (ref: ChapterRef | null) => void,
) {
  const touch = useRef<{ x: number; y: number; t: number; dragging: boolean } | null>(null);
  const multiTouch = useRef(false);

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const settle = () => {
    const node = mainRef.current;
    if (!node) return;
    node.style.transition = "transform 200ms var(--ease-out), opacity 200ms var(--ease-out)";
    node.style.transform = "";
    node.style.opacity = "";
  };
  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      multiTouch.current = true;
      touch.current = null;
      settle();
      return;
    }
    const point = event.touches[0];
    touch.current = point ? { x: point.clientX, y: point.clientY, t: performance.now(), dragging: false } : null;
  };
  const onTouchMove = (event: TouchEvent) => {
    const start = touch.current;
    const point = event.touches[0];
    const node = mainRef.current;
    if (!start || !point || !node || multiTouch.current || reduceMotion()) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      start.dragging = true;
    }
    // Sem capítulo daquele lado, resiste mais.
    const blocked = (dx < 0 && !next) || (dx > 0 && !previous);
    const pull = Math.sign(dx) * Math.pow(Math.abs(dx), blocked ? 0.6 : 0.8);
    node.style.transition = "none";
    node.style.transform = `translateX(${pull}px)`;
    node.style.opacity = String(1 - Math.min(Math.abs(pull) / 600, 0.25));
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (multiTouch.current) {
      if (event.touches.length === 0) multiTouch.current = false;
      touch.current = null;
      return;
    }
    const start = touch.current;
    const point = event.changedTouches[0];
    touch.current = null;
    settle();
    if (!start || !point) return;
    if (window.getSelection()?.toString()) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.t);
    if (Math.abs(dx) < 80 && !(velocity > 0.11 && Math.abs(dx) > 30)) return;
    go(dx < 0 ? next : previous);
  };
  const onTouchCancel = () => {
    touch.current = null;
    settle();
  };

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
