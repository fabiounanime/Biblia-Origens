# Bíblia Origens

PWA de leitura do Tanakh para estudo: português em tradução direta, hebraico e transliterado, nesta ordem. Modo escuro por padrão, com modo claro. A leitura é aberta. A conta sincroniza marcas, notas e o ponto de leitura.

O texto bíblico não está neste repositório. Cada livro entra como JSON em `public/content/bible/{bookId}.json`:

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

- **Paleta "cores do Tabernáculo"** (Êx 26:1), em `src/styles.css`: *tekhelet* (azul, ação principal e Neviim), *zahav* (ouro, Torá e hebraico), *argaman* (púrpura, Ketuvim), *shani* (escarlate, marcas e notas). Modo escuro azul-noturno por padrão; modo claro em linho frio.
- **Marca**: o nome "Bíblia Origens" aparece sempre na grafia uncial (Uncial Antiqua) em tinta de pergaminho, pelo componente `Wordmark` (`src/components/ui.tsx`) e a classe `.wordmark`. A abertura é sempre escura, com a logo, o nome e o lema em IM Fell English itálico.
- **Tipografia**: Literata (português), Frank Ruhl Libre (hebraico com nikud), Figtree (interface). A escala de fonte da Conta muda só o texto de leitura.
- **Leitor** (`src/routes/ler/$book.$chapter.tsx`): pinça com dois dedos para o tamanho da letra no celular (`src/lib/reader/use-pinch-font.ts`), camadas PT/HE/TR ligáveis (preferência do aparelho, `src/lib/reader/layers.ts`), ajustes em painel deslizante, troca de capítulo por gesto lateral, setas do teclado ou botões (atravessando livros), barra de progresso, ações por versículo (guardar, nota, copiar) e retomada no versículo onde parou.
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

`public/manifest.webmanifest` e `public/icons/` definem o nome "Bíblia Origens" e o ícone (árvore sobre o livro aberto). `apple-touch-icon.png` é de tela cheia (o iPhone arredonda), `icon-maskable-512.png` deixa a arte na zona segura do Android, e `logo-144.png` é o logo usado dentro do app. Favicon: `public/favicon.ico` e `public/icons/favicon-32.png`. Os links ficam em `src/routes/__root.tsx`, antes dos que a camada do Grok acrescenta (o navegador usa o primeiro manifesto; o iPhone escolhe o ícone com `sizes="180x180"`).
