import type { ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, CircleUser, Map, ScrollText } from "lucide-react";
import { useEffect } from "react";
import { SIGN_IN_PATH } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useStudy } from "@/lib/study/store";

const NAV = [
  { to: "/ler", label: "Ler", icon: BookOpen },
  { to: "/estudos", label: "Estudos", icon: ScrollText },
  { to: "/mapas", label: "Mapas", icon: Map },
  { to: "/conta", label: "Conta", icon: CircleUser },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;

  useEffect(() => {
    if (isPending || !userId) return;
    void useStudy.getState().sync();
  }, [isPending, userId]);

  // Ainda resolvendo a sessão: não mostra o menu nem redireciona.
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-muted">
        Abrindo a conta…
      </div>
    );
  }

  // Sem login real, o app não abre.
  if (!user) {
    return <Navigate to={SIGN_IN_PATH} />;
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur md:hidden">
        <Link to="/inicio" className="text-xl">
          Bíblia Origens
        </Link>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-bg/95 backdrop-blur md:inset-y-0 md:right-auto md:w-56 md:flex-col md:border-t-0 md:border-r md:px-4 md:py-8">
        <Link to="/inicio" className="mb-8 hidden px-3 text-2xl md:block">
          Bíblia Origens
        </Link>
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs md:min-h-11 md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 md:text-lg ${
                active ? "text-gold" : "text-muted"
              }`}
            >
              <Icon strokeWidth={1.5} className="size-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="pb-20 md:pb-12 md:pl-56">{children}</div>
    </div>
  );
}

export function Page({
  kicker,
  title,
  wide,
  children,
}: {
  kicker?: string;
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={`mx-auto w-full px-5 py-8 ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
      {kicker ? <p className="text-xs uppercase tracking-widest text-gold">{kicker}</p> : null}
      <h1 className="mt-2 text-4xl">{title}</h1>
      <div className="mt-8">{children}</div>
    </main>
  );
}
