# Código e arquitetura

## Stack real

| Camada | Escolha | Observação |
|---|---|---|
| Framework | TanStack Start 1.168 (Router + Start), React 19, Vite 8 | Rotas por arquivo em `src/routes/`; `src/routeTree.gen.ts` é gerado. |
| Servidor | Nitro 3 (beta) com preset `cloudflare-module` | Mesmo alvo local e na Cloudflare (`vite.config.ts`). |
| Estilo | Tailwind v4 + tokens em `src/styles.css` | Paleta, temas e fontes têm fonte única ali. |
| Login | Better Auth 1.6 (e-mail/senha e Google) | `src/lib/auth/`, rota `src/routes/api/auth/$.ts`. |
| Banco | Postgres (Neon) com `pg`; PGlite (WASM) quando não há `DATABASE_URL` | `src/lib/db.ts`, migrações em `migrations/`. |
| Estado no cliente | zustand (`src/lib/study/store.ts`, `src/lib/reader/layers.ts`) | Preferências do leitor ficam no aparelho; estudo sincroniza com a conta. |
| Validação | Zod 4 | Entradas dos server functions e do ambiente. |
| Deploy | Cloudflare Workers Builds (`wrangler.jsonc`) | `main` vai para produção; PRs ganham preview (bloco `previews`). |

## Mapa do código

```
src/
  routes/            páginas (apresentação, login, início, ler, estudos, mapas, conta, legais, diagnóstico) e APIs
    ler/$book.$chapter.tsx   rota do leitor: carga do capítulo, estado e escolha celular/web
  components/        shell (lateral + barra inferior), landing, reader-library, ui, reading-settings, toaster
    reader/          peças do leitor: versículo, balão e interlinear (gloss), texto e notas, cabeçalho e grade
                     (chapter-chrome), nota, leitor web (desktop-reader) e painel da palavra (word-panel)
    atlas/           mapa de satélite (atlas-map, MapLibre só no navegador), painéis e card do lugar
  lib/
    bible/           catálogo de livros, carga do acervo (corpus), guias, lugares (places: coordenadas,
                     certeza, distância), andamento (use-acervo); atlas/: eventos, caminhos e teste de integridade
    atlas/           visão do mapa (pinos, rota, trechos) e a chave da ArcGIS (server function)
    study/           marcas, notas, posição e preferências (store) + sincronização (sync-api, server function)
    reader/          camadas visíveis, pinça, gesto lateral, ponto de leitura e dica do leitor
    auth/            Better Auth, middleware, portões de login
    db.ts            conexão Neon/PGlite e migrações em tempo de execução
acervo/              tradução (txt), léxico e notas — fonte do texto
tools/acervo/        build dos JSON do acervo a partir da OSHB e do léxico de Strong
public/content/bible/  JSON gerados (não editar à mão) e indice.json
migrations/          SQL versionado (auth/ guarda a fonte do schema do Better Auth)
scripts/             wrapper de ambiente, migração, verificações de login, smoke de navegador
```

## Fronteiras e fluxo

- **Telas** chamam `useStudy`/`useLayers` e os módulos de `lib/bible`; não importam o banco.
- **Server functions** (`createServerFn`) com `authMiddleware` fazem a ponte para o banco: hoje só `src/lib/study/sync-api.ts`, que valida cada item com Zod/expressões e escreve por usuário.
- **Acervo** é estático: o cliente baixa `public/content/bible/{livro}.json` e `palavras/{livro}/{capítulo}.json` só ao abrir o capítulo.
- **Login obrigatório:** `src/components/shell.tsx` redireciona para `/login` quando não há usuário.

## Dados e migrações

- `migrations/0001_auth.sql` (cópia de `migrations/auth/`) e `0002_study.sql` (preferências, posição, marcas/notas, guias).
- Em produção, `src/lib/db.ts` aplica as migrações pendentes na primeira consulta (tabela `_migrations`); `npm run build` também roda `db:migrate` quando há `DATABASE_URL`.
- Sem `DATABASE_URL`, o servidor usa PGlite em memória: contas somem a cada reinício (uso local).
- Revise o SQL antes de aplicar; nunca aponte o desenvolvimento local para o banco de produção.

## Herança do Grok App Builder

O projeto começou no Grok App Builder. Em outubro de 2026 saíram o contrato do sandbox (`AGENTS.md` antigo, `AGENTS.project.md`, `startup.sh`), a camada PWA/selo do Grok (`server/`, `scripts/grok-pwa-*`, `public/__grok/`), a ponte de preview e o `vercel.json`. As tags de compartilhamento (OG) passaram para `src/routes/__root.tsx`.

Ainda ficam, por fazerem parte do login ou dos testes:

- `src/lib/auth/gate-*`, `preview.ts`, `popup.server.ts` e `isolation.server.ts`: portão de login do Grok e popup de autenticação, desligados fora do sandbox. Removê-los é uma mudança de login, a ser feita com revisão de segurança.
- `scripts/with-app-env.mjs` (lê `.grok/app-env.json` se existir; neste projeto não existe e o login fica ligado), `scripts/check-auth-invariant.mjs`, `scripts/browser-smoke.mjs` e `scripts/preview.mjs`.
- `src/lib/app-data/` e `src/lib/multiplayer/`: não usados pelo app.

## Decisões

| Decisão | Motivo | Rever quando |
|---|---|---|
| Manter TanStack Start e Postgres/`pg` (sem Drizzle) | Stack em produção e estável; migrar não traz ganho hoje | Houver mudança grande de dados ou de framework |
| Login obrigatório para ler | Condição da aprovação da marca no login com Google | A política do Google ou do produto mudar |
| Mapas: MapLibre + satélite Esri (World Imagery), reserva Sentinel-2 (EOX) | Imagem nítida com plano gratuito; a chave é lida no servidor em tempo de execução e só vai para quem entrou; o MapLibre fica fora do bundle do Worker | O uso passar do plano gratuito da ArcGIS ou a imagem precisar de outro provedor |
| Lugares da OpenBible.info (CC BY 4.0) | Base aberta com a identificação moderna e a confiança de cada lugar bíblico | Surgir base melhor ou um lugar precisar de correção (fixe em `places.ts`) |
| Preset Nitro `cloudflare-module` também local | Mesmo alvo da produção; o `vercel` do template não era usado | Mudar de provedor |
| Leitor web separado do celular a partir de 768 px | Telas largas pedem palavra por palavra com painel fixo; o celular já funcionava bem | Unificar os dois leitores |

## Manutenção

Atualize este mapa quando mudarem diretórios, dependências relevantes, contratos ou fronteiras. Registre só o comportamento verificado e retire decisões que não valem mais.
