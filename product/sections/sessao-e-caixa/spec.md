# Sessão e Caixa

## Overview

A seção que delimita a noite. É onde o operador abre a sessão informando o caixa inicial de fichas, acompanha o andamento durante as horas de jogo, e encerra tudo no fim.

É a primeira tela que alguém vê ao abrir o app. Quando não há sessão aberta, ela é um convite; quando há, ela é o resumo da noite até agora.

O encerramento é a ação mais perigosa do produto: uma sessão encerrada não volta atrás. Por isso ela exige que a mesa esteja vazia (regra N11) e mostra a divergência antes de confirmar, nunca depois.

## User Flows

- O operador chega, vê que não há sessão aberta, informa o caixa inicial de fichas e abre a noite
- Durante a sessão, ele volta a esta tela para ver quanto saiu, quanto voltou, quanto de rake foi recolhido e quantos jogadores ainda estão na mesa
- Ele acompanha a linha do tempo dos turnos e vê qual dealer está operando agora
- No fim da noite, ele tenta encerrar; se ainda houver jogador na mesa, o app recusa e mostra quem falta
- Com a mesa vazia, ele confirma o encerramento e o relatório da sessão fica guardado

## UI Requirements

- Estado vazio com o campo de caixa inicial em destaque e um único botão de ação
- Cronômetro da sessão em fonte mono, atualizando junto com a hora
- Resumo em quatro números: retiradas, devoluções, rake recolhido e diferença atual
- A diferença atual segue a regra de cor do shell — cinza enquanto houver rake não declarado, nunca vermelho
- Linha do tempo dos turnos, com o turno aberto destacado e os fechados em tom neutro
- Botão de encerrar sessão bloqueado enquanto houver jogador na mesa, com a lista de quem falta visível
- Ao encerrar com divergência, o valor, a janela e o turno aparecem na confirmação — o encerramento grava, não apaga
- Tudo legível em uma coluna no celular; em duas colunas a partir do tablet
