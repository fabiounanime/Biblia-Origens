# Bíblia Origens

PWA de leitura e estudo da Bíblia em português direto, no hebraico/grego original e transliterado. Produção em https://bibliaorigens.app (Cloudflare Workers). Escreva código, commits e documentos em português do Brasil, como o resto do projeto.

## Mapa

- Produto, escopo e critérios: `PRODUCT.md`.
- Estrutura, dados e decisões: `docs/architecture.md`.
- Visual, acessibilidade e leitor: `docs/design.md`.
- Preparar a máquina e segredos: `docs/onboarding.md`.
- Verificações, testes e revisão: `docs/quality.md`.
- Ferramentas do agente, versões e evidências: `docs/setup.md`.
- Acervo bíblico (tradução, léxico, build dos JSON): `README.md` e `tools/acervo/`.

## Stack

TanStack Start (React 19, Vite 8, Nitro), TypeScript, Tailwind v4, Better Auth, Postgres (Neon) com PGlite como reserva local, Zod e zustand. Node 22+ (local: 24) e npm (`package-lock.json`). Deploy: Cloudflare Workers Builds a partir da `main`; cada PR ganha um preview.

## Comandos

- Instalar: `npm ci`
- Desenvolver: `npm run dev` (porta 8080)
- Lint: `npm run lint` (rápido); com tipos: `npm run lint:typed`
- Tipos: `npm run typecheck`
- Testes: `npm test` (`node --test`: scripts e libs do servidor); regras de lint: `npm run test:rules`
- Build de verificação: `npm run build:check` (não aplica migrações)
- Tudo junto: `npm run verify`
- Build de produção: `npm run build` (inclui `db:migrate`; só roda migrações com `DATABASE_URL`)
- Acervo: `node tools/acervo/build.mjs <livro>` (ver `README.md`)

## Regras do projeto

- O login é obrigatório para ler (condição da aprovação no Google); a apresentação `/`, `/login`, `/privacidade` e `/termos` são públicas.
- O celular (< 768 px) e o leitor web (≥ 768 px) são layouts diferentes do leitor: mudar um não pode quebrar o outro.
- Tradução e glosas vivem em `acervo/` (texto) e viram JSON em `public/content/bible/`. Não edite os JSON gerados à mão.
- Migrações SQL ficam em `migrations/`; gere e revise antes de aplicar, nunca em produção sem pedido.
- Segredos só no painel da Cloudflare (ou em variáveis de ambiente locais, fora do Git). Nunca em código, docs ou conversa.
- Paleta, temas e tipografia têm fonte única em `src/styles.css`; não espalhe cores soltas.

## Acordos de trabalho

- Leia as instruções e o código relevante antes de editar; separe observação, suposição e decisão.
- Faça a menor mudança completa; reaproveite componentes, padrões e dependências existentes.
- Defina o critério de aceite e a verificação antes de implementar. Correções de bug pedem reprodução e teste de regressão quando possível.
- Rode `npm run verify` (ou a parte relevante) antes de dar algo por pronto; diga o que não foi verificado.
- Atualize o documento responsável junto com a mudança de comportamento, comando, schema ou configuração.
- Preserve mudanças locais, validação, tratamento de erro, segurança e acessibilidade.
- Publicar, mandar mensagens, gerar custos e ações destrutivas pedem autorização específica.
- PRs: um commit por entrega, PR no GitHub e merge (squash) assim que o build da Cloudflare passar. Não inclua `package-lock.json`, `src/routeTree.gen.ts`, `APP Biblia Origens/` nem `.impeccable/` sem pedido.
- Trabalho que atravessa sessões: registre o estado no plano/PR em curso (modelo em `docs/setup.md`, seção Retomada).

## Ferramentas

- **Superpowers / Ponytail / Caveman:** processo proporcional ao tamanho do pedido; Ponytail no nível `full` (menor solução completa, sem abrir mão de requisitos, segurança e acessibilidade); Caveman ativo na conversa, sempre em português e com clareza. Código, docs, commits e PRs com redação normal; explicação completa quando pedida.
- **Context7:** documentação atual de bibliotecas (TanStack, Better Auth, Tailwind…), uma pergunta por vez, sem código privado nem segredos.
- **RTK:** com o hook ativo, use comandos normais; `rtk proxy <cmd>` quando precisar da saída inteira.
- **Graphify:** grafo do código em `graphify-out/` (fora do Git) para perguntas de estrutura (`graphify explain "parseRef"`, `graphify query "..."`). Pode estar desatualizado: refaça com `GRAPHIFY_NO_AUTO_REFRESH=1 graphify extract . --code-only --no-cluster`; o que fica de fora está em `.graphifyignore`.
- **Skills do projeto** (lista e estado em `docs/setup.md`): boas práticas de React e composição, revisão de interface e de texto, Postgres, revisão de segurança por diff e descoberta de skills. Use quando a tarefa pedir; instalar não autoriza agir.
- Verifique se a ferramenta está instalada e carregada antes de depender dela; o estado real fica em `docs/setup.md`.

## Delegação e revisão

- Delegue só quando isolar contexto, especializar ou paralelizar compensar; tarefas simples, faça direto.
- Use o modelo mais leve que cumpra o critério: buscas e mudanças mecânicas com pouca capacidade; segurança, login, dados e revisão crítica com mais.
- Cada tarefa delegada recebe objetivo, arquivos permitidos, critério de aceite e verificação. Um escritor por arquivo; revisores só leem. Confira o diff e rode as verificações antes de aceitar.
- Revisão por risco: mudanças não triviais têm revisão independente quando disponível; para segurança, use o prompt em `docs/quality.md`.
