# Jogadores e Mesa

## Visão

Cadastrar o jogador com nome e WhatsApp obrigatórios, adicioná-lo à mesa da sessão e encerrar a participação dele quando sair.

## O que a interface permite

- Cadastrar jogador: nome e WhatsApp obrigatórios, CPF opcional, limite e consentimento
- Reconhecer um par nome + WhatsApp já cadastrado e oferecer sentar quem já existe
- Aceitar o mesmo WhatsApp com nome diferente, após confirmação explícita
- Ver a mesa como lista (para operar) e como desenho de cima (para olhar de longe)
- Ver o uso do limite de cada jogador, contando o confirmado mais o que aguarda confirmação

## Fluxos

### Cadastrar e sentar um jogador novo

1. O operador toca em adicionar
2. Preenche nome, WhatsApp e limite, e marca o consentimento
3. Toca em "Cadastrar e sentar"

**Resultado:** O jogador entra na sessão e aparece na mesa com saldo zero

### Tentar cadastrar sem WhatsApp

1. O operador preenche só o nome
2. Procura um jeito de seguir sem o número

**Resultado:** O botão continua desligado e **não existe nenhum botão de liberar** — é a regra N15, a única sem escalação (critério A19)

### Mesmo WhatsApp, outra pessoa

1. O operador digita um número que já pertence a outro jogador
2. A tela avisa de quem é o número e pede confirmação de que é outra pessoa
3. Ele marca a confirmação e conclui

**Resultado:** Os dois cadastros coexistem, e a lista da mesa os distingue (critérios A17 e A18)

## Estados vazios

- **Ninguém na mesa:** "A noite começa quando o primeiro jogador senta", com o botão de adicionar
- **Sem sessão aberta:** o cadastro fica desligado, com a explicação de que sem noite aberta não há mesa
- **Busca sem resultado:** "Ninguém na mesa com esse nome"

## Componentes entregues

- **`ListaDaMesa`** — A mesa como lista, com busca e o contador de contingências da sessão
- **`CartaoJogador`** — Um jogador: saldo, hora de entrada, barra de limite e marca de contingência
- **`CadastroJogador`** — O cadastro — a única tela do app sem saída de exceção
- **`MesaVisual`** — A mesa vista de cima, com os dez lugares e quem ainda está de pé

## Callbacks

| Callback | Disparado quando |
|---|---|
| `onCadastrar(jogador)` | O formulário está completo e o operador confirma |
| `onUsarExistente(nome, whatsapp)` | O par já existe e o operador escolhe sentar quem já está cadastrado |
| `onAbrirJogador(id)` | O operador toca num jogador da mesa |
| `onSentar(lugar)` | O operador toca num lugar livre no desenho da mesa |
| `onBuscar(termo)` | O operador digita na busca |

## Referência visual

- `mesa.png`

## Dados

- `types.ts` — o contrato completo
- `sample-data.json` — dados de amostra, na forma que os componentes esperam
