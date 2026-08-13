# Jogadores e Mesa

## Overview

Quem está jogando agora, e quanto cada um tem em fichas. É a tela onde o operador passa a maior parte da noite.

Aqui também mora o cadastro — a porta de entrada do produto. A regra N15 é a única do sistema sem escalação: sem WhatsApp não há cadastro, e sem cadastro não sai ficha. A tela de cadastro é, por isso, a única do app sem caminho de exceção na interface.

Esta seção tem **duas vistas da mesma mesa**. A lista serve para operar; o desenho de cima, a tela **Ao vivo**, serve para olhar de longe sem navegar. A tela Ao vivo é a funcionalidade **F13** do PRD, ratificada em 2026-08-12 pela divergência D4 — e é a primeira a cair se o prazo apertar.

## User Flows

- O operador olha a mesa e vê o nome, o tempo de mesa e quanto cada jogador tem em fichas
- Ele vê de relance quem está perto do limite, sem precisar abrir a conta de ninguém
- Chega um jogador novo: ele cadastra com nome e WhatsApp, informa o limite e marca o consentimento
- O par nome + WhatsApp já existe: o app mostra o jogador existente em vez de criar um segundo
- Mesmo WhatsApp com nome diferente: o app aceita, depois de confirmar que é outra pessoa
- Chega um jogador já cadastrado: ele busca pelo nome e adiciona à mesa
- O jogador sai: o operador abre a conta dele para contar as fichas e fechar

## UI Requirements

- Lista da mesa em cartões, com nome, hora de entrada, fichas em mão e uso do limite
- Barra de uso do limite que conta o confirmado mais o que está aguardando confirmação, conforme a regra N6
- Aviso visual discreto quando o jogador passa de 80% do limite — âmbar, nunca vermelho, porque ainda não é erro
- Busca por nome no topo, funcionando com uma mão
- Estado vazio: "Ninguém na mesa ainda" com um único botão de adicionar
- Cadastro com nome e WhatsApp obrigatórios, CPF marcado como opcional, limite e consentimento
- A tela de cadastro **não oferece nenhum botão de liberar sem WhatsApp** — não existe caminho de exceção na interface, conforme o critério A19
- Ao detectar WhatsApp repetido, pedir confirmação explícita de que é outra pessoa antes de criar
- Nomes repetidos com WhatsApp diferente são distinguidos por hora de entrada e fichas em mão

## Mesa ao vivo — a segunda vista (F13)

- Mesa desenhada de cima, com **dez lugares** em elipse. Lugar 1 embaixo no centro, seguindo no sentido horário
- **O lugar é escolhido pelo operador**, tocando numa cadeira livre. Ele é campo próprio da Participação — não a ordem de chegada nem a de confirmação. Derivar de ordem fazia todo mundo andar uma cadeira quando alguém fechava a conta
- **A cadeira fica reservada até o jogador confirmar a primeira ficha na tela girada.** Reservada desenha tracejada, sem valor e sem barra de limite, escrito "aguarda a 1ª ficha", e não aceita outra pessoa. Isso é a regra, não detalhe visual: a mesa é o mostrador da N2 — quem já reconheceu ficha e quem não
- Quem entrou na sessão e **ainda não tem cadeira** aparece separado, embaixo, em "Na sessão, ainda de pé" — é quem foi cadastrado pela aba Mesa, que não tem desenho para tocar. Tocar numa cadeira livre e escolher essa pessoa dá a cadeira a ela, sem criar participação nova. Critério **A26**
- Encerrar a conta devolve a cadeira ao pool. A participação encerrada guarda o número que teve (N13)
- Lugar ocupado mostra número, nome (quebrando em duas linhas, nunca cortado), fichas em mão e a barra de uso do limite — a mesma regra N6 da lista
- Lugar com retirada esperando confirmação recebe o canal violeta: é chrome, marca "esperando ele olhar", e **não** é estado do caixa
- Lugar livre é tocável e senta alguém que já está cadastrado
- O centro carrega o estado da noite, não um logo: turno, dealer e fichas em jogo

### A matéria da mesa

A mesa é desenhada como uma mesa de verdade, num salão de verdade — decisão do dono do processo em 2026-08-12, a partir de uma foto de referência. Cinco camadas, todas em CSS, sem imagem:

| Camada | O que é |
|---|---|
| **Carpete** | Pelo cortado: fibra escovada em duas direções, mosqueado em três frequências, manchas de uso e a poça da luminária. É ele que dá chão à mesa — sem chão, ela flutua |
| **Trilho** | Mogno envernizado. O brilho **varre** a elipse num `conic-gradient` em vez de ser uniforme: luz que não varre parece plástico pintado, não madeira polida |
| **Feltro** | Argila, com acolchoado em losangos nascido do cruzamento de dois feixes a 45°, mais grão curto por cima |
| **Cadeiras** | Encosto de couro com painel afundado e coluna por baixo, giradas de frente para o centro. **Maiores e mais claras na frente** — é o que faz dez cadeiras iguais lerem como salão e não como relógio |
| **Porta-fichas** | Rasgos recuados no trilho, um por lugar |

**A cadeira de quem está sentado tem um filete quente na costura de cima; a vazia não.** De longe, o anel de cadeiras já conta quantos lugares foram tomados, antes de o operador ler um nome.

⚠️ **O realismo vem de luz e textura, nunca de pigmento saturado.** A foto de referência tem feltro laranja forte. Reproduzi-lo em tela cheia gastaria o canal âmbar, que neste produto significa "revisar a janela" — a mesa ficaria linda e o alerta ficaria invisível. Por isso o mogno é escuro, o feltro é argila dessaturada e o carpete é carvão. **Verde, âmbar e vermelho continuam pertencendo só ao veredito e ao aviso de limite.**

**Os materiais não seguem o tema.** Uma mesa de pôquer não muda de madeira quando o operador troca para o tema claro. Madeira, couro, feltro e carpete são valores fixos; o tema controla a interface por cima — cartões, texto e canais de estado.

✅ **O número do lugar tem origem no dado** desde 2026-08-12: `Participacao.lugar`, com índice no banco garantindo um jogador por cadeira entre as contas abertas. Fecha o item 4 da divergência D4 do PRD.
