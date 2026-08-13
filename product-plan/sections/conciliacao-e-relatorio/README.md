# Conciliação e Relatório

## Visão

Mostrar o veredito do caixa a cada lançamento de rake — com valor, janela e dealer quando falta ficha — e guardar o relatório da sessão com todos os checkpoints da noite.

## O que a interface permite

- Ver o veredito congelado do último checkpoint
- Ver a diferença atual em tom neutro entre um checkpoint e outro
- Percorrer os checkpoints da noite para achar em qual a conta começou a não fechar
- Conferir a conta parcela por parcela, à mão
- Abrir o relatório da sessão depois de encerrada, com tudo que aconteceu

## Fluxos

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

## Componentes entregues

- **`PainelVeredito`** — O veredito congelado, com janela, turnos e o rodapé neutro
- **`ListaCheckpoints`** — Os checkpoints da noite, em ordem, cada um com sua ficha
- **`RelatorioDaSessao`** — O relatório da noite encerrada: veredito, o que não fechou, a conta, checkpoints, turnos, jogadores e exceções

## Callbacks

| Callback | Disparado quando |
|---|---|
| `onRevisarJanela(checkpointId)` | O operador quer ver os lançamentos da janela que não fechou |
| `onAbrir(checkpointId)` | O operador toca num checkpoint da lista |

## Referência visual

- `conciliacao.png`

## Dados

- `types.ts` — o contrato completo
- `sample-data.json` — dados de amostra, na forma que os componentes esperam
