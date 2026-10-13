import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BrandMark, Segmented, ThreadRing } from "@/components/ui";
import type { GoogleMode } from "@/lib/diagnostics";

type LoginSearch = { error?: string };

export const Route = createFileRoute("/login")({
  // O Better Auth volta para cá com ?error=… quando o login social falha.
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({ meta: [{ title: "Conta · Bíblia Origens" }] }),
  component: LoginPage,
});

type AuthError = { message?: string; code?: string; status?: number };

const SERVER_PROBLEM = "O servidor de login não respondeu como deveria. Abra o diagnóstico para ver a causa.";

function ptAuthError(error: AuthError): string {
  const code = (error.code ?? "").toUpperCase();
  const text = (error.message ?? "").toLowerCase();
  if (code.includes("ALREADY_EXISTS") || text.includes("already exists")) return "Já existe uma conta com este e-mail.";
  if (code === "INVALID_EMAIL_OR_PASSWORD" || text.includes("invalid email or password") || text.includes("credential"))
    return "E-mail ou senha não conferem.";
  if (code === "PASSWORD_TOO_SHORT" || text.includes("too short")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (code === "PASSWORD_TOO_LONG" || text.includes("too long")) return "A senha é longa demais.";
  if (code === "INVALID_EMAIL" || text.includes("invalid email")) return "Este e-mail não parece válido.";
  if (text.includes("origin")) return "Este endereço do app não está autorizado no servidor. Abra o diagnóstico.";
  if ((error.status ?? 0) >= 500) return SERVER_PROBLEM;
  return "Não foi possível concluir. Tente de novo.";
}

function ptSocialError(code: string): string {
  if (code === "access_denied") return "O login com Google foi cancelado.";
  return "Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.";
}

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(search.error ? ptSocialError(search.error) : null);
  const [pending, setPending] = useState(false);
  const [googleMode, setGoogleMode] = useState<GoogleMode | "loading">("loading");

  // Qual login com Google o servidor oferece (direto, pelo Grok ou nenhum).
  useEffect(() => {
    let cancel = false;
    fetch("/api/diagnostico?resumo=1", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ googleMode?: GoogleMode }>)
      .then((body) => {
        if (!cancel) setGoogleMode(body.googleMode ?? "off");
      })
      .catch(() => {
        if (!cancel) setGoogleMode("off");
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function onGoogle() {
    setError(null);
    try {
      if (googleMode === "direct") {
        const { error: socialError } = await authClient.signIn.social({
          provider: "google",
          callbackURL: "/inicio",
          errorCallbackURL: "/login",
        });
        if (socialError) setError(ptAuthError(socialError));
        return;
      }
      const provider = GROK_PROVIDERS[0];
      if (provider) await signIn(provider.providerId, { callbackURL: "/inicio", errorCallbackURL: "/login" });
    } catch {
      setError(ptSocialError(""));
    }
  }

  // Já autenticado: vai direto ao menu.
  useEffect(() => {
    if (isPending || !user) return;
    void navigate({ to: "/inicio" });
  }, [isPending, user, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    let result;
    try {
      result =
        mode === "criar"
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: "/inicio" })
          : await authClient.signIn.email({ email: email.trim(), password, callbackURL: "/inicio" });
    } catch {
      setPending(false);
      setError(SERVER_PROBLEM);
      return;
    }
    setPending(false);
    if (result.error) {
      setError(ptAuthError(result.error));
      return;
    }
    await router.invalidate();
    await navigate({ to: "/inicio" });
  }

  if (isPending || user) {
    return (
      <main className="app-backdrop grid min-h-dvh place-items-center px-5">
        <div className="flex flex-col items-center gap-4 text-muted">
          <BrandMark className="size-12 animate-pulse" />
          <p className="text-sm">{user ? "Abrindo o app…" : "Verificando a conta…"}</p>
        </div>
      </main>
    );
  }

  const inputClass =
    "mt-1.5 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base placeholder:text-muted focus:border-tekhelet/60 focus:outline-none";

  return (
    <main className="app-backdrop grid min-h-dvh lg:grid-cols-2">
      {/* Painel de abertura — desktop */}
      <section className="relative hidden overflow-hidden border-r border-line/70 bg-sunken lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute -bottom-40 -left-40 size-[40rem] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(91 140 255 / 0.5), rgb(182 124 255 / 0.2) 50%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <BrandMark className="size-10" />
          <span className="text-lg font-bold tracking-tight">Bíblia Origens</span>
        </div>
        <div className="relative">
          <p className="he text-7xl leading-tight text-zahav" lang="he" dir="rtl">
            בְּרֵאשִׁית בָּרָא אֱלֹהִים
          </p>
          <p className="mt-4 font-read text-xl text-soft italic">bereshit bara Elohim</p>
          <p className="mt-1 font-read text-xl">No princípio criou Deus</p>
        </div>
        <p className="relative max-w-sm text-muted">
          Português direto, hebraico e transliterado, versículo por versículo. Sem versões no meio.
        </p>
      </section>

      {/* Formulário */}
      <section className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative grid place-items-center lg:hidden">
              <ThreadRing className="size-20" />
              <BrandMark className="absolute size-11" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight lg:mt-0">
              {mode === "criar" ? "Criar sua conta" : "Bem-vindo de volta"}
            </h1>
            <p className="mt-2 text-muted">
              Entre para ler e guardar suas marcas e notas em todos os seus aparelhos.
            </p>
          </div>

          {authEnabled ? (
            <>
              <div className="mt-8">
                <Segmented<"entrar" | "criar">
                  label="Entrar ou criar conta"
                  value={mode}
                  onChange={(next) => {
                    setMode(next);
                    setError(null);
                  }}
                  options={[
                    { id: "entrar", label: "Entrar" },
                    { id: "criar", label: "Criar conta" },
                  ]}
                />
              </div>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {mode === "criar" ? (
                  <label className="block">
                    <span className="text-sm font-medium text-soft">Nome</span>
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </label>
                ) : null}
                <label className="block">
                  <span className="text-sm font-medium text-soft">E-mail</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-soft">Senha</span>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "criar" ? "new-password" : "current-password"}
                    placeholder="Pelo menos 8 caracteres"
                    className={inputClass}
                  />
                </label>
                {error ? (
                  <p role="alert" className="rounded-2xl bg-shani/12 px-4 py-3 text-sm font-medium text-shani">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={pending}
                  className="h-12 w-full rounded-full bg-tekhelet font-semibold text-on-accent transition-opacity disabled:opacity-60"
                >
                  {pending ? "Aguarde…" : mode === "criar" ? "Criar conta" : "Entrar"}
                </button>
              </form>
              {googleMode === "loading" ? (
                <div className="mt-6 h-12 animate-pulse rounded-full bg-surface" aria-hidden />
              ) : googleMode !== "off" ? (
                <>
                  <div className="my-6 flex items-center gap-3 text-sm text-muted">
                    <span className="h-px flex-1 bg-line" />
                    ou
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <button
                    type="button"
                    onClick={() => void onGoogle()}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-surface font-semibold transition-colors hover:border-muted"
                  >
                    <GoogleLogo />
                    Continuar com Google
                  </button>
                </>
              ) : null}
              <p className="mt-8 text-center text-sm text-muted">
                Problemas para entrar?{" "}
                <Link to="/diagnostico" className="font-medium text-tekhelet hover:underline">
                  Ver diagnóstico
                </Link>
              </p>
            </>
          ) : (
            <p className="mt-8 rounded-2xl border border-line bg-surface px-4 py-3 text-muted">
              O acesso está desligado neste ambiente.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

/** Marca do Google em cores oficiais, exigida nos botões de login com Google. */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
