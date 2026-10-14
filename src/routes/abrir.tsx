import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Wordmark } from "@/components/ui";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

/** Abertura do app instalado (start_url do manifesto). */
export const Route = createFileRoute("/abrir")({
  head: () => ({ meta: [{ title: "Bíblia Origens" }, { name: "robots", content: "noindex" }] }),
  component: Splash,
});

/** Quanto tempo a abertura fica na tela, contado desde que ela aparece. */
const SPLASH_MS = 6000;

function Splash() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    shownAt.current ??= performance.now();
  }, []);

  useEffect(() => {
    if (isPending) return;
    // Os 6 s contam desde que a abertura apareceu, não desde que a sessão
    // terminou de carregar: quem já está logado não espera mais que isso.
    const elapsed = performance.now() - (shownAt.current ?? performance.now());
    const timer = window.setTimeout(() => {
      // Com sessão, vai ao menu. Sem sessão, só o login libera o app.
      void navigate({ to: user ? "/inicio" : "/login", replace: true });
    }, Math.max(0, SPLASH_MS - elapsed));
    return () => window.clearTimeout(timer);
  }, [navigate, user, isPending]);

  return (
    <main className="brand-dark app-backdrop relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-fg">
      <div
        className="splash-photo pointer-events-none absolute -top-1/3 left-1/2 size-[46rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(91 140 255 / 0.55), rgb(182 124 255 / 0.25) 45%, transparent 70%)" }}
        aria-hidden="true"
      />
      <img
        src="/icons/logo-360.png"
        alt=""
        width={168}
        height={168}
        className="splash-seal splash-logo relative size-[168px]"
        draggable={false}
      />
      <Wordmark as="h1" stacked className="splash-title wordmark-lg relative mt-8 text-[2.75rem] leading-[1.05]" />
      <div className="splash-rule ornament-rule relative mt-4" aria-hidden="true">
        ✦
      </div>
      <p className="splash-slogan manuscript-italic relative mt-3 text-[1.45rem] text-soft">A Palavra, desde a origem.</p>
    </main>
  );
}
