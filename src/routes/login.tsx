import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

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

  if (isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
        <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      </main>
    );
  }

  if (user) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
        <p className="text-muted">Abrindo o app…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <p className="text-xs uppercase tracking-widest text-gold">Conta</p>
      <h1 className="mt-2 text-4xl">{mode === "criar" ? "Criar conta" : "Entrar"}</h1>
      <p className="mt-3 text-muted">
        Para usar a Bíblia Origens, entre com Google ou com e-mail e senha. Sem conta, o app não abre.
      </p>

      {authEnabled ? (
        <>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {mode === "criar" ? (
              <label className="block">
                <span className="text-sm text-muted">Nome</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-1 w-full rounded-2xl border border-line bg-surface px-4 py-3"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-sm text-muted">E-mail</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-2xl border border-line bg-surface px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Senha</span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "criar" ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-2xl border border-line bg-surface px-4 py-3"
              />
            </label>
            {error ? <p className="text-gold">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full rounded-full bg-gold text-bg disabled:opacity-60"
            >
              {pending ? "Aguarde…" : mode === "criar" ? "Criar conta" : "Entrar"}
            </button>
          </form>
          <button
            type="button"
            className="mt-4 text-muted"
            onClick={() => {
              setMode(mode === "criar" ? "entrar" : "criar");
              setError(null);
            }}
          >
            {mode === "criar" ? "Já tenho conta" : "Criar uma conta"}
          </button>
          <p className="mt-8 text-center text-sm text-muted">ou</p>
          <div className="mt-4 space-y-3">
            {GROK_PROVIDERS.map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                onClick={() => signIn(provider.providerId, { callbackURL: "/inicio" })}
                className="min-h-12 w-full rounded-full border border-line bg-surface"
              >
                Continuar com {provider.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-8 text-muted">O acesso está desligado neste ambiente.</p>
      )}
    </main>
  );
}
