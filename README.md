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
- **Tipografia**: Literata (português), Frank Ruhl Libre (hebraico com nikud), Figtree (interface). A escala de fonte da Conta muda só o texto de leitura.
- **Leitor** (`src/routes/ler/$book.$chapter.tsx`): pinça com dois dedos para o tamanho da letra no celular (`src/lib/reader/use-pinch-font.ts`), camadas PT/HE/TR ligáveis (preferência do aparelho, `src/lib/reader/layers.ts`), ajustes em painel deslizante, troca de capítulo por gesto lateral, setas do teclado ou botões (atravessando livros), barra de progresso, ações por versículo (guardar, nota, copiar) e retomada no versículo onde parou.
- **Componentes compartilhados**: `src/components/ui.tsx` (marca, painel, controle segmentado, chave) e `src/components/reading-settings.tsx`.

## Login no Cloudflare Workers

Segredos/variáveis do Worker (painel da Cloudflare → Workers → biblia-origens → Settings → Variables and Secrets):

| Nome | Para quê |
| --- | --- |
| `DATABASE_URL` | Postgres (ex.: Neon). As tabelas são criadas sozinhas na primeira requisição. |
| `BETTER_AUTH_SECRET` | Chave fixa das sessões. |
| `BETTER_AUTH_URL` | Já vem do `wrangler.jsonc`: o endereço exato em que o app abre. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Opcional: outros endereços do app, separados por vírgula (ex.: domínio próprio). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login direto com Google. No Google Cloud, cadastre o retorno `https://biblia-origens.fabiounanime.workers.dev/api/auth/callback/google`. |

A página `/diagnostico` mostra o que está configurado e o que falta, sem expor segredos.

## Ícone e nome na Tela de Início

`public/manifest.webmanifest` e `public/icons/` definem o nome "Bíblia Origens" e o ícone do app instalado. Os links ficam em `src/routes/__root.tsx`, antes dos que a camada do Grok acrescenta (o navegador usa o primeiro manifesto; o iPhone escolhe o ícone com `sizes="180x180"`).
