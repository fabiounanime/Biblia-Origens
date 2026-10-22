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
