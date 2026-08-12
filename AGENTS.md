# Caixa Vivo — app da release 1

App de operação de caixa de fichas para sessões de poker. Uma noite: abrir
sessão, sentar jogadores, lançar ficha com confirmação na tela girada, lançar
rake e ver se o caixa fecha.

---

## A autoridade é o PRD, e ele mora fora deste repositório

```
../docs/PRD.md          →  /Users/juniorcesar/imersao3/docs/PRD.md
```

Ele manda em **regra, escopo, dado, tela e critério de aceitação**. Antes de
mudar comportamento, leia a seção correspondente:

| Quer mexer em | Leia |
|---|---|
| Uma regra do caixa | §10 (N1 a N19) |
| O que a tela mostra em cada estado | §11 |
| O que está dentro ou fora do MVP | §12 e §13 |
| O que precisa passar para estar pronto | §15 (A1 a A26) |
| Que dado é guardado | §9 |

A origem de cada regra está em `../Anderson Playbook/`, e as decisões já
tomadas em `20-Decisoes/DEC-NNN`.

## Portão obrigatório

Um Stop hook (`../scripts/prd-gate.sh`) impede encerrar o turno se algo em
`src/` ou `supabase/migrations/` for mais novo que o PRD. As três saídas
(atualizar regra, abrir decisão, ou registrar que não mudou produto) estão em
`../AGENTS.md`. **Não contorne o portão** — foi a falta dele que deixou a mesa
visual entrar no produto sem decisão.

---

## Como este app foi montado

Fatia vertical descrita em
`../imersao-teste-design/docs/superpowers/plans/2026-08-12-caixa-vivo-fatia-vertical.md`.

O ciclo de escrita é **carregar → reduzir → persistir delta**: cada ação lê as
linhas da sessão, monta o objeto `Noite`, roda o `reducer` já provado, e grava
só o que nasceu ou mudou.

| Pasta | Papel |
|---|---|
| `src/regras/` | `modelo.ts` e `reducer.ts` — **a única fonte de verdade das regras** |
| `src/sections/`, `src/shell/` | Componentes de tela, **cópia byte a byte** de `product-plan/` |
| `src/dados/` | Supabase: carregar a noite, gravar o delta |
| `src/telas/` | Traduzem `Noite` para as props que os componentes esperam. Nenhuma tela fala com o banco |
| `src/estado/` | `NoiteProvider` — carregando, pronto, erro |

### Regras de ouro deste repositório

- **Não edite componente copiado.** Arquivos sob `src/sections/`, `src/shell/`
  e `src/regras/` são cópias de `product-plan/`. Se um comportamento exigir
  mudar um deles, **pare e registre** — o conserto é no Design OS, não aqui.
  (Exceção já registrada: `shell/components/Login.tsx`, que trocou a porta de
  demonstração por autenticação real.)
- **Sem modo de demonstração.** Sem credencial do Supabase o app não sobe, de
  propósito. Um app que cai para dados de exemplo quando o banco some fica com
  cara de funcionando enquanto o caixa da noite não é registrado em lugar nenhum.
- **A regra de cor.** Verde, âmbar e vermelho pertencem ao veredito do caixa e
  a mais nada. Ação primária é ciano (`cv-ch-live`). Vem da N8: um botão verde
  gasta o canal que devia avisar do furo. Diferença esperada **nunca** usa
  vermelho.
- **Tema em `data-cv-tema`**, nunca na classe `dark` do documento. Escuro é o padrão.
- **Reais inteiros**, sem centavos — ficha de poker não tem centavo. Nunca
  introduza `numeric`.
- **Horas em `Minutos`**: inteiro desde a meia-noite do dia em que a sessão
  abriu, podendo passar de 1440.
- **Português** em nome de arquivo, função e variável.
- **`npm`**, não pnpm — este projeto é isolado e não faz parte do monorepo.
- Toda tarefa termina com commit, mensagem em português com prefixo convencional.

---

## Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm test           # suíte inteira
npm run provas     # só as provas herdadas das regras
npm run banco:subir  # Supabase local (exige Docker)
npm run banco:reset  # aplica migrations e seed
```

Os testes de banco **falham com a razão** quando o Docker não está rodando —
não são pulados em silêncio. Um teste pulado passando de verde é mentira.
