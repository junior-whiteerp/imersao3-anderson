# Turnos e Rake

## Overview

Onde a noite ganha nome e hora. O turno diz qual dealer estava operando em cada janela; o lançamento de rake diz quanto voltou ao caixa e — o detalhe que decide tudo — **em que momento aquele dinheiro saiu da mesa**.

O lançamento de rake é também o gatilho do checkpoint. É ele que congela o veredito do caixa. Sem ele, o produto fica cego: é a hipótese H2 do PRD, e o maior risco de adoção da seção.

## User Flows

- O operador abre o primeiro turno da noite e escolhe o dealer
- O dealer entrega o rake: o operador digita o valor e confirma a hora em que ele saiu da mesa
- A hora sugerida é a atual, e o operador pode corrigir para trás quando o rake ficou parado
- A hora corrigida cai dentro de um turno já fechado: o app pede confirmação explícita antes de atribuir
- Ao salvar o rake, o checkpoint abre em seguida com o veredito do caixa
- Troca de dealer: o operador fecha o turno atual e abre o próximo, sem sobreposição
- No fim da noite, ele lança o rake final e fecha o último turno

## UI Requirements

- Duas horas visíveis e distintas no lançamento: a hora em que o rake saiu da mesa e a hora em que está sendo digitado
- A hora de saída vem preenchida com a hora atual e é editável, conforme o risco R5
- Aviso quando a hora escolhida cai em turno já fechado, com o nome do dealer daquele turno e confirmação explícita
- Impedir a abertura de turno que se sobreponha a outro, mostrando o conflito
- Cartão do turno aberto em destaque, com o cronômetro do turno e o rake acumulado nele
- Ao salvar, o checkpoint aparece imediatamente na mesma tela — o veredito é a resposta do lançamento, não uma tela separada
- Lista dos rakes da noite, com hora de saída, valor e turno atribuído
