/**
 * Diagnóstico do login e do banco (server-only).
 *
 * Mostra SE cada configuração existe e se funciona — nunca o valor de um segredo.
 * Do banco, só o nome do servidor (host) aparece.
 */
import type { Diagnosis, DiagnosisCheck, GoogleMode } from "@/lib/diagnostics";

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const stripSlash = (url: string) => url.replace(/\/+$/, "");

function databaseHost(url: string): string {
  try {
    return new URL(url).hostname || "servidor desconhecido";
  } catch {
    return "endereço em formato inválido";
  }
}

/** Mensagem de erro sem credenciais (connection strings são removidas). */
function safeMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.replace(/postgres(ql)?:\/\/\S+/gi, "[endereço do banco]").slice(0, 240);
}

async function googleMode(): Promise<GoogleMode> {
  const { googleDirectConfigured } = await import("@/lib/auth/server");
  return googleDirectConfigured ? "direct" : "off";
}

/** Só o modo do Google, sem tocar no banco — usado pela tela de login. */
export async function loginConfig(): Promise<{ googleMode: GoogleMode }> {
  return { googleMode: await googleMode() };
}

export async function diagnose(request: Request): Promise<Diagnosis> {
  const origin = new URL(request.url).origin;
  const checks: DiagnosisCheck[] = [];
  const baseUrl = env("BETTER_AUTH_URL");
  const extraOrigins = (env("BETTER_AUTH_TRUSTED_ORIGINS") ?? "")
    .split(",")
    .map((item) => stripSlash(item.trim()))
    .filter(Boolean);

  // 1. Endereço do app
  if (!baseUrl) {
    checks.push({
      id: "endereco",
      label: "Endereço do app (BETTER_AUTH_URL)",
      status: "warn",
      detail: `Não definido. Defina como ${origin} no Worker.`,
    });
  } else if (stripSlash(baseUrl) === origin || extraOrigins.includes(origin)) {
    checks.push({ id: "endereco", label: "Endereço do app (BETTER_AUTH_URL)", status: "ok", detail: stripSlash(baseUrl) });
  } else {
    checks.push({
      id: "endereco",
      label: "Endereço do app (BETTER_AUTH_URL)",
      status: "error",
      detail: `Configurado como ${stripSlash(baseUrl)}, mas o app está aberto em ${origin}. O login é recusado ("Invalid origin"). Ajuste BETTER_AUTH_URL para ${origin}.`,
    });
  }

  // 2. Chave das sessões
  checks.push(
    env("BETTER_AUTH_SECRET")
      ? { id: "segredo", label: "Chave das sessões (BETTER_AUTH_SECRET)", status: "ok", detail: "Definida." }
      : {
          id: "segredo",
          label: "Chave das sessões (BETTER_AUTH_SECRET)",
          status: "error",
          detail: "Não definida: o servidor cria uma chave nova a cada reinício e derruba quem já entrou.",
        },
  );

  // 3 e 4. Banco e tabelas
  const databaseUrl = env("DATABASE_URL");
  if (!databaseUrl) {
    checks.push({
      id: "banco",
      label: "Banco de dados (DATABASE_URL)",
      status: "error",
      detail: "Não definido: as contas ficariam num banco temporário que some a cada reinício.",
    });
  } else {
    try {
      const { ensureSchema, getSql } = await import("@/lib/db");
      await ensureSchema();
      const sql = await getSql();
      await sql`select 1 as ok`;
      checks.push({
        id: "banco",
        label: "Banco de dados (DATABASE_URL)",
        status: "ok",
        detail: `Conectado a ${databaseHost(databaseUrl)}.`,
      });

      const wanted = ["user", "session", "account", "verification", "user_prefs", "reading_position", "marks", "guide_progress"];
      const rows = await sql<{ name: string; present: boolean }>`
        select t.name, to_regclass('public.' || quote_ident(t.name)) is not null as present
        from unnest(${wanted}::text[]) as t(name)`;
      const missing = rows.filter((row) => !row.present).map((row) => row.name);
      if (missing.length > 0) {
        checks.push({
          id: "tabelas",
          label: "Tabelas de login e estudo",
          status: "error",
          detail: `Faltando: ${missing.join(", ")}.`,
        });
      } else {
        const [count] = await sql<{ n: number }>`select count(*)::int as n from "user"`;
        const total = count?.n ?? 0;
        checks.push({
          id: "tabelas",
          label: "Tabelas de login e estudo",
          status: "ok",
          detail: `Todas criadas. ${total} ${total === 1 ? "conta cadastrada" : "contas cadastradas"}.`,
        });
      }
    } catch (err) {
      checks.push({
        id: "banco",
        label: "Banco de dados (DATABASE_URL)",
        status: "error",
        detail: `Não conectou em ${databaseHost(databaseUrl)}: ${safeMessage(err)}`,
      });
    }
  }

  // 5. E-mail e senha
  const { emailAndPasswordEnabled } = await import("@/lib/auth/email-password");
  checks.push(
    emailAndPasswordEnabled
      ? { id: "email", label: "Criar conta com e-mail e senha", status: "ok", detail: "Habilitado." }
      : { id: "email", label: "Criar conta com e-mail e senha", status: "warn", detail: "Desligado no código." },
  );

  // 6. Google
  const mode = await googleMode();
  const callback = `${baseUrl ? stripSlash(baseUrl) : origin}/api/auth/callback/google`;
  if (mode === "direct") {
    checks.push({
      id: "google",
      label: "Entrar com Google",
      status: "ok",
      detail: `Login direto configurado. No Google Cloud, o endereço de retorno autorizado deve ser ${callback}.`,
    });
  } else {
    checks.push({
      id: "google",
      label: "Entrar com Google",
      status: "warn",
      detail: `Faltam GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no Worker; o botão do Google fica oculto. No Google Cloud, use o endereço de retorno ${callback}.`,
    });
  }

  return { checkedAt: new Date().toISOString(), origin, googleMode: mode, googleCallback: callback, checks };
}
