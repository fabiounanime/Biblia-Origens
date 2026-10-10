import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
    <main className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <img
        src="/splash.jpg"
        alt=""
        className="splash-photo absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-bg/80" />
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="splash-seal he" lang="he" dir="rtl">
          יהוה
        </p>
        <h1 className="splash-title mt-8 text-5xl">Bíblia Origens</h1>
        <p className="splash-slogan mt-4 text-2xl text-gold italic">A Palavra, desde a origem.</p>
        <Link
          to={user ? "/inicio" : "/login"}
          className="splash-cta mt-10 inline-flex min-h-12 items-center rounded-full border border-gold px-8 text-lg text-gold"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
