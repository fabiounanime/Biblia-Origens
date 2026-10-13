import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, CircleUser, House, Map as MapIcon, ScrollText } from "lucide-react";
import { SIGN_IN_PATH } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bookById } from "@/lib/bible/catalog";
import { useStudy } from "@/lib/study/store";
import { Avatar, BrandMark, cx } from "@/components/ui";

const NAV = [
  { to: "/inicio", label: "Início", icon: House },
  { to: "/ler", label: "Ler", icon: BookOpen },
  { to: "/estudos", label: "Estudos", icon: ScrollText },
  { to: "/mapas", label: "Mapas", icon: MapIcon },
  { to: "/conta", label: "Conta", icon: CircleUser },
] as const;

/** Esconde a barra inferior quando o leitor rola para baixo; volta ao subir. */
function useHideOnScroll(enabled: boolean): boolean {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }
    last.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last.current;
      if (Math.abs(delta) < 8) return;
      const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
      setHidden(delta > 0 && y > 120 && !nearBottom);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
  return hidden;
}

export function Shell({
  children,
  immersive = false,
  bare = false,
}: {
  children: ReactNode;
  /** Leitor: a barra inferior some ao rolar para baixo. */
  immersive?: boolean;
  /** Sem a barra superior do celular (a página traz a sua). */
  bare?: boolean;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const position = useStudy((state) => state.position);
  const ready = useStudy((state) => state.ready);
  const navHidden = useHideOnScroll(immersive);

  useEffect(() => {
    if (isPending || !userId) return;
    void useStudy.getState().sync();
  }, [isPending, userId]);

  // Ainda resolvendo a sessão: não mostra o menu nem redireciona.
  if (isPending) {
    return (
      <div className="app-backdrop grid min-h-dvh place-items-center text-muted">
        <div className="flex flex-col items-center gap-4">
          <BrandMark className="size-12 animate-pulse" />
          <p className="text-sm">Abrindo a conta…</p>
        </div>
      </div>
    );
  }

  // Sem login real, o app não abre.
  if (!user) {
    return <Navigate to={SIGN_IN_PATH} />;
  }

  const name = user.displayName ?? user.primaryEmail ?? "Leitor";
  const continueBook = ready && position ? bookById(position.bookId) : undefined;

  return (
    <div className="app-backdrop min-h-dvh text-fg">
      {/* Barra superior — só no celular */}
      {!bare ? (
        <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line/70 px-4 md:hidden">
          <Link to="/inicio" className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <span className="text-[1.05rem] font-bold tracking-tight">Bíblia Origens</span>
          </Link>
          <Link to="/conta" aria-label="Conta" className="rounded-full">
            <Avatar name={name} image={user.profileImageUrl} className="size-8 text-sm" />
          </Link>
        </header>
      ) : null}

      {/* Lateral — tablet e desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line/70 bg-surface/60 px-4 py-6 backdrop-blur md:flex">
        <Link to="/inicio" className="flex items-center gap-3 px-2">
          <BrandMark className="size-10" />
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">Bíblia Origens</span>
            <span className="block text-sm text-muted">Tanakh em três camadas</span>
          </span>
        </Link>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Principal">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors",
                  active ? "bg-tekhelet/14 text-fg" : "text-muted hover:bg-raised/60 hover:text-fg",
                )}
              >
                <Icon className={cx("size-5", active && "text-tekhelet")} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {continueBook && position ? (
          <Link
            to="/ler/$book/$chapter"
            params={{ book: continueBook.id, chapter: String(position.chapter) }}
            hash={position.verse > 1 ? `v${position.verse}` : undefined}
            className="mt-auto block rounded-2xl border border-line bg-raised/60 p-4 transition-colors hover:border-tekhelet/50"
          >
            <span className="text-sm text-muted">Continuar lendo</span>
            <span className="mt-1 flex items-baseline justify-between gap-2">
              <span className="font-semibold">
                {continueBook.namePt} {position.chapter}
              </span>
              <span className="he text-lg text-zahav" lang="he" dir="rtl">
                {continueBook.nameHe}
              </span>
            </span>
          </Link>
        ) : null}
      </aside>

      <div className="pb-28 md:pb-0 md:pl-64">{children}</div>

      {/* Barra inferior flutuante — celular */}
      <nav
        aria-label="Principal"
        className={cx(
          "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md transition-transform duration-300 ease-out md:hidden",
          navHidden && "nav-hidden",
        )}
      >
        <div className="glass flex h-16 items-stretch rounded-[22px] border border-line/80 px-1.5 shadow-float">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={cx(
                    "grid h-8 w-12 place-items-center rounded-full transition-colors",
                    active ? "bg-tekhelet/18 text-tekhelet" : "text-muted",
                  )}
                >
                  <Icon className="size-[1.3rem]" strokeWidth={active ? 2.3 : 1.8} aria-hidden />
                </span>
                <span className={cx("text-[0.7rem] font-medium", active ? "text-fg" : "text-muted")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Page({
  title,
  lead,
  top,
  action,
  wide,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  /** Acima do título: um link de volta, por exemplo. */
  top?: ReactNode;
  action?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={cx("mx-auto w-full px-4 pt-6 pb-10 sm:px-6 md:pt-12", wide ? "max-w-5xl" : "max-w-3xl")}>
      {top ? <div className="mb-4">{top}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight sm:text-[2.5rem]">{title}</h1>
          {lead ? <p className="mt-2 max-w-xl text-muted">{lead}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-7">{children}</div>
    </main>
  );
}

/** Link discreto de volta, usado no topo das páginas internas. */
export function BackLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1 rounded-full pr-3 text-sm font-medium text-muted transition-colors hover:text-fg">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}
