# Application Shell Specification

## Overview

O shell do Caixa Vivo é um **painel de instrumento**, não um painel administrativo. Ele existe para que o operador saiba o estado do caixa sem precisar navegar até lugar nenhum.

São duas peças fixas que envolvem todas as seções:

1. **A faixa de estado do caixa**, no topo, sempre visível. Mostra a hora, o turno e o dealer atuais, quantos jogadores estão na mesa, e o veredito do último checkpoint. Muda de tom conforme o estado, mas nunca grita quando não deve.
2. **A navegação das seções** — abas na parte de baixo no celular, barra lateral no desktop.

Antes das duas, uma terceira peça: a **porta de entrada**.

O produto é usado a noite inteira, num celular, na mesa, sob pressão. O shell é desenhado para isso: alvos de toque grandes, números em fonte mono para não dançar quando mudam, e nada que exija duas mãos.

## Marca

**StackTrack** é a plataforma; **Caixa Vivo** é a release 1. Os dois aparecem juntos porque o operador conhece a tela pelo nome dela, não pelo da plataforma — mas o topo pertence ao projeto.

O símbolo é a leitura literal do produto: uma **pilha de fichas** com um **rastro** que sobe a partir dela. A borda tracejada da ficha de cima é a mesma forma que reaparece no checkpoint, no turno aberto e no avatar do operador — a marca não é um desenho à parte, é o vocabulário do app na forma mais curta.

Na palavra, "Stack" fica em tinta comum e "Track" na cor da marca: o rastro é a parte que o produto adiciona ao que o clube já tinha.

## Entrada

**A tela de login é autenticação de verdade** — funcionalidade **F14** do PRD, ratificada em 2026-08-12 pela divergência D5. Até a v1.8 ela era uma porta de demonstração com o par usuário/senha dentro do JavaScript que o navegador baixa. Não é mais: a credencial saiu do código.

**A tela não decide quem entra.** Ela pede os dois campos, desabilita o botão enquanto a resposta não chega, e mostra o que deu errado. Quem decide é quem recebe o `onEntrar(usuario, senha)` — no produto, o Supabase Auth. É por isso que ela é o único componente do shell que devolve uma `Promise`.

**A mensagem de erro é a que veio de fora, sem tradução.** Trocar "e-mail não confirmado" por "usuário ou senha não confere" faria o operador tentar a senha a noite inteira contra um problema que não é a senha.

O nome digitado vira o nome do operador, que é o que o PRD manda registrar em cada movimentação.

⚠️ **O que a autenticação obriga a operação:** a conta do operador é criada à mão no painel do Supabase, antes da primeira sessão. Sem ela, o app não abre — não existe caminho de bypass, e isso é de propósito. E como não há modo offline, uma queda de rede que derrube a sessão devolve o operador para esta tela **no meio da noite**. Ver o risco R11 do PRD.

**O fundo é uma mesa de pôquer** — fichas, cartas e naipes desenhados em SVG — que responde ao movimento do ponteiro com paralaxe. Não há animação em laço: uma página que nunca fica parada consome bateria à toa no aparelho da mesa. Quem pediu menos movimento no sistema recebe a cena inteira, parada.

## Navigation Structure

- Painel → Painel da Noite
- Sessão → Sessão e Caixa
- Mesa → Jogadores e Mesa
- **Ao vivo → Jogadores e Mesa (a mesa desenhada de cima)**
- Fichas → Fichas
- Rake → Turnos e Rake
- Caixa → Conciliação e Relatório

São sete destinos. "Ao vivo" fica logo abaixo de "Mesa" porque é a mesma coisa vista de outro jeito: a lista serve para operar, o desenho serve para olhar de longe. Ela entrou no escopo pela ratificação da divergência **D4** do PRD, em 2026-08-12, como a funcionalidade **F13** — e é a primeira a cair se o prazo apertar.

## User Menu

Fica no canto superior direito no desktop e no topo da faixa no celular. Abre com o toque no nome do operador.

Contém:

- **Nome do operador** — o PRD registra "quem lançou" em cada movimentação, então essa identidade não é decorativa
- **Alternar tema** — claro e escuro
- **Sair** — volta para a porta de entrada
- **Encerrar sessão** — ação rara e irreversível, deliberadamente longe do dedo. Fica separada por uma linha e em tom de alerta, em contorno e não em chapa cheia: um botão vermelho sólido puxa o dedo para a ação que menos deveria acontecer por engano

Não há troca de usuário e não há níveis de permissão. A release 1 tem um operador só.

## Tema

O produto carrega o tema num atributo próprio (`data-cv-tema`), posto pelo shell — e **não** na classe `dark` do documento. O motivo é prático: a aplicação que hospeda a prévia sincroniza `dark` com a preferência do sistema e a reaplica em intervalo curto; pendurar o tema do produto ali faz os dois brigarem pela mesma classe, e o pacote exportado herdaria a briga.

**Escuro é o padrão.** É um app de madrugada: ele nasce escuro mesmo quando ninguém declara nada.

## Layout Pattern

**Celular (padrão):** faixa de estado fixa no topo, conteúdo rolando no meio, e as **sete abas** fixas na base, roláveis na horizontal quando não couberem. As abas respeitam a área segura do aparelho. Nenhuma aba é escondida no celular: o operador precisa chegar em qualquer tela com uma mão, e uma aba atrás de um menu é uma aba que ele não usa.

**Desktop:** a navegação migra para uma barra lateral de 208px à esquerda, com ícone e rótulo. A faixa de estado continua no topo, agora atravessando só a área de conteúdo. O menu do operador vai para o pé da barra lateral.

O conteúdo da seção nunca inclui navegação própria. Todo o deslocamento entre seções acontece pelo shell.

## Responsive Behavior

- **Desktop (≥ 1024px):** barra lateral fixa de 208px com rótulos. Faixa de estado no topo da área de conteúdo. Conteúdo com largura máxima confortável e respiro nas laterais.
- **Tablet (768–1023px):** barra lateral estreita, só ícones, com o rótulo aparecendo ao passar o mouse. Faixa de estado completa.
- **Celular (< 768px):** abas na base com ícone e rótulo curto. Faixa de estado compacta em duas colunas — contexto à esquerda, veredito à direita. O conteúdo ganha respiro inferior para não ficar sob as abas.

## Design Notes

### A regra de cor que atravessa todo o app

> Ciano e violeta são cor de **ação e de chrome**. Verde, âmbar e vermelho são cor de **veredito**, e de mais nada.

Na prática: um botão continua ciano mesmo dentro de uma tela em estado de furo, e a linha "Faltam R$ 480" nunca é clicável por si só. Isso vem da regra N8 do PRD — se o alerta aparecer quando não deveria, o operador desliga a atenção e o detector de furo morre junto.

O estado entra por uma variável, não por classe: `cv-ch-*` troca a cor de acento, e painel, régua, brilho e número leem dela. Trocar o veredito é trocar uma classe, não dez.

Há um quarto canal, o **limite**, também em âmbar. Ele mora dentro do cartão do jogador e nunca na faixa do topo — é aviso de crédito, não de caixa.

### Os cinco estados da faixa

| Estado | Quando | Tom |
|---|---|---|
| Sem sessão | Nenhuma sessão aberta | Cinza apagado, convite para abrir |
| Neutro | Rake ainda na mesa, diferença esperada | Cinza. **Nunca vermelho** |
| Fechado | Checkpoint bateu | Verde |
| Revisar | Falta entre R$ 100 e R$ 500 | Âmbar, com atalho para a janela |
| Furo | Falta acima de R$ 500 | Vermelho, com recomendação de suspender — **sem bloquear** |

As faixas de valor vêm da regra N17. A recomendação de suspender é recomendação: o app nunca trava a operação sozinho.

### O sistema não acusa pessoa

O nome do dealer aparece na faixa como contexto do turno, sempre no mesmo tom neutro — inclusive no estado de furo. Ele nunca é pintado de vermelho e nunca fica ao lado de um verbo de acusação. A faixa diz a janela e quem estava no turno; quem investiga é gente. Se o app parecer vigilância, a equipe sabota a adoção.

### Números em mono

Todo valor em dinheiro e toda hora usam Azeret Mono com numerais tabulares e zero cortado. O motivo é prático: quando o saldo muda de R$ 1.480 para R$ 1.000, os dígitos não se deslocam. Em fonte proporcional eles dançam, e o olho perde a referência.

### Três famílias, três papéis

| Família | Papel | Onde |
|---|---|---|
| **Instrument Serif** | Julgamento | O veredito, os títulos de tela, o nome do jogador na tela girada |
| **Instrument Sans** | Instrução | Rótulos, botões, texto corrido |
| **Azeret Mono** | Fato | Dinheiro, hora, contagem |

O operador distingue "o que o app decidiu" de "o que o app registrou" pela forma da letra, antes de terminar de ler a palavra.

### Alvos de toque

Mínimo de 44px em tudo que é tocável, porque o app é operado de pé, com uma mão, e às vezes com o celular já girado para o jogador.
