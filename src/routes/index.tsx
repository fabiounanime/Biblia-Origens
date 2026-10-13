import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ThreadRing } from "@/components/ui";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (isPending) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      // Com sessão, vai ao menu. Sem sessão, só o login libera o app.
      void navigate({ to: user ? "/inicio" : "/login" });
    }, reduce ? 500 : 2800);
    return () => window.clearTimeout(timer);
  }, [navigate, user, isPending]);

  return (
    <main className="app-backdrop relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-fg">
      <div
        className="splash-photo pointer-events-none absolute -top-1/3 left-1/2 size-[46rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(91 140 255 / 0.55), rgb(182 124 255 / 0.25) 45%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="splash-seal relative grid place-items-center">
        <ThreadRing className="size-36" />
        <p className="he absolute text-5xl text-zahav" lang="he" dir="rtl">
          יהוה
        </p>
      </div>
      <h1 className="splash-title relative mt-10 text-5xl font-extrabold tracking-tight">Bíblia Origens</h1>
      <p className="splash-slogan relative mt-3 font-read text-2xl text-soft italic">A Palavra, desde a origem.</p>
      <Link
        to={user ? "/inicio" : "/login"}
        className="splash-cta relative mt-10 inline-flex h-12 items-center rounded-full bg-tekhelet px-8 text-lg font-semibold text-on-accent shadow-float"
      >
        Entrar
      </Link>
    </main>
  );
}
