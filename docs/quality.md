# Qualidade

## Comandos

| Comando | O que prova |
|---|---|
| `npm run lint` | ESLint rápido (`eslint.config.mjs`, ~2 s): TypeScript, hooks do React e as regras `quality/*` do toolkit |
| `npm run lint:typed` | O de cima mais as regras com tipos (`eslint.typed.config.mjs`, ~11 s e ~850 MB) |
| `npm run typecheck` | `tsc --noEmit` sem erros |
| `npm test` | `node --test`: scripts (`scripts/**/*.test.mjs`) e libs do servidor (login, dados de app) |
| `npm run test:rules` | Autoteste das regras `quality/*` (`scripts/verify-quality-rules.mjs`, RuleTester do ESLint) |
| `npm run build:check` | Build de produção (preset Cloudflare) sem aplicar migrações |
| `npm run verify` | `lint:typed`, `typecheck`, `test`, `test:rules` e `build:check`, em sequência |

Rode `npm run verify` antes de abrir um PR. Para uma mudança pequena, rode a verificação afetada e diga o que ficou de fora.

## Regras de base

- TypeScript estrito; presets oficiais de ESLint, hooks do React e `react-refresh`.
- Promessas (`lint:typed`): `no-floating-promises` e `no-misused-promises` são erro em `src/` (fora os testes do `node:test`, que devolvem promessas de propósito). Para descartar uma promessa de propósito, use `void`. Ficam fora do `lint` comum por custo, como recomenda o toolkit.
- Arquivos proporcionais à responsabilidade: `quality/max-lines` avisa acima de 350 linhas (testes e módulos só de tipos/reexportação ficam de fora). Acima disso hoje (22/10/2026): `landing.tsx` (443), `inicio.tsx` (397), `app-data/client.server.ts` (430) e `multiplayer/p2p.ts` (571), os dois últimos herdados do Grok e sem uso. Divida quando mexer neles, sem mudar comportamento.
- Telas não importam o banco: `quality/no-direct-data-access` barra `getSql`, `getPglite`, `ensureDbReady` e `ensureSchema` de `@/lib/db` em arquivos `.tsx` e em `src/components/`. O acesso a dados passa por server functions com `authMiddleware`.
- Regras `quality/*`: cópia de `templates/eslint/eslint-rules/` do Vibe Coding Toolkit (revisão em `docs/setup.md`), em `eslint-rules/`. `quality/no-direct-console` não está ligada: o projeto não tem um logger próprio.
- Entradas e ambiente validados (Zod); erros sem segredos.
- SQL com parâmetros; migrações revisadas antes de aplicar.

## Estratégia de testes

- Testes de comportamento e regressão com `node --test` (sem Vitest). Cubra regras e falhas, não espelhe o código.
- Interface: conferência no navegador (painel do app ou Playwright) em 390, 1024 e 1440 px, sem erros no console, com a conta de teste local.
- Banco: o PGlite local é evidência de compatibilidade, não prova do Neon em produção.
- Não há suíte E2E nem cobertura medida; não afirme o contrário.

## Revisão depois de implementar ou corrigir

Escolha o escopo pela mudança real e pelo risco: requisitos e comportamento; regressões e testes; segurança e dados; integrações e configuração; acessibilidade e interface. Mudanças não triviais têm revisão independente quando disponível (subagente só leitura). Registre alvo exato, chamadores afetados, achados confirmados e cobertura.

Termine quando os achados relevantes estiverem resolvidos ou com decisão explícita, as verificações afetadas passarem e os riscos que sobram estiverem registrados. Rodadas extras pedem evidência nova ou risco em aberto; um número de rodadas pedido pelo dono é respeitado sem recomeçar a contagem.

## Revisão de segurança

- **Prompt:** bloco "Prompt" de `docs/prompts/13-security-review.md` do Vibe Coding Toolkit, revisão registrada em `docs/setup.md`. Invocação: "Leia https://raw.githubusercontent.com/soumatheusgomes/vibe-coding-toolkit/main/docs/prompts/13-security-review.md e execute o bloco Prompt neste projeto, no modo [repositório | diff de X a Y]".
- **Skill:** `differential-review` (quando instalada) para diffs sensíveis: login, sessão, sincronização, migrações.
- Somente leitura por padrão; relatório redigido e privado, fora do repositório. Correções são uma tarefa separada.
- Rotas sensíveis hoje: `src/routes/api/auth/$.ts`, `src/lib/auth/*`, `src/lib/study/sync-api.ts`, `src/lib/db.ts`, `src/routes/api/diagnostico.ts`.

## Avaliação e melhoria do harness

- Método: adaptação nativa inspirada no Harness2 (não executa o framework do Google). Invocação: "Leia https://raw.githubusercontent.com/soumatheusgomes/vibe-coding-toolkit/main/docs/prompts/15-harness-improvement.md e execute o bloco Prompt neste projeto".
- Casos de fumaça: guia `docs/07-harness-evaluation.md` e prompt 14 do toolkit (não deste repositório), em cópias descartáveis. Resultados e data em `docs/setup.md`.
- Rode de novo depois de mudar instruções, memória, skills ou a política de delegação.

## Dependências e entrega

- `npm audit` (completo) e `npm audit --omit=dev` (produção) antes de atualizar dependências; registre riscos conhecidos.
- Verificações são comandos explícitos; não há hooks de Git, bloqueio de push nem exigência de branch.
- O build da Cloudflare (Workers Builds) é a verificação de CI de cada PR.
