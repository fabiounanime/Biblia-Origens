# Design e acessibilidade

## Direção

Leitura longa e estudo calmo, em português, no celular e no computador. O visual vem do Tabernáculo (Êx 26:1): fundo noturno, ouro para o hebraico e a Torá, azul para ação e transliterado. O texto bíblico manda; a interface recua.

## Sistema existente

- **Fonte única:** `src/styles.css` (tokens `--c-*`, temas, curvas de movimento e classes do leitor). Não repita cores aqui nem em componentes.
- **Paleta "cores do Tabernáculo":** *tekhelet* (azul, ação principal, Neviim, transliterado), *zahav* (ouro, Torá e hebraico), *argaman* (púrpura, Ketuvim), *shani* (escarlate, marcas, notas e Novo Testamento).
- **Temas:** Escuro (padrão, azul-noturno), Claro (linho frio) e Pergaminho (`html.light.theme-sepia`). Não use a classe `sepia`: é o utilitário `filter: sepia(100%)` do Tailwind e tinge a página inteira.
- **Superfícies:** cartões com borda de 1 px e a borda de luz `shadow-edge`, sem sombra pesada; campos de texto com `border-field` (contraste 3:1).
- **Marca:** "Bíblia Origens" sempre em Uncial Antiqua com tinta de pergaminho (componente `Wordmark` e classe `.wordmark` em `src/components/ui.tsx`). A abertura (`/abrir`) é sempre escura, com logo, nome e lema em IM Fell English itálico.
- **Tipografia:** Literata (português), Frank Ruhl Libre (hebraico com nikud), Gentium Book Plus (grego), Manrope (interface do app e da apresentação, `font-app`). Login e páginas legais ainda em Figtree. Referências como "Gn 1:1" vêm de `bookRef` (`src/lib/bible/catalog.ts`) com números tabulares. A escala de letra da Conta (`--read-size`) muda só o texto de leitura.
- **Componentes compartilhados:** `src/components/ui.tsx` (marca, gaveta `Sheet`, controle segmentado, chave), `src/components/reading-settings.tsx`, `src/components/shell.tsx` (lateral e barra inferior), `src/components/reader-library.tsx`.

## Leitor

**Celular (< 768 px)** — `ChapterPage` em `src/routes/ler/$book.$chapter.tsx`:
- Cabeçalho compacto, camadas PT/HE/TR e modo **Interlinear** (preferências do aparelho, `src/lib/reader/layers.ts`).
- Toque numa palavra do hebraico/transliterado abre o balão do significado; toque no número ou no texto do versículo abre a barra de ações (guardar, nota, copiar, enviar).
- Pinça muda o tamanho da letra (`src/lib/reader/use-pinch-font.ts`); gesto lateral troca de capítulo, acompanhando o dedo.
- Barra de progresso, dica de uma linha ("Entendi"; volta pelos ajustes) e retomada no versículo onde parou.

**Web (≥ 768 px)** — `DesktopReader` e `WordPanel` no mesmo arquivo:
- A lateral do app mostra o menu e, no leitor, a Biblioteca (`reader-library.tsx`): "Ir para…" (`parseRef`, atalho `/`), livro aberto, grade de capítulos e guardados do capítulo.
- Versículos em cartões, palavra por palavra (original + transliterado; "Significado" liga o sentido embaixo de cada palavra) e o português depois.
- Painel da palavra fixo à direita a partir de 1280 px; entre 768 e 1279 px, faixa compacta presa na base (fecha com × ou Esc).
- Atalhos: ← → capítulo, J/K palavra, `/` busca.

Anterior/próximo e o gesto lateral pulam capítulos ainda em tradução (`src/lib/bible/use-acervo.ts`).

## Outras telas

- **Início** (`src/routes/inicio.tsx`): "Continuar leitura" com anel de progresso, versículo do dia (só referências no código; o texto vem do acervo), as quatro partes com o andamento e os guias.
- **Andamento do acervo:** `/ler`, as grades de capítulos e os guias marcam "Em tradução" a partir de `public/content/bible/indice.json`; a apresentação mostra a contagem por parte.
- **Apresentação** (`src/components/landing.tsx`): Gênesis 1:1 tocável como capa, trechos do leitor, andamento da tradução e a seção sobre a conta (exigida pelo Google).

## Interação

- HTML semântico, navegação por teclado e foco visível (`:focus-visible` em tekhelet).
- Alvos de toque de 44 px; o desenho pode ser menor com área invisível maior (ex.: chave, número do versículo).
- Zoom da página liberado; a pinça só altera a letra dentro do texto bíblico.
- Link "Pular para o conteúdo" no shell; palavras do original anunciadas pelo transliterado para leitores de tela.
- **Movimento:** curvas `--ease-out` e `--ease-drawer`; botões afundam ao toque (`:active`, `pressable`, `pressable-card`); só `transform` e `opacity`; com `prefers-reduced-motion`, sem deslocamento.
- Avisos curtos com Sonner (`src/components/toaster.tsx`), ex.: "Nota apagada · Desfazer".

## Layout e revisão

- Pontos de quebra: 768 px (lateral e leitor web) e 1280 px (painel fixo da palavra).
- Confira mudanças visuais em 390, 1024 e 1440 px, nos três temas quando mexer em cor.
- Estados a cobrir: carregando (esqueletos), capítulo em tradução, erro ao abrir o significado, sem guardados.
- Revisões feitas: auditoria de layout de outubro de 2026 (impeccable, taste e princípios de Emil Kowalski), aplicada no PR #41; leitor web no PR #42.

## Manutenção

Mudanças visuais e de interação atualizam o token/componente de origem e esta página quando uma regra muda. Em revisões de interface, use a skill de diretrizes de interface instalada (ver `docs/setup.md`).
