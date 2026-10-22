import { useSyncExternalStore } from "react";

/**
 * A largura da tela casa com a media query? No servidor (e no primeiro
 * desenho) responde false: a versão do celular aparece primeiro.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
