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

  // iPhone: o Safari ignora "user-scalable=no"; bloquear os eventos de gesto
  // impede o zoom da página. A pinça do leitor usa eventos de toque, que seguem
  // funcionando normalmente.
  useEffect(() => {
    const block = (event: Event) => event.preventDefault();
    const options: AddEventListenerOptions = { passive: false };
    document.addEventListener("gesturestart", block, options);
    document.addEventListener("gesturechange", block, options);
    document.addEventListener("gestureend", block, options);
    return () => {
      document.removeEventListener("gesturestart", block, options);
      document.removeEventListener("gesturechange", block, options);
      document.removeEventListener("gestureend", block, options);
    };
  }, []);
  return null;
}
