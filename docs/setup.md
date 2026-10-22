# Setup e evidências

## Fonte e contexto

- Data: 22/10/2026. Toolkit: [Vibe Coding Toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), revisão `790a895304e0c08b70a5b215c9d334f1c86b816c` (18/10/2026), prompt 12 (setup de projeto existente).
- Cliente: Claude Code (app desktop, Windows 11), Bash = Git Bash. Modelo principal: Claude Opus 5.5, autenticação da assinatura do dono (sem chave de API).
- Runtime: Node 24.19, npm 11.17, Python 3.14 (sem uv/pipx antes do setup).
- Política de subagentes: delegar só quando compensa; modelo mais leve que cumpra o critério, mais capacidade para login, dados, segurança e revisão crítica (ver `AGENTS.md`).

## Decisões

| Decisão | Motivo |
|---|---|
| Sair do Grok App Builder | O dono trabalha só aqui (Claude Code + Cloudflare); o contrato do sandbox não valia mais |
| Remover selo, camada PWA e ponte do Grok, `startup.sh`, `vercel.json` | Autorizado pelo dono; as tags OG foram trazidas para `__root.tsx` |
| Manter TanStack Start, Postgres/`pg`, Better Auth | Stack em produção; Next.js e Drizzle do toolkit são referência, não migração obrigatória |
| Documentação em português do Brasil | Idioma do produto, do dono e do resto do repositório |
| Um PR por entrega, merge automático com o build verde | Combinado com o dono (memória "merge-prs-automatically") |

## Componentes

Estados: **instalado** (está na máquina ou no repositório), **configurado** (ligado a este projeto), **provado** (respondeu a um uso real nesta data), **pendente** (falta uma sessão nova ou acesso).

| Componente | Escopo e origem | Estado | Evidência |
|---|---|---|---|
| Superpowers 7.0.0 | Plugin do usuário, `claude-plugins-official` | instalado | `claude plugin install` ok; carrega na próxima sessão (pendente) |
| Ponytail 5.3.2 | Plugin do usuário, `DietrichGebert/ponytail` | instalado | Opções opcionais (quadro de tarefas, webhook) sem valor: nada sai da máquina. Nível `full` (`AGENTS.md`) |
| Caveman 4.0.1 | Plugin do usuário, `JuliusBrussee/caveman` | instalado | Conversa curta em português; docs, commits e PRs com redação normal (`AGENTS.md`) |
| RTK 1.0.1 | Global, `winget install rtk-ai.rtk` (versão estável) | provado | `rtk gain` responde (é o RTK certo); hook nativo `rtk hook claude` em `~/.claude/settings.json` (backup antes); `RTK.md` + `@RTK.md` no `CLAUDE.md` global; telemetria nunca consentida. O hook só reescreve comandos da ferramenta Bash |
| uv 0.13.5 + Graphify (`graphifyy` 0.9.94) | Global, `winget install astral-sh.uv` + `uv tool install graphifyy` | provado | `graphify extract . --code-only --no-cluster`: 101 arquivos, 857 nós, 2.081 ligações em 6 s; `graphify explain "parseRef"` mostra quem chama. SQL não entra (falta `tree_sitter_sql`). Saída em `graphify-out/` (fora do Git) |
| Context7 | Projeto, `.mcp.json` (remoto, `https://mcp.context7.com/mcp`, sem chave) | configurado | Endpoint respondeu (Context7 4.4.3; `resolve-library-id` achou `/websites/tanstack_start`). Carregar no Claude Code pede aprovação numa sessão nova (pendente) |
| Skills do projeto (8) | `.claude/skills/`, `npx skills@1.7.4 add ... --agent claude-code --copy`, travadas em `skills-lock.json` | instalado | Revisadas: sem scripts nem comandos de rede; `web-design-guidelines` busca as diretrizes num endereço da Vercel ao rodar |
| Playwright + painel de navegador | Já no projeto / no app | provado | Usados nas conferências de tela das entregas 1 e 4 |

Skills do projeto e origem (revisão do repositório em 22/10/2026):

| Skill | Origem | Licença | Para quê aqui |
|---|---|---|---|
| `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-view-transitions` | `vercel-labs/agent-skills` `063bee9` | MIT | React 19: dados, renderização, composição; transições só quando pedidas |
| `web-design-guidelines`, `writing-guidelines` | `vercel-labs/agent-skills` `063bee9` | MIT (coleção) | Revisão de interface e dos textos/documentos |
| `find-skills` | `vercel-labs/skills` `a80e4c9` | MIT | Achar uma skill quando faltar capacidade (não autoriza instalar sem motivo) |
| `supabase-postgres-best-practices` | `supabase/agent-skills` `c9be0e9` | MIT | Consultas, índices e migrações do Postgres/Neon |
| `differential-review` | `trailofbits/skills` `1e0cb77` | CC-BY-SA-4.0 | Revisão de segurança de diffs sensíveis (login, sessão, sincronização, migrações) |

Atualizar: `npx --yes skills@latest update --project --yes`, revisar o diff e o `skills-lock.json`. Plugins: `/plugin` no Claude Code.

Fora do escopo, com motivo:

| Componente | Motivo |
|---|---|
| `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens` | O deploy é na Cloudflare, não na Vercel |
| `vercel-react-native-skills` | Não há app nativo |
| Skills de runtime/bundle do Next.js, shadcn | O app não usa Next.js nem shadcn |
| Sentry MCP | Não há Sentry |
| Reparo de CI do GitHub | A CI é o build da Cloudflare; falhas são lidas no painel |
| Codex, Obsidian | O dono usa só o Claude Code; memória nativa basta |
| agent-browser, Chrome DevTools MCP | Não autorizados; Playwright e o painel de navegador cobrem a conferência de telas |

## Documentação criada

| Documento | Origem |
|---|---|
| `AGENTS.md` | Reescrito: o contrato do Grok saiu; ficam comandos, regras e mapa |
| `CLAUDE.md` | Novo: importa `AGENTS.md` + detalhes do Claude Code |
| `PRODUCT.md` | Novo, a partir do README e do app |
| `README.md` | Mantido (acervo, ícones, endereços); layout e login migraram para `docs/` |
| `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md`, `docs/quality.md` | Novos; o design veio da seção "Layout e design" do README |
| `docs/setup.md` | Este arquivo |

## Verificações antes e depois

| Verificação | Antes do setup | Depois da entrega 1 |
|---|---|---|
| `npm run typecheck` | passa | passa |
| `npm run lint` | 1 erro (bloco vazio em `client.server.ts`) e 4 avisos | 0 erros, 4 avisos |
| `npm test` | 55 testes (os de `scripts/` não rodavam no Windows) | 161 testes: 159 passam, 2 pulados no Windows (links simbólicos) |
| `npm run dev` / `npm run build` | quebravam no Windows (`vite` não encontrado) | funcionam |
| `npm run build:check` | não existia | passa |

Testes que conferiam o estado do template do Grok (login desligado, `.grok/`, skill `og`) foram ajustados ao estado real do projeto ou removidos com o código do Grok.

## Memória

- Memória nativa do Claude Code: índice `MEMORY.md` na pasta de memória do projeto (fora do repositório), carregado em toda sessão. Hoje guarda a regra de merge automático dos PRs.
- Regras duráveis do projeto ficam nos documentos versionados (`AGENTS.md`, `docs/`). Cada memória registra a origem; reveja quando a regra mudar.

## Retomada

Trabalho de várias sessões: registre no PR em curso (ou numa nota em `docs/`) o objetivo, o estado verificado, as verificações, o que falta, os bloqueios e a próxima ação. Antes de retomar, confira arquivos, Git e verificações de verdade.
