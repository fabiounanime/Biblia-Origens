# Bíblia Origens

PWA de leitura do Tanakh para estudo: português em tradução direta, hebraico e transliterado, nesta ordem. Modo escuro por padrão, com modo claro. A leitura é aberta. A conta sincroniza marcas, notas e o ponto de leitura.

## Acervo: hebraico, tradução e transliterado

- **Hebraico**: Códice de Leningrado (domínio público), lido da [Open Scriptures Hebrew Bible](https://github.com/openscriptures/morphhb) (CC BY 4.0), com nikud e sem os acentos de cantilação. Onde há ketiv/qere, o leitor mostra a leitura (qere), inclusive quando ela tem mais de uma palavra (Gn 30:11). Versificação hebraica.
- **Português**: tradução direta e fiel do hebraico, sem seguir versões, em `acervo/traducao/{livro}.txt` (uma linha por versículo, `1:1 texto`). Convenções no topo de cada arquivo: יהוה = YHWH, nomes tradicionais, vav mantido como "E", infinitivo absoluto ao pé da letra, e [colchetes] para palavras que não estão no hebraico (o leitor as mostra em itálico claro). Cada lote é conferido por um revisor independente contra o hebraico e a análise gramatical.
- **Transliterado**: gerado do hebraico por `tools/acervo/translit.mjs`, no estilo simples (*Bereshit bara Elohim*).
- **Palavra por palavra**: no leitor, um toque numa palavra do hebraico ou do transliterado abre um balão com o significado (prefixos e sufixos separados: "e + dizer", "servo + dele"), a análise gramatical em português e a forma de dicionário. Os significados estão em `acervo/lexico/glosas.txt` (por lema de Strong da OSHB, com o sentido de cada grau do verbo) e `acervo/lexico/nomes.txt` (nomes próprios, na forma da tradução); a forma de dicionário vem do léxico de Strong da [Open Scriptures](https://github.com/openscriptures/HebrewLexicon). Sai em `public/content/bible/palavras/{livro}/{capítulo}.json`, baixado só ao abrir o capítulo.
- **Notas do tradutor**: `acervo/notas/{livro}.txt`, uma por linha (`37:3 | trecho | nota`). A chamada (a, b, c…) aparece logo depois do trecho, e as notas ficam no fim do capítulo, como numa Bíblia impressa.

Para montar um livro:

```sh
git clone --depth 1 https://github.com/openscriptures/morphhb tools/acervo/.cache/morphhb
git clone --depth 1 https://github.com/openscriptures/HebrewLexicon tools/acervo/.cache/HebrewLexicon
node tools/acervo/build.mjs gn              # gera public/content/bible/gn.json (OSHB_DIR aponta outra pasta wlc/)
node tools/acervo/build.mjs gn --estudo 12  # hebraico com a análise de cada palavra, para traduzir
```

Só entram no JSON os capítulos com todos os versículos traduzidos; os outros mostram "ainda não chegou ao acervo". Publicado: Gênesis completo (50 capítulos, 1.533 versículos), em versificação hebraica (ex.: Gn 32:1 hebraico = 31:55 nas bíblias em português).

Formato de `public/content/bible/{bookId}.json`:

```json
{
  "bookId": "gn",
  "chapters": [
    {
      "n": 1,
      "verses": [
        { "v": 1, "pt": "…", "he": "…", "tr": "…" }
      ]
    }
  ]
}
```

Os identificadores dos livros estão em `src/lib/bible/catalog.ts`.

## Layout e design

- **Paleta "cores do Tabernáculo"** (Êx 26:1), em `src/styles.css`: *tekhelet* (azul, ação principal e Neviim), *zahav* (ouro, Torá e hebraico), *argaman* (púrpura, Ketuvim), *shani* (escarlate, marcas e notas). Três temas: Escuro (azul-noturno, padrão), Claro (linho frio) e Pergaminho (`html.light.sepia`, claro e quente para leitura longa). Cartões ganham a borda de luz `shadow-edge` em vez de sombra pesada.
- **Marca**: o nome "Bíblia Origens" aparece sempre na grafia uncial (Uncial Antiqua) em tinta de pergaminho, pelo componente `Wordmark` (`src/components/ui.tsx`) e a classe `.wordmark`. A abertura é sempre escura, com a logo, o nome e o lema em IM Fell English itálico.
- **Tipografia**: Literata (português), Frank Ruhl Libre (hebraico com nikud), Manrope (interface das telas internas, classe `font-app`), JetBrains Mono (referências como GN 1:1, classe `font-mono`). A landing, o login e as páginas legais continuam em Figtree. A escala de fonte da Conta muda só o texto de leitura.
- **Leitor** (`src/routes/ler/$book.$chapter.tsx`): pinça com dois dedos para o tamanho da letra no celular (`src/lib/reader/use-pinch-font.ts`), camadas PT/HE/TR ligáveis e modo **Interlinear** (cada palavra do original com transliterado e significado; preferências do aparelho, `src/lib/reader/layers.ts`), ajustes em painel deslizante, troca de capítulo por gesto lateral, setas do teclado ou botões (atravessando livros), barra de progresso, barra flutuante de ações por versículo (guardar, nota, copiar, enviar), dica de uso mostrada até tocar em "Entendi" e retomada no versículo onde parou.
- **Início** (`src/routes/inicio.tsx`): grade com "Continuar leitura" (anel de progresso do livro), versículo do dia (só referências no código; o texto vem do acervo) e as quatro partes com quantos livros já estão no acervo, lido de `public/content/bible/indice.json`. O índice é refeito pelo `build.mjs` a cada livro (ou à mão: `node tools/acervo/indice.mjs`).
- **Componentes compartilhados**: `src/components/ui.tsx` (marca, painel, controle segmentado, chave) e `src/components/reading-settings.tsx`.

## Login no Cloudflare Workers

Domínio oficial: **https://bibliaorigens.app** (Custom Domain do Worker `biblia-origens`).


Segredos/variáveis do Worker (painel da Cloudflare → Workers → biblia-origens → Settings → Variables and Secrets):

| Nome | Para quê |
| --- | --- |
| `DATABASE_URL` | Postgres (ex.: Neon). As tabelas são criadas sozinhas na primeira requisição. |
| `BETTER_AUTH_SECRET` | Chave fixa das sessões. |
| `BETTER_AUTH_URL` | Já vem do `wrangler.jsonc`: `https://bibliaorigens.app`, o endereço oficial. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Já vem do `wrangler.jsonc`: `www.bibliaorigens.app` e o endereço `*.workers.dev`, que também podem abrir o app. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login direto com Google. No Google Cloud, origem `https://bibliaorigens.app` e retorno `https://bibliaorigens.app/api/auth/callback/google`. |

A página `/diagnostico` mostra o que está configurado e o que falta, sem expor segredos.

## Ícone e nome na Tela de Início

`public/manifest.webmanifest` e `public/icons/` definem o nome "Bíblia Origens" e o ícone (árvore sobre o livro aberto). `apple-touch-icon.png` é de tela cheia (o iPhone arredonda), `icon-maskable-512.png` deixa a arte na zona segura do Android, e `logo-144.png` é o logo usado dentro do app. Favicon: `public/favicon.ico` e `public/icons/favicon-32.png`. Os links ficam em `src/routes/__root.tsx` (o iPhone escolhe o ícone com `sizes="180x180"`), junto com o cartão de compartilhamento (`og:*`), que usa `public/og.jpg` (1200×630).

## Endereços públicos

- `/`: apresentação do app (sem login). É a página inicial informada ao Google.
- `/abrir`: abertura com a logo, por 6 s, que leva ao login ou ao Início. É o `start_url` do app instalado; quem abre o app instalado em `/` (ícones antigos) é levado para cá antes da página aparecer.
- `/privacidade`, `/termos`: textos legais. `/sobre` redireciona para `/`.
