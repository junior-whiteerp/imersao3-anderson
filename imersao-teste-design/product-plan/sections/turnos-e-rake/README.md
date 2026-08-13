# Turnos e Rake

## Visão

Abrir e trocar turno de dealer sem sobreposição, e lançar o rake com a hora em que ele saiu da mesa — inclusive retroativa — para atribuí-lo ao turno certo.

## O que a interface permite

- Abrir turno escolhendo o dealer, e trocar de dealer sem sobreposição
- Lançar o rake com duas horas visíveis e separadas: a de saída e a de digitação
- Ver a qual turno o rake será atribuído, antes de confirmar
- Ser avisado quando a hora escolhida cai num turno já fechado

## Fluxos

### Lançar o rake da meia hora

1. O dealer entrega o rake
2. O operador digita o valor
3. Confere a hora em que ele saiu da mesa (vem preenchida com a atual)
4. Toca em "Lançar e conferir o caixa"

**Resultado:** O checkpoint abre em seguida com o veredito (critério A1: menos de 2 segundos)

### Rake retroativo, com troca de turno no meio

1. O rake saiu da mesa às 21h05 e está sendo digitado às 21h12
2. A troca de turno aconteceu às 21h10
3. O operador corrige a hora de saída para 21h05

**Resultado:** O rake é atribuído ao dealer das 21h05, não ao das 21h12 (critério A5)

## Estados vazios

- **Nenhum turno aberto:** "Escolha o dealer para começar", com a lista de dealers
- **Nenhum rake lançado:** a lista de rakes não aparece

## Componentes entregues

- **`TurnoEmAberto`** — O turno rodando agora, com o rake acumulado e os botões de troca
- **`LancarRake`** — O lançamento que dispara o checkpoint, com as duas horas lado a lado
- **`ListaDeRakes`** — Os rakes da noite, com barra de proporção e a hora digitada quando difere

## Callbacks

| Callback | Disparado quando |
|---|---|
| `onAbrirTurno(dealerId)` | O operador escolhe o dealer do primeiro turno |
| `onTrocarDealer(dealerId)` | O operador passa o turno para outro dealer |
| `onDigitarValor(valor)` | O operador digita o valor do rake |
| `onMudarHora(hora)` | O operador corrige a hora em que o rake saiu da mesa |
| `onLancar` | O rake é lançado e o checkpoint abre em seguida |

## Referência visual

- `rake.png`

## Dados

- `types.ts` — o contrato completo
- `sample-data.json` — dados de amostra, na forma que os componentes esperam
