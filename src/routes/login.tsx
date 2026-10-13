import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BrandMark, Segmented, ThreadRing } from "@/components/ui";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Conta · Bíblia Origens" }] }),
  component: LoginPage,
});

function ptAuthError(message: string | undefined): string {
  const text = (message ?? "").toLowerCase();
  if (text.includes("exist") || text.includes("already")) return "Já existe uma conta com este e-mail.";
  if (text.includes("password") || text.includes("short")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (text.includes("credential") || text.includes("invalid email or")) return "E-mail ou senha não conferem.";
  if (text.includes("email")) return "Não foi possível usar este e-mail.";
  return "Não foi possível concluir. Tente de novo.";
}

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Já autenticado: vai direto ao menu.
  useEffect(() => {
    if (isPending || !user) return;
    void navigate({ to: "/inicio" });
  }, [isPending, user, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result =
      mode === "criar"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: "/inicio" })
        : await authClient.signIn.email({ email: email.trim(), password, callbackURL: "/inicio" });
    setPending(false);
    if (result.error) {
      setError(ptAuthError(result.error.message));
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
              <div className="my-6 flex items-center gap-3 text-sm text-muted">
                <span className="h-px flex-1 bg-line" />
                ou
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="space-y-3">
                {GROK_PROVIDERS.map((provider) => (
                  <button
                    key={provider.providerId}
                    type="button"
                    onClick={() => signIn(provider.providerId, { callbackURL: "/inicio" })}
                    className="h-12 w-full rounded-full border border-line bg-surface font-semibold transition-colors hover:border-muted"
                  >
                    Continuar com {provider.label}
                  </button>
                ))}
              </div>
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
