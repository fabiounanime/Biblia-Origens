/**
 * Opções do pool do Postgres (`pg`) conforme o ambiente.
 *
 * No Cloudflare Workers, uma conexão TCP aberta durante uma requisição não pode
 * ser usada por outra ("Cannot perform I/O on behalf of a different request").
 * Um pool comum guarda conexões ociosas e as reaproveita, o que quebra na
 * segunda requisição do mesmo isolate. Lá, cada conexão é usada uma vez só.
 * Em Node (Vercel, desenvolvimento) o pool funciona normalmente.
 */
export const onCloudflareWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

export function pgPoolOptions(connectionString: string): {
  connectionString: string;
  max?: number;
  maxUses?: number;
  idleTimeoutMillis?: number;
} {
  if (!onCloudflareWorkers) return { connectionString };
  return { connectionString, max: 5, maxUses: 1, idleTimeoutMillis: 1000 };
}
