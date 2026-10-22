# Preparação local

## Pré-requisitos

- Node.js 22 ou mais novo (usado aqui: 24) e npm.
- Git. No Windows, os comandos dos documentos funcionam no Git Bash e no PowerShell.
- Para montar o acervo: clones da OSHB e do léxico de Strong em `tools/acervo/.cache/` (ver `README.md`).

## Primeira execução

```bash
npm ci
npm run dev
```

O app abre em http://localhost:8080. Sem `DATABASE_URL`, o servidor usa PGlite em memória: crie uma conta de teste em `/login`; ela some quando o servidor reinicia. A página `/diagnostico` mostra o que está configurado.

`npm run dev` e `npm run build` passam por `scripts/with-app-env.mjs`, que funciona no Windows e no Linux.

## Variáveis de ambiente

Em produção, ficam no painel da Cloudflare (Workers → `biblia-origens` → Settings → Variables and Secrets). Localmente, use variáveis de ambiente da sua sessão, nunca arquivos versionados.

| Nome | Para quê |
| --- | --- |
| `DATABASE_URL` | Postgres (ex.: Neon). As tabelas são criadas na primeira requisição. |
| `BETTER_AUTH_SECRET` | Chave fixa das sessões. Sem ela, cada reinício derruba quem entrou. |
| `BETTER_AUTH_URL` | Já vem do `wrangler.jsonc`: `https://bibliaorigens.app`. Nos previews dos PRs fica vazio. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Já vem do `wrangler.jsonc`: `www.bibliaorigens.app` e o endereço `*.workers.dev`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login com Google. No Google Cloud: origem `https://bibliaorigens.app` e retorno `https://bibliaorigens.app/api/auth/callback/google`. |

## Banco de dados

- Local: deixe `DATABASE_URL` vazio (PGlite) ou aponte para um Postgres de teste seu. Nunca use o banco de produção para testar.
- Migrações: arquivos em `migrations/`. `npm run db:migrate` aplica as pendentes no `DATABASE_URL` atual; em produção, o próprio servidor aplica na primeira consulta.

## Verificar

```bash
npm run verify
```

Roda lint com tipos, tipos, testes, o autoteste das regras de lint e um build de verificação (sem migrações). Detalhes e o que cada um prova: `docs/quality.md`.

## Deploy

A Cloudflare Workers Builds publica a `main` em produção e cria um preview para cada PR. No preview, o login não funciona (o endereço muda a cada branch); só as páginas públicas abrem.

## Agentes

Leia o `AGENTS.md`; o `CLAUDE.md` importa as mesmas instruções. Ferramentas, skills e integrações configuradas: `docs/setup.md`.

## Problemas conhecidos

| Sintoma | Causa | Solução |
| --- | --- | --- |
| No Windows, `npm test` rodava só 55 testes | Aspas simples no glob do script não funcionam no cmd | Corrigido: o script usa aspas duplas e roda os 161 |
| `vite` "não reconhecido" ao rodar `npm run dev/build` no Windows | O wrapper chamava `vite.cmd` sem shell | Corrigido em `scripts/with-app-env.mjs` |
| Build da Cloudflare falha no `npm ci` com `Missing: … from lock file` | O npm 11 local regrava o `package-lock.json` sem dependências opcionais que o npm 10 da Cloudflare exige | Não versione o lockfile regravado pelo `npm install` local; para mudar dependências, gere o lockfile com `npx npm@10 install --package-lock-only` (ou `update`) e confira `npx npm@10 ci` |
| Dois testes pulados no Windows | Criar link simbólico exige administrador | Esperado; rodam no Linux |
| No Windows, o servidor continua na porta 8080 depois de parar o `npm run dev` por um gerenciador de processos | O wrapper roda o `vite` via `cmd.exe`; um SIGTERM encerra só o `cmd` | Pare com Ctrl+C no terminal ou encerre o processo que usa a porta 8080 |
