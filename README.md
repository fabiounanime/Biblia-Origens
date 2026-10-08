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
