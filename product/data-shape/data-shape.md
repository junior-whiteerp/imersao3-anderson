# Data Shape

## Entities

### Clube
O estabelecimento que opera as sessões. Guarda o nome e o percentual do rake que vai para o dealer. Na release 1 existe apenas um.

### Sessão
Uma noite de jogo, do começo ao fim. Delimita tudo que acontece: guarda o caixa inicial de fichas, a hora de abertura, a hora de encerramento e a situação. Só uma sessão fica aberta por clube ao mesmo tempo.

### Jogador
Quem joga no clube. A identidade é o par nome + WhatsApp, único dentro do clube — ambos obrigatórios. CPF é opcional. Guarda também o limite de crédito e a data do consentimento. O jogador existe entre sessões; sem cadastro não sai ficha.

### Participação
A presença de um jogador numa sessão específica: quando entrou na mesa e quando saiu. É o que separa "o jogador existe" de "o jogador está jogando agora".

### Dealer
Quem opera a mesa. Guarda apenas o nome. Existe entre sessões.

### Turno
O período em que um dealer específico esteve operando dentro de uma sessão, com início e fim. Turnos não se sobrepõem. É o turno que dá nome a quem estava na mesa quando um furo aconteceu.

### Movimentação
Cada entrada ou saída de ficha: retirada, devolução ou rake. Guarda o valor, a hora em que aconteceu e a hora em que foi digitada — as duas, porque um rake retirado às 21h05 e digitado às 21h12 pertence ao turno das 21h05. Tem quatro situações: aguardando confirmação, confirmada, recusada ou cancelada.

### Confirmação
O aceite do jogador sobre uma retirada. Guarda o valor confirmado, a hora, e se foi presencial normal ou contingência — quando o operador confirmou sem o jogador olhar a tela, com motivo escrito.

### Checkpoint
A foto do caixa no instante em que um rake é lançado. Guarda a soma dos saldos, o rake acumulado, a diferença, o veredito, e a janela de horário e o turno a que a diferença pertence. É o que substitui o número único do fim da noite.

## Relationships

- Clube has many Sessão
- Clube has many Jogador
- Sessão belongs to Clube
- Sessão has many Participação
- Sessão has many Turno
- Sessão has many Movimentação
- Sessão has many Checkpoint
- Jogador belongs to Clube
- Jogador has many Participação
- Participação belongs to both Jogador and Sessão
- Participação has many Movimentação
- Dealer has many Turno
- Turno belongs to both Dealer and Sessão
- Turno has many Movimentação
- Movimentação belongs to Sessão
- Movimentação belongs to Participação (exceto o rake, que pertence só ao Turno)
- Movimentação belongs to Turno
- Movimentação has one Confirmação
- Confirmação belongs to Movimentação
- Checkpoint belongs to Sessão
- Checkpoint refers to Turno
