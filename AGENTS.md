# StackTrack — Governança do contexto

Esta pasta é o **repositório de governança**. Ela guarda as duas coisas que
mandam no produto, e nenhum código:

| Onde | O que é |
|---|---|
| `docs/PRD.md` | **A autoridade.** Regra, escopo, tela e critério do Caixa Vivo (release 1) |
| `Anderson Playbook/` | O vault de origem: briefing, SOPs, árvore de autoridade, decisões `DEC-NNN` |

O código vive em dois repositórios irmãos, ignorados aqui de propósito:

| Repositório | O que é | Autoridade |
|---|---|---|
| `imersao-teste-design/` | Design OS — protótipo, specs de tela, pacote exportado | O PRD |
| `caixa-vivo/` | O app de verdade — React, backend TypeScript, Postgres, testes | O PRD |

---

## A rotina obrigatória: nenhuma mudança sem PRD

> **Regra única:** toda mudança de **regra, escopo, dado ou tela** entra no PRD
> **antes** de o trabalho ser dado por encerrado. Sem exceção e sem escalação —
> é a mesma severidade da N15 lá dentro.

### Por que ela existe

O PRD v1.7 nasceu de uma auditoria que achou seis desvios entre documento e
protótipo. Dois deles chegaram ao produto sem ninguém decidir nada: a **conta
do checkpoint** (a fórmula que diz se o caixa fecha) e a **mesa visual "Ao
vivo"**, que estava escrita em "fora do escopo" e foi construída assim mesmo.

Nenhum dos dois foi má-fé. Foi só que **não existia portão nenhum** entre
"escrevi código" e "o documento soube". O código virou pacote exportado, o
pacote virou instrução de implementação, e a instrução mandava construir uma
coisa que o PRD tinha rejeitado. Três documentos discordando, e o desacordo só
apareceu numa auditoria.

Esta rotina é o portão que faltava.

### Como ela roda

Um **Stop hook** (`scripts/prd-gate.sh`) está registrado nos dois repositórios
de código. Ele compara duas datas: a mudança mais recente em código de produto
contra a última vez que o PRD foi tocado. Se o código for mais novo, o turno
**não encerra**.

```bash
scripts/prd-gate.sh --relatorio   # ver o estado sem bloquear nada
```

Caminhos governados — mexer aqui fecha o portão:

```
caixa-vivo/src/                          regra, tela, dado, navegação
caixa-vivo/banco/migrations/             o modelo de dados do PRD §9
caixa-vivo/servidor/                     a API e a regra, onde ela manda
imersao-teste-design/product/            specs, roadmap, data-shape, tokens
imersao-teste-design/product-plan/       o pacote exportado
imersao-teste-design/src/sections/       componentes de tela
imersao-teste-design/src/shell/          navegação e chrome
```

> ⚠️ O caminho do script está absoluto nos dois `.claude/settings.json`. Se esta
> pasta mudar de lugar, atualize os dois — um hook que não acha o script falha
> em silêncio, e um portão silencioso é pior que portão nenhum.

### As três saídas — toda mudança usa uma

Quando o portão fecha, olhe o que mudou de fato (`git diff`) e classifique:

| A mudança | O que fazer | Onde |
|---|---|---|
| **Mudou regra, escopo ou tela** | Atualize a seção certa, suba a versão no frontmatter, escreva a linha no Histórico | `docs/PRD.md` §8, §10, §11, §12, §13, §15 |
| **Foi decisão de produto** | Além do PRD, abra um `DEC-NNN` e ligue-o na Rastreabilidade | `Anderson Playbook/20-Decisoes/`, formato de `90-Templates/template-decisao.md` |
| **Não mudou produto** (refactor, teste, estilo, correção de bug) | Uma linha no **Registro de mudanças do sistema** dizendo o que foi e por que não mexeu em regra | `docs/PRD.md`, fim do arquivo |

**A terceira saída não é escapatória — é a mais importante.** Ela custa uma
linha e mantém o registro honesto: "mexi aqui, e isto não muda o produto". Uma
mudança que você não consegue encaixar em nenhuma das três é sinal de que ela
precisa de conversa, não de commit.

### O que nunca fazer

- **Contornar o portão.** Se o bloqueio parece errado, diga isso ao operador.
  Desligar o hook para entregar mais rápido é o comportamento exato que a
  rotina existe para impedir.
- **Tocar o PRD só para abrir o portão.** Um `touch` sem conteúdo é mentira com
  cara de processo.
- **Decidir sozinho o que o PRD marcou em vermelho.** 🔴 no PRD quer dizer
  decisão do dono do processo. Pergunte.

### Conferir os três documentos de uma vez

`/prd-sync` roda a auditoria cruzada — PRD contra protótipo contra app — e
devolve só os desacordos que sobrevivem a uma tentativa de refutação.

---

<!-- tostudy:start -->

## ToStudy — Active Course

- **Course:** Playbook Executável de Operação, Do Contexto à Automação (0% complete)
- Read `.tostudy/courses/playbook-executavel-de-operacao-do-contexto-a-automacao/AGENTS.md` for the full tutor instructions.
- Study commands: run `/tostudy` (or `tostudy menu` in the terminal).

<!-- tostudy:end -->
