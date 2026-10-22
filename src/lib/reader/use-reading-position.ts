import { useEffect, type RefObject } from "react";
import type { Verse } from "@/lib/bible/corpus";
import { useStudy } from "@/lib/study/store";

/** Ponto de leitura: o capítulo aberto e, ao rolar, o versículo mais alto visível. */
export function useReadingPosition(valid: boolean, bookId: string, chapter: number, verses: Verse[] | null | "loading") {
  const setPosition = useStudy((state) => state.setPosition);

  // O capítulo aberto (o versículo é atualizado ao rolar).
  useEffect(() => {
    if (!valid) return;
    const current = useStudy.getState().position;
    if (!current || current.bookId !== bookId || current.chapter !== chapter) {
      setPosition(bookId, chapter, 0);
    }
  }, [valid, bookId, chapter, setPosition]);

  // Versículo mais alto visível vira o ponto de leitura.
  useEffect(() => {
    if (!Array.isArray(verses) || verses.length === 0) return;
    const visible = new Set<number>();
    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = Number((entry.target as HTMLElement).dataset.verse);
          if (entry.isIntersecting) visible.add(v);
          else visible.delete(v);
        }
        if (visible.size === 0) return;
        const top = Math.min(...visible);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const current = useStudy.getState().position;
          if (current?.bookId === bookId && current.chapter === chapter && current.verse === top) return;
          setPosition(bookId, chapter, top);
        }, 900);
      },
      { rootMargin: "-72px 0px -55% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-verse]").forEach((node) => observer.observe(node));
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [verses, bookId, chapter, setPosition]);
}

/** Barra de progresso do capítulo, sem re-render. */
export function useScrollProgress(progressRef: RefObject<HTMLDivElement | null>, verses: unknown) {
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [progressRef, verses]);
}
