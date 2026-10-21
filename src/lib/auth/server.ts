/**
 * Better Auth do próprio app (só servidor), em `/api/auth/*`.
 *
 * Formas de entrar:
 *   - e-mail e senha (contas no banco do app; ligado em `./email-password`);
 *   - Google direto, com as credenciais do Google Cloud do app
 *     (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
 *
 * Em produção (Cloudflare) vêm do Worker: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
 * `DATABASE_URL` e as credenciais do Google. No computador (`npm run dev`), sem
 * `DATABASE_URL`, as contas ficam no banco embutido (PGLite) e o segredo é gerado
 * na hora.
 *
 * Nunca importe este arquivo no código do navegador: ele traz `pg` e o segredo.
 * O navegador usa `@/lib/auth/client`; as telas leem o usuário por
 * `@/lib/auth/use-current-user`; as funções do servidor recebem o id verificado
 * por `@/lib/auth/middleware`.
 */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { pgPoolOptions } from "../pg-options";
import { emailAndPasswordEnabled } from "./email-password";
import { pgliteDialect } from "./pglite-dialect";

// Já prepara o banco embutido assim que o módulo carrega.
void ensureDbReady();

/**
 * Segredo de desenvolvimento, usado só sem `BETTER_AUTH_SECRET`. Fica em
 * `globalThis` para sobreviver ao recarregamento do Vite (HMR) sem invalidar as
 * sessões do banco embutido; reiniciar o processo zera os dois juntos.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __bibliaOrigensDevAuthSecret__?: string;
};
function devAuthSecret(): string {
  globalAuthRef.__bibliaOrigensDevAuthSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__bibliaOrigensDevAuthSecret__;
}

/** Lê uma variável de ambiente; vazia ou só espaços conta como ausente. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Desliga o login de vez (entra o usuário de desenvolvimento). Em produção a
// Cloudflare define VITE_AUTH_ENABLED=true.
const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** Login ligado. */
export const authConfigured = !authDisabled;

// Endereço do app. Em produção vem de BETTER_AUTH_URL. No computador, o Better
// Auth deduz pelo pedido, aceitando só os endereços locais.
const explicitBaseURL = env("BETTER_AUTH_URL");
// `npm run dev` (porta 8080). O navegador pode mandar qualquer uma destas
// origens para o mesmo servidor; aceitar só `localhost` recusa `127.0.0.1` e
// quebra o login com e-mail ("Invalid origin").
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? {
  allowedHosts: ["localhost", "127.0.0.1", "[::1]"],
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

// Origens aceitas nos POSTs de login (cadastro, entrada etc.). Faltar uma aqui
// aparece como FORBIDDEN "Invalid origin".
// Outros endereços públicos do mesmo app (ex.: domínio próprio e o *.workers.dev),
// separados por vírgula em BETTER_AUTH_TRUSTED_ORIGINS.
const extraTrustedOrigins: string[] = (env("BETTER_AUTH_TRUSTED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const trustedOrigins: string[] = explicitBaseURL
  ? [explicitBaseURL.replace(/\/+$/, ""), ...extraTrustedOrigins, ...LOCAL_DEV_ORIGINS]
  : LOCAL_DEV_ORIGINS;

const databaseUrl = env("DATABASE_URL");

// Postgres de verdade com `DATABASE_URL` (produção); senão o PGLite embutido,
// pelo mesmo dialeto Kysely, no mesmo banco dos dados do app. O esquema do
// login está em `migrations/0001_auth.sql`.
const database = databaseUrl
  ? new Pool(pgPoolOptions(databaseUrl))
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

// Login direto com o Google (credenciais do Google Cloud do próprio app).
// Endereço de retorno a cadastrar no Google Cloud:
//   <BETTER_AUTH_URL>/api/auth/callback/google
const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");
export const googleDirectConfigured = !authDisabled && Boolean(googleClientId && googleClientSecret);

/** Prefixo dos cookies de sessão do app. */
const COOKIE_PREFIX = "__Host-biblia-origens";

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? devAuthSecret(),
  database,
  trustedOrigins,

  // Guarda os tokens do Google criptografados e liga a conta do Google à conta
  // de e-mail e senha com o mesmo endereço.
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },

  // Guarda a sessão num cookie assinado de vida curta, para as leituras de
  // sessão não irem ao banco toda vez.
  session: { cookieCache: { enabled: true, maxAge: 300 } },

  ...(googleDirectConfigured
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
            // Sempre mostra o seletor de contas do Google.
            prompt: "select_account" as const,
          },
        },
      }
    : {}),

  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),

  // Cookies `__Host-`: exigem Secure + Path=/ e recusam o atributo Domain, então
  // nenhum outro site pode plantar um cookie de sessão neste app. O Better Auth
  // usaria `__Secure-` (que permite Domain), por isso o prefixo automático fica
  // desligado e os nomes são definidos aqui. Navegadores aceitam cookies Secure
  // em http://localhost, então o desenvolvimento local continua funcionando.
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: `${COOKIE_PREFIX}.session_token` },
      session_data: { name: `${COOKIE_PREFIX}.session_data` },
      account_data: { name: `${COOKIE_PREFIX}.account_data` },
      dont_remember: { name: `${COOKIE_PREFIX}.dont_remember` },
    },
  },

  plugins: [
    // Passa os Set-Cookie do Better Auth para as respostas do TanStack Start.
    // Precisa ser o último plugin.
    tanstackStartCookies(),
  ],
});
