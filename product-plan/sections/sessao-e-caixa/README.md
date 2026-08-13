# Sessão e Caixa

## Visão

Abrir a noite com o caixa inicial de fichas, acompanhar a sessão em andamento e encerrá-la — garantindo uma sessão aberta por clube e nenhum jogador na mesa no fechamento.

## O que a interface permite

- Abrir a sessão informando o caixa inicial de fichas
- Acompanhar o tempo decorrido, retiradas, devoluções e rake da noite
- Ver a linha do tempo dos turnos, com o rake de cada um
- Encerrar a noite — bloqueado enquanto houver jogador na mesa

## Fluxos

### Abrir a noite

1. O operador conta o caixa de fichas
2. Digita o valor no campo "Caixa inicial de fichas"
3. Toca em "Abrir a noite"

**Resultado:** A sessão abre e o painel passa a acompanhar a conta

### Tentar encerrar com gente na mesa

1. O operador abre a seção Sessão
2. O bloco "Encerrar a noite" lista quem ainda está jogando
3. O botão "Encerrar sessão" está visível e desligado

**Resultado:** Ele sabe o que precisa resolver, não só que não pode (regra N11)

## Estados vazios

- **Nenhuma sessão aberta:** o formulário de abertura ocupa a tela, com o campo do caixa inicial
- **Sessão anterior encerrada:** uma linha informa que o relatório ficou guardado, com atalho para ele

## Componentes entregues

- **`AbrirSessao`** — Estado vazio da seção: uma pergunta, um campo, um botão
- **`ResumoCaixa`** — O resumo da noite até agora, com o rótulo mudando conforme haja ou não rake na mesa
- **`LinhaDoTempoTurnos`** — Os turnos da noite com dealer, período e rake
- **`EncerrarSessao`** — O encerramento, com a lista de quem ainda falta sair

## Callbacks

| Callback | Disparado quando |
|---|---|
| `onAbrir(caixaInicial)` | O operador confirma o caixa inicial e abre a noite |
| `onVerTurno(turnoId)` | O operador toca num turno da linha do tempo |
| `onEncerrar` | O operador encerra a sessão com a mesa vazia |

## Referência visual

- `sessao.png`

## Dados

- `types.ts` — o contrato completo
- `sample-data.json` — dados de amostra, na forma que os componentes esperam
