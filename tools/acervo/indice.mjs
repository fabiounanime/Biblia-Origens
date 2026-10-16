/**
 * Índice do acervo publicado: quais livros já têm capítulos no app.
 *
 *   node tools/acervo/indice.mjs   → public/content/bible/indice.json
 *
 * O build.mjs chama isto sozinho depois de gravar um livro. O Início lê este
 * arquivo pequeno para mostrar quanto de cada parte da Bíblia já chegou, sem
 * baixar os livros.
 *
 * Formato: { "livros": { "gn": { "capitulos": 50, "versiculos": 1533 }, … } }
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function writeIndex(root) {
  const dir = join(root, "public/content/bible");
  const livros = {};
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".json") || name === "indice.json") continue;
    const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
    if (!data || typeof data.bookId !== "string" || !Array.isArray(data.chapters)) continue;
    const capitulos = data.chapters.length;
    if (capitulos === 0) continue;
    const versiculos = data.chapters.reduce((sum, chapter) => sum + (chapter.verses?.length ?? 0), 0);
    livros[data.bookId] = { capitulos, versiculos };
  }
  const outPath = join(dir, "indice.json");
  writeFileSync(outPath, `${JSON.stringify({ livros })}\n`);
  return { outPath, count: Object.keys(livros).length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const { outPath, count } = writeIndex(root);
  console.log(`${outPath}: ${count} livros no acervo.`);
}
