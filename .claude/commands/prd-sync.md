---
description: Audita PRD × protótipo Design OS × app implementado e lista só os desacordos reais
---

# /prd-sync — conferir os três documentos

Confere se o PRD, o protótipo do Design OS e o app implementado ainda contam a
mesma história. Roda quando o portão do PRD fechar e você não souber por quê,
antes de exportar um pacote, e antes de dar uma fatia por pronta.

## Os quatro artefatos

| Papel | Caminho |
|---|---|
| **Autoridade** | `/Users/juniorcesar/imersao3/docs/PRD.md` |
| Origem das regras | `/Users/juniorcesar/imersao3/Anderson Playbook/` |
| Protótipo e pacote | `/Users/juniorcesar/imersao3/imersao-teste-design/` (`product/`, `src/`, `product-plan/`) |
| App implementado | `/Users/juniorcesar/imersao3/caixa-vivo/` |

Planos de execução: `imersao-teste-design/docs/superpowers/plans/`.

## Como conferir

Comece pelo estado bruto:

```bash
/Users/juniorcesar/imersao3/scripts/prd-gate.sh --relatorio
```

Depois audite em cinco lentes independentes. Se o volume pedir, rode em
paralelo — uma lente por agente.

1. **PRD × app** — cada regra N1..N19 e cada critério A1..A26: implementada,
   parcial ou ausente? Qual tem teste?
2. **PRD × protótipo** — as `spec.md` de `product/sections/` e
   `product/shell/spec.md` batem com §8, §11, §12 e §13 do PRD?
3. **Protótipo × app** — `diff -u` entre `product-plan/**/components/` e
   `caixa-vivo/src/`. As cópias devem ser byte a byte. Componente exportado que
   nenhuma tela renderiza conta como divergência.
4. **Plano × entrega** — o plano de execução prometeu o quê, e o que existe?
5. **Pacote exportado** — o `product-plan/` repassa as pendências 🔴 do PRD?
   Todo componente entregue tem `sample-data.json` e tipo que o alimentem?

## A regra que evita falso alarme

**Corte planejado e escrito não é desacordo.** Antes de reportar qualquer
achado, procure a exclusão no plano de execução e nas seções §12 e §13 do PRD.
F4, F9, F12 e encerrar sessão estão fora da primeira fatia **de propósito** —
reportá-los como falha é ruído que treina o operador a ignorar o relatório.

Um achado só vale com evidência dos **dois lados**, em `caminho:linha`. Tente
refutar cada um antes de escrever: as linhas citadas existem e dizem aquilo? O
achado confunde "o arquivo existe" com "está renderizado na tela"? Em dúvida,
derrube o achado.

## O que entregar

Em PT-BR simples, frases curtas:

1. **Desacordos confirmados**, do mais grave ao menos — o que o documento manda,
   o que o código faz, e as duas evidências.
2. **Pendências 🔴 abertas** que ainda esperam decisão do dono do processo.
3. Para cada desacordo, **qual das três saídas** ele pede: atualizar o PRD,
   abrir um `DEC-NNN`, ou registrar que não mudou produto.

Não conserte nada sem perguntar. Este comando audita; quem decide é o operador.
