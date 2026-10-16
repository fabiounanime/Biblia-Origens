# Bíblia Origens — guia de tradução e revisão

Este guia vale para os 66 livros. Quem traduz ou revisa um livro lê este arquivo inteiro antes de começar.

## Princípio

Tradução **fiel e direta do texto original**, sem seguir nenhuma versão existente (nem portuguesa, nem inglesa). Cada versículo é traduzido olhando o original e a análise de cada palavra. Na dúvida entre o elegante e o fiel, fica o fiel.

## Fontes

| Parte | Texto | Análise | Pasta (cache) |
|---|---|---|---|
| Antigo Testamento | Códice de Leningrado (OSHB) | OSHB, por palavra (lema de Strong + morfologia) | `tools/acervo/.cache/morphhb/wlc` |
| Novo Testamento | SBL Greek New Testament (texto crítico) | MorphGNT (lema + morfologia) | `tools/acervo/.cache/sblgnt` |

- **Versificação do original.** No AT, a hebraica (ex.: Joel tem 4 capítulos, Malaquias 3; os títulos dos Salmos são o v. 1). No NT, a da SBLGNT.
- **Versículos ausentes no NT.** Os versículos que os manuscritos mais antigos não trazem (ex.: Mt 17:21; Jo 7:53–8:11) não estão no texto. Uma nota no versículo anterior explica o que falta e traduz o texto dos manuscritos posteriores.
- **Ketiv/qere no AT.** O app mostra e traduz a leitura tradicional (qere). Quando o texto escrito (ketiv) muda o sentido, vale uma nota.

## Fluxo de um livro

Exemplo com `dt`; os identificadores dos livros estão em `tools/acervo/livros.mjs`.

1. **Lemas novos.** Rode `node tools/acervo/lemas.mjs dt`: a saída lista as palavras do livro que ainda não têm significado no glossário.
2. **Glossário.** Escreva o significado de cada uma:
   - Hebraico: em `acervo/lexico/glosas.d/dt.txt` e `acervo/lexico/nomes.d/dt.txt`.
   - Grego: em `acervo/lexico/grego.d/dt.txt`.
3. **Folha.** Rode `node tools/acervo/folha.mjs dt 1-5`: cada versículo vem com o original e o significado + análise de cada palavra.
4. **Tradução.** Em `acervo/traducao/dt.txt`, uma linha por versículo (`1:1 texto`), com cabeçalho de comentários (`#`) que lista o vocabulário próprio do livro.
5. **Notas.** Em `acervo/notas/dt.txt`.
6. **Build.** `node tools/acervo/build.mjs dt --verificar 1-34` precisa terminar sem erros. Ele confere:
   - se falta ou sobra algum versículo;
   - se cada nota aponta para um trecho que existe;
   - se alguma palavra ficou sem significado.
7. **Revisão independente.** Rode `node tools/acervo/folha.mjs dt 1-34 --revisao`. A folha mostra original + palavras + português, e o revisor confere versículo a versículo.

Nunca edite os arquivos de `public/content/bible/`: eles são gerados pelo build.

### Livro em partes

Livros grandes são traduzidos em partes, ao mesmo tempo, por tradutores diferentes. Cada parte tem seus próprios arquivos, nomeados pelo primeiro capítulo com três dígitos (ex.: Isaías 34–66 → `034`):

| O quê | Arquivo da parte |
|---|---|
| Tradução | `acervo/traducao/is.d/034.txt` |
| Notas | `acervo/notas/is.d/034.txt` |
| Glossário | `acervo/lexico/glosas.d/is-034.txt`, `nomes.d/is-034.txt` (grego: `grego.d/mt-016.txt`) |
| Revisão | `acervo/revisao/is-034.md` |

- Os comandos recebem os capítulos da parte: `lemas.mjs is 34-66`, `folha.mjs is 34-40`.
- Para conferir, use `node tools/acervo/build.mjs is --verificar 34-66`: confere só esses capítulos e não grava nada.
- Antes de começar, leia o que as outras partes do mesmo livro já escreveram e siga as mesmas escolhas para os termos recorrentes.

## Português — regras gerais (AT e NT)

- **Palavras acrescentadas.**
  - Ficam entre **[colchetes]** as palavras que não existem no original e entram pelo sentido (ex.: o verbo "ser" das frases nominais hebraicas, um sujeito subentendido).
  - Artigos, preposições e pronomes exigidos pela gramática portuguesa não levam colchetes.
  - No app, os colchetes aparecem em itálico claro.
- **Conjunção inicial.**
  - No hebraico, o vav que liga as frases é **"E"**, nunca "mas"; "mas" só quando o original tem uma adversativa (כִּי אִם, אֲבָל, אַךְ…, ou כִּי depois de uma negação: "não… mas…").
  - No grego, καί = "e"; δέ = "e" ou "mas", conforme o contraste do contexto; ἀλλά = "mas".
- **Ordem das palavras.** Segue o original sempre que o português permite.
- **Tempo, pessoa, número, gênero e voz** como no original:
  - o passivo continua passivo;
  - o presente histórico do grego fica no presente ("e diz-lhes").
- **Expressões ao pé da letra** quando o português entende: "filho de N anos", "cortar aliança", "lábio" (língua), "cabeça" (topo), "levantar a face", "pesado" (rico, grave), "à boca da espada". A nota explica quando necessário.
- **Infinitivo absoluto hebraico em dobro, ao pé da letra:** "comendo comerás", "morrendo morrerás".
- **Números por extenso**, na ordem natural do português.
- **Nomes de pessoas e lugares** na forma tradicional em português (Abraão, Moisés, Pedro, Paulo, Jerusalém, Cafarnaum).
- **Mesmo termo, mesma tradução.** A mesma palavra do original recebe a mesma tradução no livro inteiro, salvo quando o contexto exige outra; nesse caso, vale uma nota.
- **Ortografia.** Português do Brasil, Acordo de 1990. Pronomes como nas traduções clássicas (tu/vós; "disse-lhe", "fê-lo"), sem arcaísmos desnecessários.

## Antigo Testamento — vocabulário fixo

### Deus

| Original | Tradução |
|---|---|
| יהוה | **YHWH** |
| אֱלֹהִים, אֵל | Deus |
| אֲדֹנָי (título divino) | Senhor |
| אֲדֹנִי | meu senhor |
| אֵל עֶלְיוֹן | Deus Altíssimo |
| אֵל שַׁדַּי | Deus Todo-Poderoso |
| יְהוָה צְבָאוֹת | YHWH dos Exércitos |
| מַלְאָךְ | anjo (enviado de Deus) / mensageiro (humano) |

### Pessoas e povos

| Original | Tradução |
|---|---|
| עַם | povo |
| לְאֹם | gente |
| גּוֹי | nação |
| שִׁפְחָה | serva |
| אָמָה | escrava |
| עֶבֶד | servo |
| רֵעַ | próximo |
| גֵּר | estrangeiro (peregrino, no verbo גּוּר) |
| נָשִׂיא | príncipe |
| עֵדָה | congregação |
| קָהָל | assembleia |
| נָבִיא | profeta |
| כֹּהֵן | sacerdote |
| קָטָן | menor |
| צָעִיר | mais novo |

### Terra e lugares

| Original | Tradução |
|---|---|
| אֲדָמָה | solo |
| אֶרֶץ | terra |
| פֶּתַח | entrada |
| שַׁעַר, דֶּלֶת | porta |
| שְׁאוֹל | Sheol |
| יְאֹר | Nilo |

### Vida, alma e espírito

| Original | Tradução |
|---|---|
| נֶפֶשׁ | alma |
| נֶפֶשׁ חַיָּה | alma vivente |
| רוּחַ | espírito / vento / fôlego |
| לֵב, לֵבָב | coração |

### Fé e aliança

| Original | Tradução |
|---|---|
| חֶסֶד | bondade |
| אֱמֶת | verdade |
| אֱמוּנָה | fidelidade |
| צְדָקָה, צֶדֶק | justiça |
| מִשְׁפָּט | juízo |
| בְּרִית | aliança |
| תּוֹרָה | instrução (Torá, quando nome do conjunto) |
| חֹק, חֻקָּה | estatuto |
| מִצְוָה | mandamento |
| קֹדֶשׁ | santo / santidade |
| כָּבוֹד | glória |

### Pecado e culto

| Original | Tradução |
|---|---|
| חַטָּאת | pecado / oferta pelo pecado |
| עָוֺן | iniquidade |
| פֶּשַׁע | transgressão |
| כִּפֶּר | fazer expiação |
| עֹלָה | holocausto |
| מִנְחָה | oferta de manjares |
| זֶבַח | sacrifício |
| הִשְׁתַּחֲוָה | prostrar-se |

### Verbos de governo

| Original | Tradução |
|---|---|
| רָדָה | dominar |
| מָשַׁל | governar |

### Rebanho e provisão

| Original | Tradução |
|---|---|
| צֹאן | ovelhas |
| עֵדֶר | rebanho |
| שֶׁבֶר | provisão |
| בָּר | cereal |

### Lista completa

O vocabulário próprio de cada livro fica no cabeçalho de `acervo/traducao/{livro}.txt` (veja `gn.txt`, `ex.txt`, `lv.txt`, `nm.txt`).

### Poesia

Salmos, Provérbios, Jó e os profetas pedem fidelidade às imagens. Não se explica a metáfora no texto, mas pode-se explicá-la na nota. O paralelismo se mantém: as duas metades do verso ficam separadas por ponto e vírgula ou vírgula, sem fundir uma na outra.

### Aramaico

Os trechos em aramaico seguem as mesmas regras; uma nota no início do trecho avisa:
- Dn 2:4b–7:28;
- Ed 4:8–6:18 e 7:12–26;
- Jr 10:11;
- Gn 31:47 (duas palavras).

## Novo Testamento — vocabulário fixo

### Deus, Cristo e Espírito

| Grego | Tradução |
|---|---|
| Ἰησοῦς | Jesus |
| Χριστός | Cristo |
| θεός | Deus |
| κύριος | Senhor (Deus ou Jesus) / senhor (homens) |
| πνεῦμα | espírito / Espírito (o de Deus) |
| πνεῦμα ἅγιον | Espírito Santo |
| ὁ υἱὸς τοῦ ἀνθρώπου | o Filho do Homem |
| λόγος | palavra / a Palavra (Jo 1) |

- **κύριος em citações do AT.** Fica "Senhor", mesmo quando o hebraico tem YHWH. Na primeira citação de cada livro, uma nota avisa.

### Reino e mundo

| Grego | Tradução |
|---|---|
| ἡ βασιλεία τοῦ θεοῦ | o reino de Deus |
| ἡ βασιλεία τῶν οὐρανῶν | o reino dos céus |
| κόσμος | mundo |
| αἰών | era, século (na expressão "para sempre": εἰς τὸν αἰῶνα) |
| αἰώνιος | eterno |

### Fé e salvação

| Grego | Tradução |
|---|---|
| πίστις | fé |
| πιστεύω | crer |
| χάρις | graça |
| ἀγάπη | amor |
| ἀγαπάω, φιλέω | amar (nota onde o contraste importa, Jo 21:15–17) |
| ἀλήθεια | verdade |
| δικαιοσύνη | justiça |
| δικαιόω | justificar |
| ἁμαρτία | pecado |
| μετάνοια | arrependimento |
| μετανοέω | arrepender-se |
| σῴζω | salvar |
| σωτηρία | salvação |
| ζωή | vida |
| ψυχή | alma / vida |
| σάρξ | carne |
| σῶμα | corpo |
| δόξα | glória |
| ἅγιος | santo |
| οἱ ἅγιοι | os santos |

### Pessoas e instituições

| Grego | Tradução |
|---|---|
| ἀπόστολος | apóstolo |
| μαθητής | discípulo |
| ἄγγελος | anjo / mensageiro (humano) |
| ἐκκλησία | igreja (nota na primeira ocorrência de cada livro: "assembleia, os chamados") |
| Ἰουδαῖοι | judeus |
| Φαρισαῖοι | fariseus |
| γραμματεῖς | escribas |
| ἀρχιερεύς | sumo sacerdote |
| ἱερόν | templo |
| ναός | santuário |
| νόμος | lei (Lei, quando é a Lei de Moisés) |
| γραφή | Escritura |

### Evangelho e práticas

| Grego | Tradução |
|---|---|
| εὐαγγέλιον | evangelho |
| εὐαγγελίζομαι | anunciar o evangelho |
| βαπτίζω | batizar (nota na primeira ocorrência: "imergir") |
| βάπτισμα | batismo |
| ἀμήν | amém (inclusive em ἀμὴν λέγω ὑμῖν = "amém vos digo") |
| Πάσχα | Páscoa |
| σάββατον | sábado |

### Espíritos e morte

| Grego | Tradução |
|---|---|
| Σατανᾶς | Satanás |
| διάβολος | diabo |
| δαιμόνιον | demônio |
| ᾅδης | Hades |
| γέεννα | Geena |

### Nomes que mudam conforme a pessoa

| Grego | Pessoa | Tradução |
|---|---|---|
| Ἰάκωβος | apóstolos e o irmão do Senhor | Tiago |
| Ἰακώβ | o patriarca | Jacó |
| Ἰούδας | o patriarca e a tribo | Judá |
| Ἰούδας | o Iscariotes, o irmão do Senhor e outros | Judas |

## Notas do tradutor

**Formato.** `acervo/notas/{livro}.txt`, uma por linha:

```
capítulo:versículo | trecho exato da tradução | texto da nota
```

- A chamada (a, b, c…) aparece logo depois do trecho.
- O trecho precisa aparecer **uma única vez** no versículo e não pode cortar palavra nem terminar dentro de colchetes.
- `*asteriscos*` marcam itálico: palavras transliteradas e citações.

**Quantidade.** Em média, uma nota a cada 8 a 15 versículos. Mais nos trechos difíceis, menos nas listas e genealogias.

**O que merece nota:**
- palavra de sentido incerto ou rara;
- jogo de palavras e significado de nomes;
- expressão traduzida ao pé da letra que pede explicação;
- variante importante de manuscritos ou versões antigas (Pentateuco Samaritano, Septuaginta, Qumran; no NT, manuscritos posteriores);
- diferença de numeração em relação às bíblias em português;
- citação do AT no NT, com a referência;
- medidas e moedas;
- ketiv/qere que muda o sentido.

**O que não entra:**
- opinião teológica ou doutrinária;
- aplicação devocional;
- interpretação apresentada como certa quando é discutida (use "ou:" e "o sentido é discutido").

Cada nota explica, em poucas frases, o que o leitor precisa para entender o texto.

## Glossário (significado de cada palavra)

**Hebraico, palavras comuns** (`glosas.d/{livro}.txt`):

```
lema da OSHB | significado
```

- Sinônimos separados por vírgula: o primeiro aparece em destaque e os outros como "Também".
- Verbos: o sentido do qal primeiro; depois cada grau, separado por " | ", no formato `h: fazer sair`.
- Códigos dos graus: q qal · N nifal · p piel · P pual · h hifil · H hofal · t hitpael · Q qal passivo · o polel · O polal · r hitpolel · v histafel · l pilpel.

**Hebraico, nomes próprios** (`nomes.d/{livro}.txt`):

```
lema | forma em português | tipo
```

- O tipo é: p pessoa · l lugar · g povo · d Deus · r rio · o outro.
- A forma em português é a mesma usada na tradução.

**Grego** (`grego.d/{livro}.txt`):

```
lema da MorphGNT, exatamente como aparece | significado
```

- Nomes próprios também ficam aqui, com a forma em português.
- O artigo (ὁ, ἡ, τό) não precisa de significado: o app o traduz pelo caso.

**Regras de forma:**
- significado curto, em português, no infinitivo para verbos e no singular para nomes;
- sem explicações longas: elas vão nas notas;
- se um lema já existe no glossário principal ou de outro livro, não repita: vale o primeiro.

## Revisão independente

O revisor não viu a tradução sendo feita. Ele confere **todos** os versículos contra o original e a análise de cada palavra.

**O que procurar:**
1. Erro de sentido.
2. Pessoa, número, gênero, tempo, aspecto ou voz errados.
3. Palavra do original omitida, ou palavra acrescentada **sem** colchetes que muda ou acrescenta sentido. Artigos, preposições e pronomes exigidos pelo português não contam.
4. Número ou nome próprio errado ou trocado.
5. O mesmo termo traduzido de formas diferentes sem motivo, ou fora deste guia.
6. Nota com informação errada ou trecho mal apontado.

**O que não é erro:**
- preferência de estilo;
- leitura legítima de passagem discutida;
- qualquer convenção deste guia.

**Ao terminar,** o revisor:
- corrige diretamente os erros claros;
- registra cada correção em `acervo/revisao/{livro}.md`, no formato `C:V — problema — como ficou`;
- roda o build de novo (`--verificar`).

## Códigos de análise (resumo)

**OSHB (hebraico).** Primeira letra H (hebraico) ou A (aramaico); depois as classes:
- N substantivo (Nc comum, Np próprio, Ng gentílico): gênero m/f/b, número s/p/d, estado a/c/d;
- V verbo: grau (letra do binyan), forma (p perfeito, q perfeito com vav, i imperfeito, w wayyiqtol, h coortativo, j jussivo, v imperativo, r particípio ativo, s particípio passivo, a infinitivo absoluto, c infinitivo construto), pessoa, gênero e número;
- outras classes: A adjetivo · P pronome · R preposição · C conjunção · D advérbio · T partícula (Td artigo, To objeto direto) · S sufixo (Sp pronominal, Sd de direção);
- uma "/" separa prefixos e sufixos da palavra.

**MorphGNT (grego).**
- Classes:
  - N- substantivo · V- verbo · A- adjetivo · RA artigo;
  - RP pronome pessoal · RD pronome demonstrativo · RR pronome relativo · RI interrogativo/indefinido;
  - P- preposição · C- conjunção · D- advérbio · X- partícula · I- interjeição.
- Análise em 8 posições: pessoa · tempo · voz · modo · caso · número · gênero · grau.
  - Tempo: P presente · I imperfeito · F futuro · A aoristo · X perfeito · Y mais-que-perfeito.
  - Voz: A ativa · M média · P passiva.
  - Modo: I indicativo · D imperativo · S subjuntivo · O optativo · N infinitivo · P particípio.
  - Caso: N nominativo · G genitivo · D dativo · A acusativo · V vocativo.
