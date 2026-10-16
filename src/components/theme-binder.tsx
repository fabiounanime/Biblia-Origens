import { useEffect } from "react";
import { useLayers } from "@/lib/reader/layers";
import { useStudy } from "@/lib/study/store";

/** Cor da barra do navegador em cada tema. */
const THEME_COLOR = { dark: "#0d1120", light: "#f4f5f9", sepia: "#f3e9d4" } as const;

export function ThemeBinder() {
  useEffect(() => {
    useStudy.getState().hydrate();
    useLayers.getState().hydrate();
    const apply = () => {
      const state = useStudy.getState();
      const root = document.documentElement;
      // Pergaminho é um tema claro: leva "light" (tinta da marca, contraste) e "sepia" (cores).
      root.classList.toggle("light", state.theme !== "dark");
      root.classList.toggle("sepia", state.theme === "sepia");
      root.dataset.scale = state.fontScale;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", THEME_COLOR[state.theme]);
    };
    apply();
    return useStudy.subscribe(apply);
  }, []);
  return null;
}
