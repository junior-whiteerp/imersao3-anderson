# Painel da Noite

## Visão

A tela que fica aberta. Responde, de longe e sem toque, a única pergunta que importa durante a noite: a conta está fechando?

## O que a interface permite

- Ver o veredito do último checkpoint em uma olhada, sem navegar
- Ver na espinha da noite em qual momento a conta começou a não fechar, e quem estava no turno
- Identificar o rake que ainda está na mesa pelo trecho hachurado no fim da espinha
- Conferir a conta parcela por parcela sem sair da tela
- Ver quem está com mais ficha da caixa na mão e quem está perto do limite
- Tocar num checkpoint e cair na Conciliação; tocar num jogador e cair nas Fichas

## Fluxos

### Descobrir que a conta parou de fechar

1. O operador olha o painel entre lançamentos
2. O herói mostra o último veredito congelado, com valor e janela
3. Ele localiza na espinha a ficha com rótulo — as que fecharam não levam número
4. Ele toca na ficha e cai na Conciliação, naquela janela

**Resultado:** A investigação começa com as pessoas ainda no local, não dez horas depois

### Entender por que a conta não bate agora

1. O operador vê "fichas em jogo R$ 5.480" no mostrador
2. Ele lê o rodapé do herói: rake não declarado desde 21h40
3. Ele vê o trecho hachurado no fim da espinha

**Resultado:** Ele entende que a diferença é esperada e não interrompe a operação

## Estados vazios

- **Sem sessão:** "A noite ainda não começou", com um caminho para abrir a sessão. Nenhum número na tela
- **Sessão aberta, sem rake:** o herói diz que o primeiro checkpoint aparece no primeiro lançamento
- **Sessão encerrada:** o painel vira porta para o relatório — não há mais nada acontecendo para ele acompanhar

## Componentes entregues

- **`VereditoHero`** — O checkpoint congelado em tamanho de manchete, com janela, turnos e o rodapé neutro da regra N8
- **`EspinhaDaNoite`** — A noite inteira numa linha: uma ficha por checkpoint, uma faixa por turno, hachura no rake não declarado
- **`TilesDaNoite`** — Quatro mostradores: fichas em jogo, rake da noite, quantos na mesa, contingências usadas
- **`MostradorCaixa`** — A conta aberta em parcelas com barra de proporção
- **`MesaCompacta`** — A mesa ordenada por exposição, com barra de limite por jogador

## Callbacks

| Callback | Disparado quando |
|---|---|
| `onRevisarJanela` | O operador toca em "Ver os lançamentos dessa janela" no veredito |
| `onAbrirCheckpoint` | O operador toca numa ficha da espinha |
| `onAbrirJogador` | O operador toca num jogador da lista |

## Referência visual

- `painel.png`

## Dados

- `types.ts` — o contrato completo
- `sample-data.json` — dados de amostra, na forma que os componentes esperam
