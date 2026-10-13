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
