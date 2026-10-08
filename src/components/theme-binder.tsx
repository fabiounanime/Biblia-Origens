import { useEffect } from "react";
import { useStudy } from "@/lib/study/store";

export function ThemeBinder() {
  useEffect(() => {
    useStudy.getState().hydrate();
    const apply = () => {
      const state = useStudy.getState();
      document.documentElement.classList.toggle("light", state.theme === "light");
      document.documentElement.dataset.scale = state.fontScale;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", state.theme === "light" ? "#f3e6cf" : "#140e0a");
    };
    apply();
    return useStudy.subscribe(apply);
  }, []);
  return null;
}
