# Bíblia Origens

PWA de leitura do Tanakh para estudo: português em tradução direta, hebraico e transliterado, nesta ordem. Modo escuro por padrão, com modo claro. A leitura exige conta (condição da aprovação da marca no login com Google): a apresentação em `/` é pública e mostra Gênesis 1:1 palavra por palavra; as telas do app redirecionam para `/login`. A conta sincroniza marcas, notas e o ponto de leitura.

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

## Rodar

```bash
npm ci
npm run dev      # http://localhost:8080
npm run verify   # lint, tipos, testes e build de verificação
```

Variáveis de ambiente, banco e deploy: [docs/onboarding.md](docs/onboarding.md).

## Documentação

- [Produto e escopo](PRODUCT.md)
- [Preparação local](docs/onboarding.md)
- [Código e arquitetura](docs/architecture.md)
- [Design e acessibilidade](docs/design.md)
- [Qualidade](docs/quality.md)
- [Instruções para agentes](AGENTS.md)
- [Setup e evidências](docs/setup.md)

## Ícone e nome na Tela de Início

`public/manifest.webmanifest` e `public/icons/` definem o nome "Bíblia Origens" e o ícone (árvore sobre o livro aberto). `apple-touch-icon.png` é de tela cheia (o iPhone arredonda), `icon-maskable-512.png` deixa a arte na zona segura do Android, e `logo-144.png` é o logo usado dentro do app. Favicon: `public/favicon.ico` e `public/icons/favicon-32.png`. Os links ficam em `src/routes/__root.tsx` (o iPhone escolhe o ícone com `sizes="180x180"`), junto com as tags de compartilhamento (`public/og.jpg`).

## Endereços públicos

- `/`: apresentação do app (sem login). É a página inicial informada ao Google.
- `/abrir`: abertura com a logo (1,8 s na primeira abertura do dia, 0,8 s nas outras; um toque pula), que leva ao login ou ao Início. É o `start_url` do app instalado; quem abre o app instalado em `/` (ícones antigos) é levado para cá antes da página aparecer.
- `/privacidade`, `/termos`: textos legais. `/sobre` redireciona para `/`.
