# Caixa Vivo — entrega de design

Tudo que é preciso para implementar o Caixa Vivo, a release 1 do StackTrack.

> **O caixa fecha sozinho. E quando não fecha, você sabe em qual meia hora e com qual dealer.**

## Comece por aqui

1. **`product-overview.md`** — o produto em uma página
2. **`regras/README.md`** — ⚠️ **as regras do caixa.** Elas são o produto; a interface é a casca. Há uma implementação de referência e as provas que a sustentam
3. **`design-system/tailwind-colors.md`** — a regra de cor, que não é estética: ela vem da regra N8 do PRD

## O que tem aqui

**Prompts prontos**
- `prompts/one-shot-prompt.md` — para implementar tudo numa sessão
- `prompts/section-prompt.md` — modelo para implementar seção por seção

**Instruções**
- `instructions/one-shot-instructions.md` — todos os milestones juntos
- `instructions/incremental/` — um documento por milestone

| Milestone | Seção | Pasta |
|---|---|---|
| `01` | Shell | `shell/` |
| `02` | Painel da Noite | `sections/painel-da-noite/` |
| `03` | Sessão e Caixa | `sections/sessao-e-caixa/` |
| `04` | Jogadores e Mesa | `sections/jogadores-e-mesa/` |
| `05` | Fichas | `sections/fichas/` |
| `06` | Turnos e Rake | `sections/turnos-e-rake/` |
| `07` | Conciliação e Relatório | `sections/conciliacao-e-relatorio/` |

**Assets**
- `design-system/` — tokens, cores, tipografia
- `regras/` — modelo, reducer e provas
- `data-shapes/` — contratos de dados da interface
- `shell/` e `sections/` — componentes, tipos, dados de amostra, testes e capturas

## Como usar

### Incremental (recomendado)

1. Copie a pasta `product-plan/` para o seu código
2. Comece pelo Shell (`instructions/incremental/01-shell.md`)
3. Para cada seção: abra `prompts/section-prompt.md`, preencha as três variáveis do topo, cole no seu agente
4. Revise e teste a cada milestone

### De uma vez

1. Copie a pasta `product-plan/` para o seu código
2. Abra `prompts/one-shot-prompt.md`, acrescente suas notas, cole no seu agente
3. Responda as perguntas dele antes de deixá-lo planejar

## Três coisas que vão morder se forem ignoradas

**A premissa da conta do checkpoint.** Está no PRD v1.7, seção 7, e resumida em `regras/README.md` — mas **pendente de confirmação do dono do processo**. Confirme antes de codar.

**Os dois motivos num campo só.** Uma movimentação que teve liberação de limite **e** contingência guarda os dois motivos juntos, separados por " · ". No produto eles precisam de campos separados.

**A tela de login precisa de servidor.** Ela é autenticação de verdade (F14 do PRD) e **não decide quem entra** — quem decide é quem recebe o `onEntrar(usuario, senha)`, que devolve uma `Promise`. Ligue-a a um provedor real. Consequência para a operação: a conta do operador é criada à mão antes da primeira sessão, e o app não abre sem ela.

**A mesa ao vivo é a primeira a cair.** A `MesaVisual` (F13) mostra uma regra sem guardar nenhuma. Se o prazo apertar, corte esta antes de qualquer outra. E `LugarOcupado.lugar` precisa de campo próprio na Participação — índice de array faz dois jogadores trocarem de lugar sozinhos.

---

*Gerado pelo Design OS*
