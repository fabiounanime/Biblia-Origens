import { useEffect } from "react";
import { useLayers } from "@/lib/reader/layers";
import { useStudy } from "@/lib/study/store";

export function ThemeBinder() {
  useEffect(() => {
    useStudy.getState().hydrate();
    useLayers.getState().hydrate();
    const apply = () => {
      const state = useStudy.getState();
      document.documentElement.classList.toggle("light", state.theme === "light");
      document.documentElement.dataset.scale = state.fontScale;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", state.theme === "light" ? "#f4f5f9" : "#0d1120");
    };
    apply();
    return useStudy.subscribe(apply);
  }, []);
  return null;
}
