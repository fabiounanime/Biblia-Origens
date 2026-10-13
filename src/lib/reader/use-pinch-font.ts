import { useEffect, useState, type RefObject } from "react";
import { useStudy } from "@/lib/study/store";
import type { FontScale } from "@/lib/study/types";

/** Tamanho do texto de leitura em rem, igual ao de `html[data-scale]` em styles.css. */
export const SCALE_REM: Record<FontScale, number> = { sm: 1.05, md: 1.2, lg: 1.38, xl: 1.6 };

export const SCALE_LABEL: Record<FontScale, string> = {
  sm: "Pequeno",
  md: "Médio",
  lg: "Grande",
  xl: "Muito grande",
};

export const SCALE_ORDER: FontScale[] = ["sm", "md", "lg", "xl"];

// Um pouco além dos extremos, para o gesto ter folga antes de encaixar.
const MIN_REM = 0.95;
const MAX_REM = 1.75;

function nearestScale(rem: number): FontScale {
  return SCALE_ORDER.reduce<FontScale>(
    (best, id) => (Math.abs(SCALE_REM[id] - rem) < Math.abs(SCALE_REM[best] - rem) ? id : best),
    "md",
  );
}

function fingerDistance(touches: TouchList): number {
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return 0;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Gesto de pinça no leitor: afastar os dedos aumenta o texto, aproximar diminui.
 * Durante o gesto o tamanho muda de forma contínua (sem re-render); ao soltar,
 * encaixa no tamanho mais próximo e salva a preferência. O versículo sob os dedos
 * fica parado na tela enquanto o texto cresce ou encolhe.
 *
 * O elemento-alvo deve ter `touch-action: pan-x pan-y` para o navegador não
 * aplicar o zoom da página no lugar do gesto.
 */
export function usePinchFont(target: RefObject<HTMLElement | null>, enabled: boolean): FontScale | null {
  const [preview, setPreview] = useState<FontScale | null>(null);

  useEffect(() => {
    const el = target.current;
    if (!enabled || !el) return;
    const root = document.documentElement;

    let pinching = false;
    let startDistance = 0;
    let startRem = SCALE_REM.md;
    let rem = startRem;
    let shown: FontScale | null = null;
    let anchor: HTMLElement | null = null;
    let anchorTop = 0;
    let frame = 0;
    let hideTimer = 0;

    const keepAnchor = () => {
      if (!anchor) return;
      const drift = anchor.getBoundingClientRect().top - anchorTop;
      if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
    };

    const paint = () => {
      frame = 0;
      root.style.setProperty("--read-size", `${rem}rem`);
      keepAnchor();
    };

    const findAnchor = (y: number): HTMLElement | null => {
      for (const node of el.querySelectorAll<HTMLElement>("[data-verse], [data-anchor]")) {
        if (node.getBoundingClientRect().bottom >= y) return node;
      }
      return null;
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      const a = event.touches[0];
      const b = event.touches[1];
      if (!a || !b) return;
      pinching = true;
      startDistance = fingerDistance(event.touches);
      const current = useStudy.getState().fontScale;
      startRem = SCALE_REM[current];
      rem = startRem;
      anchor = findAnchor((a.clientY + b.clientY) / 2);
      anchorTop = anchor?.getBoundingClientRect().top ?? 0;
      shown = current;
      window.clearTimeout(hideTimer);
      setPreview(current);
    };

    const onMove = (event: TouchEvent) => {
      if (!pinching || event.touches.length !== 2 || startDistance === 0) return;
      const ratio = fingerDistance(event.touches) / startDistance;
      rem = Math.min(MAX_REM, Math.max(MIN_REM, startRem * ratio));
      if (!frame) frame = window.requestAnimationFrame(paint);
      const step = nearestScale(rem);
      if (step !== shown) {
        shown = step;
        setPreview(step);
        // Pequeno toque de vibração ao passar de um tamanho para outro (Android).
        if (typeof navigator.vibrate === "function") navigator.vibrate(8);
      }
    };

    const onEnd = (event: TouchEvent) => {
      if (!pinching || event.touches.length >= 2) return;
      pinching = false;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      const step = nearestScale(rem);
      root.style.removeProperty("--read-size");
      if (step !== useStudy.getState().fontScale) useStudy.getState().setFontScale(step);
      window.requestAnimationFrame(() => {
        keepAnchor();
        anchor = null;
      });
      hideTimer = window.setTimeout(() => setPreview(null), 900);
    };

    // Safari no iPhone: impede o zoom da página quando o gesto começa no texto.
    const blockPageZoom = (event: Event) => event.preventDefault();

    el.addEventListener("gesturestart", blockPageZoom);
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("gesturestart", blockPageZoom);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
      root.style.removeProperty("--read-size");
    };
  }, [target, enabled]);

  return preview;
}
