# Painel da Noite

## Overview

O Painel da Noite é a tela que fica aberta.

As outras seis seções são lugares onde o operador **faz** alguma coisa: abre a sessão, senta um jogador, lança uma ficha, lança o rake, fecha uma conta. O painel não pede ação nenhuma. Ele responde, de longe e sem toque, a única pergunta que importa durante a noite: **a conta está fechando?**

Ele existe porque o produto tem um problema de atenção, não de dado. Todos os números do painel já viviam espalhados pelas outras seções — o veredito na Conciliação, o caixa na Sessão, a exposição na Mesa, o rake nos Turnos. Um operador de pé, no meio de uma noite de dez horas, não navega entre cinco telas para montar essa leitura na cabeça. Ele olha uma vez.

O painel não calcula nada. Ele recebe a noite já derivada e desenha — é o que garante que ele nunca discorde das outras seções.

## User Flows

- O operador deixa o painel aberto entre lançamentos e olha de tempo em tempo
- Ele lê o veredito do último checkpoint em uma olhada, sem navegar
- Ele vê na espinha da noite **em qual momento** a conta começou a não fechar, e quem estava no turno
- O trecho hachurado no fim da espinha diz que existe rake na mesa ainda não declarado — e que a diferença atual é esperada por causa dele
- Ele confere a conta parcela por parcela no mostrador, sem sair da tela
- Ele vê quem está com mais ficha da caixa na mão, e quem está perto do limite
- Ele toca num checkpoint e cai na Conciliação, naquela janela
- Ele toca num jogador e cai nas Fichas, naquele jogador

## Peças

### Veredito (herói)

O checkpoint congelado, em tamanho de manchete. Palavra em serifa, dinheiro em mono — o operador distingue "o que o app decidiu" de "o que o app contou" pela forma da letra, antes de terminar de ler.

Traz a janela, os turnos que ela atravessa e, no pé, a linha neutra da regra N8: agora são tantas horas, o rake não é declarado desde tal hora, e a diferença atual é esperada.

Quando ainda não houve rake, ele diz isso em vez de mostrar zero — antes do primeiro lançamento o app não conhece diferença nenhuma.

### Espinha da noite

A noite de ponta a ponta numa linha. Cada ficha é um checkpoint, posicionada na hora em que aconteceu. Cada faixa é um turno de dealer, com o nome embaixo. O trecho hachurado no fim é o rake que ainda está na mesa.

Só os checkpoints que **não** fecharam levam rótulo com valor. Uma noite real tem de 10 a 20 fichas aqui; com vinte rótulos, nenhum é legível — e o que o operador procura é justamente o que não fechou.

### Quatro mostradores

Fichas em jogo, rake da noite, quantos na mesa, contingências usadas. O mostrador de contingência só ganha cor quando já houve alguma: um mostrador colorido a noite inteira sinalizando zero ensina a não olhar para ele.

### Mostrador do caixa

A conta aberta em parcelas, com sinal e barra de proporção: caixa inicial, retiradas, devoluções, rake, e o caixa esperado agora. O produto pede que o operador confie num número — então o número precisa poder ser conferido à mão, sem sair da tela.

As barras são monocromáticas de propósito. Verde, âmbar e vermelho pertencem ao veredito; gastar uma dessas cores aqui, onde nada está errado, é o jeito mais rápido de ensinar o operador a ignorar cor.

### Quem está com a caixa

A mesa ordenada por exposição, do maior para o menor — não por ordem de chegada. A barra de limite conta o confirmado **mais** o que aguarda confirmação (regra N6).

## Regras que esta seção precisa respeitar

| Regra | Como aparece aqui |
|---|---|
| N8 | A diferença entre checkpoints aparece como "fichas em jogo", em tom neutro, com a explicação de que é esperada. Nunca em vermelho |
| N9 | O veredito do herói é sempre o do último checkpoint, congelado. O painel nunca inventa um veredito para "agora" |
| N14 | O dealer aparece como contexto do período, no mesmo tom dos outros. O painel não acusa ninguém |
| N6 | A barra de limite de cada jogador soma o confirmado e o que aguarda confirmação |
| N17 | O canal de cor do herói segue a faixa da diferença: registra, revisa, ou recomenda suspender |

## Estados de tela

| Estado | O que aparece |
|---|---|
| **Sem sessão** | "A noite ainda não começou", com um caminho para abrir a sessão. Nenhum número |
| **Sessão aberta, sem rake** | Herói diz que o primeiro checkpoint aparece no primeiro lançamento. Espinha só com o turno aberto |
| **Entre checkpoints** | Herói mostra o último veredito congelado, com o rodapé neutro. Espinha com o trecho hachurado no fim |
| **Logo após um rake** | Herói no canal do veredito novo. Ficha nova na espinha, sem trecho hachurado |
| **Divergência** | Herói em âmbar ou vermelho conforme a faixa, com botão para a janela. Rótulo com valor na ficha correspondente da espinha |

## Requisitos de design

- **Não é uma tela de ação.** Tudo aqui é leitura. Os únicos toques levam para outra seção
- **Legível de longe.** O veredito e os mostradores são lidos com o aparelho na bancada, não na mão
- **Uma cor por significado.** O canal do veredito é exclusivo; a ação primária e a marca usam ciano; contingência usa violeta
- **Props-based.** O painel recebe `PainelDaNoite` pronto e não importa dado nenhum
