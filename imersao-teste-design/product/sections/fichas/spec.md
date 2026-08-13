# Fichas

## Overview

Onde a ficha sai e onde a ficha volta. É a seção que resolve o segundo prejuízo do clube: o jogador que assina sem conferir e contesta depois, de boa-fé.

O passo que define o produto aqui é o giro da tela. O operador digita o valor, gira o aparelho, e o jogador confirma antes de a ficha sair. A `DEC-006` rejeitou por escrito a alternativa de entregar sem confirmação — cortar essa tela devolve o problema ao clube.

Quando o jogador não olha a tela, isso não é ignorado: vira **contingência**, com motivo escrito e teto de 3 por sessão. É o único sinal de que o aceite presencial foi burlado — mesmo aparelho, mesmo dedo, não há outro rastro.

## User Flows

- O operador escolhe o jogador e digita o valor da retirada
- O valor passa do limite: o app avisa, mostra quanto excede, e oferece liberar com motivo escrito
- O operador gira a tela; o jogador vê o valor em destaque e confirma
- O jogador não reconhece o valor e recusa: a ficha não sai, e o operador lança de novo
- O jogador não olha a tela: o operador registra contingência com motivo, e o app mostra qual das 3 é aquela
- Na quarta contingência da sessão, a ficha não sai
- O jogador sai: o operador conta as fichas junto com ele, lança a devolução e mostra o extrato linha a linha antes de encerrar a conta

## UI Requirements

- Teclado numérico grande, valor em fonte mono, operável com uma mão
- Exposição do limite no momento do lançamento, com o quanto já está comprometido
- Aviso de limite excedido com o valor exato — "R$ 3.100 de R$ 3.000" — e botão de liberar que exige motivo
- Tela de confirmação com o valor em corpo grande o suficiente para ser lido de frente, do outro lado da mesa
- Dois botões na confirmação: confirmar e recusar, ambos com alvo generoso
- Link discreto de contingência na tela de confirmação, com o texto "o jogador não olhou"
- Contador de contingência visível ao registrar: "2 de 3"
- Bloqueio da quarta contingência, com a mensagem de que a ficha não sai
- Extrato de fechamento com todas as linhas — hora, tipo e valor — nunca só o total
- Devolução é sempre fechamento de conta. Não existe devolução parcial, conforme a regra N5
