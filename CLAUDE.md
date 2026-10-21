# Bíblia Origens — guia para o Claude

App de leitura da Bíblia inteira (66 livros): português em tradução fiel e direta do original, o original (hebraico no AT, grego no NT) e o transliterado. Publicado em **https://bibliaorigens.app**. Responsável: Innovati Soluções Web (Fábio Araujo).

Detalhes de acervo, layout e login estão no `README.md`. Convenções de tradução: `acervo/CONVENCOES.md`.

## Regras que não mudam sem o Fábio pedir

- **Login, landing e fluxo de entrada ficam como estão.** A leitura exige conta, `/` é a landing pública e leva ao `/login`, e `/privacidade` e `/termos` continuam. Esse arranjo foi aprovado na verificação da marca no Google Auth Platform; mudar pode afetar a aprovação.
- **O login com e-mail e senha continua**, ao lado do Google: é a conta que sincroniza marcas, notas e o ponto de leitura entre web e celular.
- **Sem zoom de pinça** em nenhum lugar do app, exceto no texto bíblico, onde a pinça ajusta o tamanho da letra.
- **Marca:** o nome "Bíblia Origens" aparece sempre na grafia uncial (componente `Wordmark`). Ícone: árvore dourada nascendo de um livro aberto, fundo azul-marinho. Não mudar nome, logo nem ícone.
- **Contato público:** só `contato@bibliaorigens.app`. Nenhum e-mail pessoal no app.
- **Tradução:** fiel ao original, sem seguir versões. יהוה = YHWH; nomes na forma tradicional; transliteração simples. Siga `acervo/CONVENCOES.md` à risca; todo livro passa por revisão independente.

## Stack

TanStack Start + React 19 + Tailwind v4 + Vite, servidor Nitro, Better Auth, Postgres (Neon) em produção. Hospedado em Cloudflare Workers (`wrangler.jsonc`, Worker `biblia-origens`).

## Rodar localmente

```sh
npm install
npm run dev        # http://localhost:8080
```

No Windows, se o PowerShell bloquear scripts, use `npm.cmd install` e `npm.cmd run dev`.

Sem `DATABASE_URL`, o app usa um banco embutido (PGLite) no próprio computador. O login com e-mail e senha funciona localmente, com contas só daquele computador; o login com Google só funciona no domínio oficial.

## Verificações

```sh
npm run typecheck
npm run lint
npm test
```

## Publicação

- O merge na `main` publica sozinho: a Cloudflare roda `npm run build` + `wrangler deploy`.
- As branches de PR rodam `wrangler preview`, que sempre falha porque o `wrangler.jsonc` não tem bloco `previews`. Essa falha não indica erro no código.
- Segredos (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) ficam no painel da Cloudflare, nunca no repositório.
- Trabalhe em branch e abra PR; não faça push direto na `main`.

## Mapa rápido

- `src/routes/` — telas (`index` landing, `login`, `inicio`, `ler/$book.$chapter` leitor, `conta`, `diagnostico`).
- `src/styles.css` — paleta e temas (tokens CSS).
- `src/lib/auth/` — login (Better Auth).
- `acervo/` — tradução, notas, léxico e revisão; `tools/acervo/` — scripts que montam os JSON.
- `public/content/bible/` — JSON gerados de cada livro (não editar à mão; rode `node tools/acervo/build.mjs <livro>`).
