# Bíblia Origens

## Problema e objetivo

Quem lê a Bíblia em português quase sempre lê uma versão, sem ver o texto de origem. O Bíblia Origens mostra cada versículo em três camadas — português em tradução direta e fiel, o original (hebraico com nikud; grego no Novo Testamento) e o transliterado — e deixa tocar em qualquer palavra do original para ver o significado e a gramática. O objetivo é ler e estudar o texto "como foi escrito", sem versões no meio.

## Público e acesso

- Leitores de língua portuguesa que estudam a Bíblia e querem contato com o hebraico/grego, sem precisar dominar o idioma.
- Uma conta por pessoa (e-mail e senha ou Google). A conta guarda marcas, notas e o ponto de leitura e sincroniza entre aparelhos.
- Não há papéis diferentes (administrador, editor) dentro do app.

## Fluxos principais

1. **Conhecer:** a apresentação `/` mostra Gênesis 1:1 com as palavras tocáveis e o andamento da tradução; leva a criar conta ou entrar.
2. **Entrar:** `/login` (e-mail/senha ou Google). Sem login, as telas do app redirecionam para cá.
3. **Retomar:** o Início mostra "Continuar leitura", o versículo do dia, as partes da Bíblia e os guias.
4. **Ler:** escolher livro e capítulo; ler as três camadas; tocar numa palavra para ver significado, gramática e forma de dicionário; guardar, anotar, copiar e compartilhar versículos.
5. **Estudar:** guias que ligam um capítulo âncora a um lugar no mapa; mapa do Crescente Fértil.
6. **Ajustar:** tema (Escuro, Claro, Pergaminho), tamanho da letra, camadas e nikud; guardados e notas na Conta.

## Escopo atual

- Acervo publicado livro a livro: a Torá completa, Josué, Juízes e 1 Samuel. Os demais aparecem como "Em tradução" e o leitor pula capítulos ainda não publicados. A fonte do andamento é `public/content/bible/indice.json`.
- Leitor em dois layouts: celular (< 768 px) e web (≥ 768 px, com biblioteca na lateral e painel da palavra).
- PWA instalável (manifesto e ícones próprios).

## Fora do escopo (hoje)

- Leitura sem conta (decisão de produto, ligada à aprovação do login com Google).
- Busca no texto bíblico, planos de leitura e áudio: não existem e não foram pedidos.
- Anúncios, rastreamento e venda de dados: proibidos pela política de privacidade.

## Requisitos

- Português do Brasil em toda a interface e documentação.
- Tradução direta do hebraico, com convenções no topo de cada `acervo/traducao/{livro}.txt` (YHWH, nomes tradicionais, palavras acrescentadas entre colchetes e mostradas em itálico claro).
- Hebraico em versificação hebraica (ex.: Gn 32:1 hebraico = 31:55 nas bíblias em português).
- Acessibilidade: alvos de toque de 44 px, contraste AA nos três temas, zoom liberado, foco visível e respeito a movimento reduzido.
- Privacidade: do Google só nome, e-mail e foto; dados guardados no Postgres da conta.

## Restrições e decisões técnicas

- Stack existente mantida: TanStack Start + React 19, Tailwind v4, Better Auth, Postgres (Neon) com PGlite como reserva local, Kysely/`pg`, Zod. Não migrar para Next.js nem Drizzle sem decisão própria (detalhes em `docs/architecture.md`).
- Deploy na Cloudflare Workers, domínio oficial https://bibliaorigens.app.
- O projeto nasceu no Grok App Builder; parte do código de login e de dados ainda traz essa herança (registrada em `docs/architecture.md`).

## Suposições e decisões pendentes

- A ordem dos próximos livros a traduzir é decisão do autor da tradução.
- Os módulos herdados do template (`src/lib/app-data/`, `src/lib/multiplayer/`) não são usados pelo app; removê-los é uma limpeza a decidir.

## Critérios de aceite

- Sem conta, qualquer tela do app leva ao login; com conta, abre o Início.
- Num capítulo publicado, as três camadas aparecem e tocar numa palavra do original mostra o significado do acervo.
- Num capítulo em tradução, a tela diz isso e oferece o próximo capítulo publicado.
- Guardar e anotar um versículo aparece nos Guardados e em outro aparelho depois de sincronizar.
- Celular e web passam em `npm run verify` e na conferência visual em 390, 1024 e 1440 px.

## Próxima entrega

Publicar o próximo livro do acervo (`node tools/acervo/build.mjs <livro>`), com a tradução conferida contra o hebraico.

## Manutenção

Atualize este documento quando mudarem o objetivo, o escopo, as restrições ou os critérios de aceite. Decisões técnicas detalhadas e evidências ficam em `docs/architecture.md` e `docs/setup.md`.
