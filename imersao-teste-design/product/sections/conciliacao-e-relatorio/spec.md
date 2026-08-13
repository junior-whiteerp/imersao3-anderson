# Conciliação e Relatório

## Overview

O painel de conciliação é o produto. Sem ele, o resto é um caderno digital.

Ele responde uma pergunta só: **o caixa fecha?** E quando não fecha, responde outras três — quanto falta, em qual janela de 30 minutos, e qual dealer estava operando.

O veredito não é contínuo. Ele é congelado a cada lançamento de rake. Entre um checkpoint e outro, o painel fica neutro, porque a diferença ali é esperada: falta declarar o rake que ainda está na mesa. Se o app alertasse o tempo todo, alertaria errado quase sempre — e o operador desligaria a notificação, matando o detector de furo junto.

O relatório é o que sobrevive à noite. Ele substitui o papel jogado fora depois do acerto.

## User Flows

- O operador abre o painel e vê o veredito do último checkpoint, com a hora em que ele foi congelado
- Entre checkpoints, ele vê a diferença atual em tom neutro e desde quando o rake não é declarado
- Falta ficha: ele lê o valor, a janela de horário e o dealer do turno, e vai revisar ainda com as pessoas no local
- A diferença passa de R$ 500: o painel recomenda suspender novas retiradas, sem bloquear a operação
- Ele percorre os checkpoints da noite para achar em qual deles a conta começou a não fechar
- Depois de encerrada, ele abre o relatório e revê todos os checkpoints da sessão

## A conta — premissa a confirmar

⚠️ **O PRD não fecha esta parte, e a simulação precisou de uma resposta.** O que está
implementado é a leitura abaixo. Se ela estiver errada, muda o produto inteiro.

O PRD diz que a conta é `tudo que saiu = tudo que voltou + o rake`. Mas no meio da noite os
jogadores estão segurando fichas que saíram e não voltaram, então essa igualdade não pode
fechar enquanto houver gente na mesa. Faltava dizer o que o checkpoint compara de fato.

**A leitura adotada:** o checkpoint compara o que deveria estar **dentro da caixa de fichas**
com o que está lá.

```
caixa esperada = caixa inicial
               − retiradas confirmadas
               + devoluções confirmadas
               + rake declarado

diferença      = caixa esperada − caixa contada
```

**Por que essa e não outra:** o lançamento de rake é o único momento em que o operador já
está com a mão na caixa. Contar a caixa ali custa segundos; contar as fichas de todos os
jogadores custa a noite. Isso explica sozinho por que o veredito congela no rake — que é a
regra N9 — e não em qualquer outro momento.

**O que a "diferença atual" significa entre dois checkpoints:** as **fichas em jogo**, ou
seja, `retiradas − devoluções − rake`. É o que saiu e ainda não voltou. Esse número é
esperado ser diferente de zero enquanto houver gente na mesa, e por isso ele nunca é
alerta. O app não tem como saber a diferença da caixa sem alguém contá-la.

**Consequência para a interface:** a faixa neutra é rotulada **"Fichas em jogo"**, não
"diferença". Chamar de diferença um número que o app não pode conhecer seria mentir para
o operador na tela em que ele mais precisa confiar.

**Pergunta em aberto para o dono do processo:** essa é a conta que o clube faz hoje no papel?
Se a conferência real for outra — por exemplo, contar as fichas de cada jogador — o modelo
muda e os checkpoints mudam junto.

## UI Requirements

- Veredito em destaque no topo, com a hora do checkpoint que o congelou
- Três faixas de divergência, conforme a regra N17: até R$ 100 registra e segue; entre R$ 100 e R$ 500 revisa a janela ainda na sessão; acima de R$ 500 recomenda suspender
- A recomendação de suspender é texto e botão — **nunca um bloqueio automático**
- Diferença esperada, com rake ainda na mesa, aparece em cinza. Nunca em vermelho
- Lista de checkpoints da noite em ordem cronológica, com hora, diferença e veredito
- Cada checkpoint mostra a janela e o turno, nunca uma acusação a pessoa
- Relatório da sessão encerrada acessível e completo, com todos os checkpoints
- Divergência registrada aparece no relatório como resultado, não como falha do sistema

---

## O relatório da sessão (F9, A13, A14)

Encerrada a noite, esta seção deixa de ser instrumento e vira registro. O relatório não é uma aba nova nem um lugar escondido: ele ocupa a mesma tela onde o operador acompanhou a conta a noite inteira.

Ele **não resume**. Mostra a conta inteira, todos os checkpoints, os turnos, quem passou pela mesa e cada exceção com o motivo escrito.

### A ordem dos blocos não é neutra

O relatório abre pelo veredito da noite e, logo abaixo, por **o que não fechou** — antes dos totais. Num relatório que abre pelo resultado, o que não fechou vira nota de rodapé, e era justamente ele o motivo de o produto existir.

### O número do topo é o da noite, não o da última conferência

Cada checkpoint registra apenas a falta **nova** da janela dele. Uma noite que perdeu R$ 60 às 20h15 e R$ 480 às 21h08 e fechou no último rake tem divergência de R$ 540.

Dizer "o caixa fechou" porque a conferência final deu zero esconderia exatamente o que o produto existe para achar. Quando a conferência final fecha mas a noite não, o relatório diz isso com todas as letras.

### Blocos

| Bloco | O que traz |
|---|---|
| **Capa** | Clube, horário de abertura e encerramento, duração, e o veredito da noite em tamanho de manchete |
| **O que não fechou** | Cada janela com falta, o valor, o checkpoint e os turnos que ela atravessa |
| **A conta da noite** | Caixa inicial, retiradas, devoluções, rake, caixa esperado, caixa contado, divergência |
| **Checkpoints** | Todos, em ordem, com janela e resultado |
| **Turnos e rake** | Cada turno com dealer, período e rake recolhido |
| **Quem passou pela mesa** | Entrada, saída, quanto tirou, quanto devolveu, resultado e contingências |
| **Exceções registradas** | Contingências (N16) e liberações acima do limite (N10), cada uma com o motivo escrito inteiro |

O motivo aparece **inteiro**, nunca resumido: ele é o registro, e resumi-lo seria apagá-lo pela metade.

### ⚠️ Pendência de modelagem herdada

Uma movimentação que teve **as duas** exceções — liberação de limite e contingência — guarda os dois motivos num campo só, juntos por " · ". O reducer concatena para não sobrescrever um com o outro, o que é melhor do que perder um, mas não é o certo.

O relatório mostra o texto inteiro e classifica a linha pela contingência. **No produto de verdade os dois motivos precisam de campos separados** — são duas exceções diferentes, com autoridades diferentes, e uma auditoria vai querer filtrar por uma sem a outra.
