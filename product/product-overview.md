# Caixa Vivo

## Description

O Caixa Vivo controla o caixa de fichas de um clube de poker durante a sessão, em vez de só no fim da noite. A cada rake lançado, o app diz se o caixa fecha — e quando não fecha, mostra o valor que falta, a janela de 30 minutos em que aconteceu e qual dealer estava no turno. É a release 1 do StackTrack: um clube, um operador, uma sessão por vez.

## Problems & Solutions

### Problem 1: O furo de caixa só aparece 5 horas depois de acontecer

Hoje a conferência é feita no fim da sessão, depois de 10 horas de jogo. Quando o furo aparece, os jogadores já foram embora e não há mais como investigar. O Caixa Vivo congela um veredito a cada lançamento de rake — de 10 a 20 checkpoints por noite — e transforma "sumiu dinheiro essa noite" em "faltam R$ 480 entre 21h05 e 21h40, no turno do João".

### Problem 2: O papel some e não deixa prova nenhuma

A anotação se perde em horário de pico e é jogada fora depois do acerto. Nenhum histórico sobrevive à sessão. O Caixa Vivo registra cada movimentação com a hora em que aconteceu e a hora em que foi digitada, e guarda o relatório completo da sessão depois de encerrada.

### Problem 3: O jogador assina sem conferir e contesta depois

Sem prova útil, o clube cede. O operador digita o valor e gira a tela para o jogador confirmar antes de a ficha sair. No fechamento, o extrato aparece linha a linha, não só o total. Quando o jogador não olha a tela, isso fica registrado como contingência — com motivo escrito e teto de 3 por sessão.

### Problem 4: Duas horas de administração manual dentro de uma sessão de 10 horas

São 20% do tempo gastos somando saldo à mão e contando fichas por 30 minutos no fim, justamente durante o jogo e sob pressão. O Caixa Vivo faz a soma sozinho e mantém o saldo de cada jogador atualizado o tempo todo.

### Problem 5: O limite de crédito de cada jogador só existe na cabeça do dono

O limite aparece na tela no momento do lançamento, já contando o que foi confirmado mais o que ainda aguarda confirmação. Passar do limite exige liberação explícita, com motivo escrito e registrado.

## Key Features

- Abrir e encerrar sessão, com caixa inicial de fichas — uma sessão aberta por clube (F1)
- Cadastro do jogador: nome e WhatsApp obrigatórios, CPF opcional, limite de crédito e consentimento (F10)
- Mesa: adicionar e encerrar jogador na sessão (F2)
- Lançar retirada com confirmação na tela girada para o jogador (F3)
- Registro de contingência quando o jogador não olha a tela — motivo escrito, teto de 3 por sessão (F11)
- Lançar devolução e fechar a conta, com extrato linha a linha (F4)
- Limite de crédito por jogador, exibido no ato do lançamento, com liberação registrada (F8)
- Turnos de dealer, sem sobreposição (F5)
- Lançar rake com a hora em que ele saiu da mesa, podendo ser retroativa (F6)
- Painel de conciliação com checkpoint a cada lançamento de rake (F7)
- Relatório da sessão, guardado depois de encerrada (F9)
- Painel da noite: a noite inteira numa tela, sem pedir ação nenhuma (F12)
- Mesa ao vivo: dez lugares, ocupados só por quem confirmou a primeira ficha (F13)

> **Ordem de corte, se o prazo apertar:** F13 cai primeiro, depois F12, depois F8.
> Depois de F8, corta-se escopo, não funcionalidade. F7, F10, F11 e a tela de
> confirmação da F3 não são cortáveis — ver a seção 8 do PRD.
