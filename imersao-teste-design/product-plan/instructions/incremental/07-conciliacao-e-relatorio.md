# Milestone 7: Conciliação e Relatório

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)

---

## Sobre esta entrega

**O que você está recebendo:**
- Telas prontas (componentes React com estilo completo)
- Requisitos de produto e especificação dos fluxos
- Tokens do design system (cores, tipografia)
- Dados de amostra mostrando a forma que os componentes esperam
- Especificação de testes focada em comportamento visível

**O seu trabalho:**
- Integrar estes componentes na sua aplicação
- Ligar os callbacks ao seu roteamento e à sua regra de negócio
- Trocar os dados de amostra por dados reais do backend
- Implementar os estados de carregando, erro e vazio

Os componentes são baseados em props — recebem dados e disparam callbacks. Como você organiza backend, camada de dados e regra de negócio é decisão sua.

⚠️ **Leia `regras/README.md` antes de começar.** As regras do caixa não são detalhe de implementação: elas são o produto. Há uma implementação de referência delas ali, com as provas que a sustentam.

---


## Objetivo

Implementar a seção **Conciliação e Relatório** — Mostrar o veredito do caixa a cada lançamento de rake — com valor, janela e dealer quando falta ficha — e guardar o relatório da sessão com todos os checkpoints da noite.

## O que a interface permite

- Ver o veredito congelado do último checkpoint
- Ver a diferença atual em tom neutro entre um checkpoint e outro
- Percorrer os checkpoints da noite para achar em qual a conta começou a não fechar
- Conferir a conta parcela por parcela, à mão
- Abrir o relatório da sessão depois de encerrada, com tudo que aconteceu

## Componentes entregues

Copie de `product-plan/sections/conciliacao-e-relatorio/components/`:

- **`PainelVeredito`** — O veredito congelado, com janela, turnos e o rodapé neutro
- **`ListaCheckpoints`** — Os checkpoints da noite, em ordem, cada um com sua ficha
- **`RelatorioDaSessao`** — O relatório da noite encerrada: veredito, o que não fechou, a conta, checkpoints, turnos, jogadores e exceções

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onRevisarJanela(checkpointId)` | O operador quer ver os lançamentos da janela que não fechou |
| `onAbrir(checkpointId)` | O operador toca num checkpoint da lista |

## Fluxos esperados

### Investigar um furo

1. O veredito mostra "Faltam R$ 480" com a janela 20h15–21h08
2. O operador toca em "Ver os lançamentos dessa janela"
3. Ele vê os turnos que a janela atravessa

**Resultado:** Ele sabe onde olhar e quem estava operando — o app mostra a janela, não acusa pessoa (regra N14)

### Abrir o relatório da noite

1. A sessão é encerrada
2. A seção passa a mostrar o relatório

**Resultado:** Todos os checkpoints, a conta, quem passou pela mesa e cada exceção com motivo escrito (critério A14)

## Estados vazios

- **Nenhum rake lançado:** "O primeiro checkpoint aparece no primeiro lançamento"
- **Sessão ainda aberta:** o relatório não existe. A tela mostra a conciliação ao vivo

## Testes

Veja `product-plan/sections/conciliacao-e-relatorio/tests.md`.

## Arquivos de referência

- `product-plan/sections/conciliacao-e-relatorio/README.md`
- `product-plan/sections/conciliacao-e-relatorio/types.ts`
- `product-plan/sections/conciliacao-e-relatorio/sample-data.json`
- `conciliacao.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular
