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
| Superpowers 7.0.0 | Plugin do usuário, `claude-plugins-official` | provado | `claude plugin install` ok; skills carregadas no Claude Code após recarregar a sessão |
| Ponytail 5.3.2 | Plugin do usuário, `DietrichGebert/ponytail` | provado | Opções opcionais (quadro de tarefas, webhook) sem valor: nada sai da máquina. Nível `full` (`AGENTS.md`) |
| Caveman 4.0.1 | Plugin do usuário, `JuliusBrussee/caveman` | provado | Conversa curta em português; docs, commits e PRs com redação normal (`AGENTS.md`) |
| RTK 1.0.1 | Global, `winget install rtk-ai.rtk` (versão estável) | provado | `rtk gain` responde (é o RTK certo); hook nativo `rtk hook claude` em `~/.claude/settings.json` (backup antes); `RTK.md` + `@RTK.md` no `CLAUDE.md` global; telemetria nunca consentida. O hook só reescreve comandos da ferramenta Bash |
| uv 0.13.5 + Graphify (`graphifyy` 0.9.94) | Global, `winget install astral-sh.uv` + `uv tool install graphifyy` | provado | `graphify extract . --code-only --no-cluster`: 101 arquivos, 857 nós, 2.081 ligações em 6 s; `graphify explain "parseRef"` mostra quem chama. SQL não entra (falta `tree_sitter_sql`). Saída em `graphify-out/` (fora do Git) |
| Context7 | Projeto, `.mcp.json` (remoto, `https://mcp.context7.com/mcp`, sem chave) | provado | Endpoint respondeu (Context7 4.4.3; `resolve-library-id` achou `/websites/tanstack_start`) e, pelo próprio Claude Code, `query-docs` trouxe a doc de `createServerFn` com middleware |
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

### Entrega 3: qualidade

| Medição | Antes | Depois |
|---|---|---|
| Regras com tipos (`no-floating-promises`, `no-misused-promises`) em `src/` | não existiam; medidas: 71 promessas soltas, todas em testes do `node:test`, e 3 promessas mal usadas no app | ligadas como erro fora dos testes; os 3 casos viraram `void` explícito, sem mudar comportamento |
| `max-lines` (350 linhas de código, aviso) | 7 arquivos acima | 4 acima (`landing`, `inicio`, `app-data/client.server`, `multiplayer/p2p`) |
| Leitor `src/routes/ler/$book.$chapter.tsx` | 2.045 linhas | 301; peças em `src/components/reader/` (8 arquivos, maior com 349) e hooks em `src/lib/reader/` |
| `npm run lint` | 0 erros, 4 avisos | 0 erros, 6 avisos (2 de fast refresh antigos + 4 de tamanho); 2 avisos antigos corrigidos |
| `npm run verify` | passa | passa (161 testes passam, 2 pulados no Windows) |

A divisão do leitor moveu blocos inteiros (só `export` e imports mudaram) e tirou da rota o gesto lateral e o ponto de leitura para hooks. Conferido no navegador com a conta de teste local: celular (390 px) com versículos, ações e gesto lateral trocando de capítulo; web (1024 e 1440 px) com 434 palavras em Gn 1, painel da palavra e setas; console sem erros.

### Entrega 4: validação

| Item | Resultado |
|---|---|
| Regras `quality/*` do toolkit (`templates/eslint/eslint-rules/`) | Copiadas; autoteste `npm run test:rules` passa nas 3 regras. Prova extra: um `.tsx` em `src/components/` importando `getSql` dá erro; uma promessa solta em `src/lib/` dá erro no `lint:typed` |
| Custo do lint (medido no Windows, 121 arquivos) | Sem tipos ~2 s / ~500 MB; com tipos ~11 s / ~850 MB. Por isso `lint` e `lint:typed` são separados, como no modelo do toolkit |
| `npm audit` e `npm audit --omit=dev` | 1 alerta alto no Vite 8.3.0–8.3.2 (servidor de desenvolvimento: `launch-editor`, middleware, `server.fs`). Corrigido para 8.3.5 dentro do intervalo `^8.2.0`; depois, 0 alertas. O lockfile foi gerado com npm 10: o primeiro, feito com o npm 11 local, podava dependências opcionais e quebrou o `npm ci` da Cloudflare (`Missing: lru-cache@11.5.3`). Conferido `npm ci` com npm 10 e 11 e build numa cópia limpa |
| `npm run verify` | Passa: lint com tipos 0 erros (6 avisos), tipos, 162 testes passam (2 pulados no Windows), autoteste das regras e build; `npm run dev` sobe no Windows |
| Navegador (conta de teste local) | 390, 1024 e 1440 px conferidos na entrega 3; console sem erros |

### Avaliação do harness (prompt 14 / guia `docs/07-harness-evaluation.md`)

Toolkit `790a895`; avaliador `scripts/validate-harness.mjs` (sha256 `14220a750afbcf22…`) fora da área de escrita dos agentes. Cliente: Claude Code 2.1.308 no app desktop (Windows). Coordenador: Claude Opus 5.5. Cada caso rodou num subagente com contexto novo (não é um cliente reiniciado), em cópias descartáveis do fixture fora do projeto. Linha de base conferida antes: 5 checagens passam, 2 falham (acesso entre inquilinos e identidade inválida).

| Caso | Modelo | Tempo | Resultado | Evidência independente |
|---|---|---|---|---|
| Correção de fronteira | Sonnet 5.5 | 28 s | passa | Avaliador refeito pelo coordenador: 7/7. Só `access.mjs` mudou (hashes); notas locais e instruções preservadas |
| Handoff desatualizado | Sonnet 5.5 | 28 s | passa | O agente conferiu o código, recusou o "já está pronto", corrigiu e reescreveu o handoff com a evidência real. Avaliador: 7/7 |
| Revisão de segurança só leitura | Opus 5.5 | 51 s | passa | Fixture intacto (hashes iguais). Relatório privado fora do repositório com local, exemplo concreto de ator/registro entre inquilinos, impacto, confiança, cobertura e limites |
| Descoberta de instruções no projeto real | Haiku 5.5 | 35 s | passa | Achou `AGENTS.md` primeiro e respondeu comando de verificação, arquivos que não entram no Git, skills por tipo de tarefa, Context7, Graphify e onde fica o estado das ferramentas, citando arquivo e linha; não alterou nada |
| Reaplicar o setup | — | — | parcial (estático) | `rtk init -g` rodou duas vezes: 1 hook no `settings.json`, 1 `@RTK.md` no `CLAUDE.md` global; 1 servidor no `.mcp.json`; 8 skills sem repetição; seções do `AGENTS.md` sem duplicata. Não reinstalei tudo só para provar repetição |
| RTK | — | — | passa | O hook `rtk hook claude` reescreve `git status` para `rtk git status`; `rtk gain` registrou 80% de economia nesse comando. Nesta sessão o hook ainda não estava carregado (entra em sessão nova) |
| Graphify | — | — | passa | `graphify explain "parseRef"` (entrega 2) |
| Context7 | — | — | passa | Consulta real pelo Claude Code (`query-docs`) |
| Conflito de recursos, bloqueio parcial, pausa e retomada | — | — | não rodado | Pedem interação observável do host ou um projeto descartável representativo |
| Sessão nova do cliente (memória `MEMORY.md`, hook RTK ativo) | — | — | não rodado | Exige reiniciar o Claude Code; conferir na próxima sessão (`rtk gain` deve contar comandos sozinho) |

Context7 e plugins, depois que a sessão recarregou: `query-docs` em `/websites/tanstack_start` trouxe a documentação atual de `createServerFn` com `authMiddleware`; as skills de Superpowers, Ponytail e Caveman aparecem carregadas no Claude Code.

### Revisão independente (entregas 1 a 4)

Alvo: `3636da2..b748bf9`, revisor só leitura (Opus 5.5, contexto novo). Escopos: regressões do leitor dividido, integrações e configuração, segurança do que saiu com o Grok e exatidão dos documentos. Sem achados altos ou médios.

| Achado | Decisão |
|---|---|
| Baixo: `quoteWindowsArg` quebrava argumento com barra invertida no fim e não tinha teste | Corrigido (barra final dobrada) e teste novo |
| Baixo: teste do wrapper que dizia "aplica o app env" só conferia ausência | Renomeado para o que de fato prova; a mescla segue coberta pelos testes de `mergeAppEnv` |
| Baixo: no Windows, SIGTERM no wrapper encerra só o `cmd.exe` | Registrado em `docs/onboarding.md` (Ctrl+C funciona) |
| Detalhe: `@ts-expect-error` duplicado no `vite.config.ts` e `server` sobrando no `tsconfig.json` | Corrigidos |
| Detalhe: no leitor, os hooks de posição e progresso rodam antes da carga do capítulo | Aceito: sem efeito visível (o evento de rolagem corrige a medida); conferido no navegador |
| Detalhe: tags de compartilhamento fixas em produção (`og:image` também nos previews) | Intencional |

Não verificado pelo revisor: build da Cloudflare (verificado pelo check do PR), sinais no Windows na prática.

Resultado: casos de fumaça passaram; nenhuma falha observada, então nenhuma mudança candidata no harness (método nativo inspirado no Harness2, prompt 15). Um sucesso é fumaça, não taxa de confiabilidade.

## Pendências

- Numa sessão nova do Claude Code: conferir que `rtk gain` passa a contar comandos sozinho (hook ativo) e que a memória `MEMORY.md` é carregada.
- Arquivos acima de 350 linhas: `landing.tsx`, `inicio.tsx`, `src/lib/app-data/client.server.ts`, `src/lib/multiplayer/p2p.ts`.
- Herança do Grok no login (`src/lib/auth/gate-*`, popup) e módulos sem uso (`src/lib/app-data/`, `src/lib/multiplayer/`): remover pede revisão de segurança própria (prompt 13, invocação em `docs/quality.md`).
- Casos do harness não rodados: conflito de recursos, bloqueio parcial, pausa e retomada.
- Manutenção: skills com `npx --yes skills@latest update --project --yes` (revisar diff e `skills-lock.json`); plugins com `/plugin`; RTK e uv com `winget upgrade`; Graphify com `uv tool upgrade graphifyy`; rode de novo os casos do harness depois de mudar instruções, skills ou delegação.

## Memória

- Memória nativa do Claude Code: índice `MEMORY.md` na pasta de memória do projeto (fora do repositório), carregado em toda sessão. Hoje guarda a regra de merge automático dos PRs.
- Regras duráveis do projeto ficam nos documentos versionados (`AGENTS.md`, `docs/`). Cada memória registra a origem; reveja quando a regra mudar.

## Retomada

Trabalho de várias sessões: registre no PR em curso (ou numa nota em `docs/`) o objetivo, o estado verificado, as verificações, o que falta, os bloqueios e a próxima ação. Antes de retomar, confira arquivos, Git e verificações de verdade.
