import { Toaster as Sonner } from "sonner";
import { useStudy } from "@/lib/study/store";

/** Avisos curtos ("Nota apagada · Desfazer"), acima da barra inferior no celular. */
export function Toaster() {
  const theme = useStudy((state) => state.theme);
  return (
    <Sonner
      theme={theme === "dark" ? "dark" : "light"}
      position="bottom-center"
      offset={24}
      mobileOffset={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      toastOptions={{
        style: {
          background: "var(--c-surface)",
          color: "var(--c-fg)",
          border: "1px solid var(--c-line)",
          borderRadius: "1.25rem",
          fontFamily: "var(--font-app)",
        },
      }}
    />
  );
}
