# Milestone 4: Jogadores e Mesa

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** Milestone 1 (Shell)

---

## Sobre esta entrega

**O que você está recebendo:**
- Telas prontas (componentes React com estilo completo)
- Requisitos de produto e especificação dos fluxos
- Tokens do design system (cores, tipografia)
- Dados de amostra mostrando a forma que os componentes esperam
- Especificação de testes focada em comportamento visível

**O seu trabalho:**
- Integrar estes componentes na sua aplicação
- Ligar os callbacks ao seu roteamento e à sua regra de negócio
- Trocar os dados de amostra por dados reais do backend
- Implementar os estados de carregando, erro e vazio

Os componentes são baseados em props — recebem dados e disparam callbacks. Como você organiza backend, camada de dados e regra de negócio é decisão sua.

⚠️ **Leia `regras/README.md` antes de começar.** As regras do caixa não são detalhe de implementação: elas são o produto. Há uma implementação de referência delas ali, com as provas que a sustentam.

---


## Objetivo

Implementar a seção **Jogadores e Mesa** — Cadastrar o jogador com nome e WhatsApp obrigatórios, adicioná-lo à mesa da sessão e encerrar a participação dele quando sair.

## O que a interface permite

- Cadastrar jogador: nome e WhatsApp obrigatórios, CPF opcional, limite e consentimento
- Reconhecer um par nome + WhatsApp já cadastrado e oferecer sentar quem já existe
- Aceitar o mesmo WhatsApp com nome diferente, após confirmação explícita
- Ver a mesa como lista (para operar) e como desenho de cima (para olhar de longe)
- Ver o uso do limite de cada jogador, contando o confirmado mais o que aguarda confirmação

## Componentes entregues

Copie de `product-plan/sections/jogadores-e-mesa/components/`:

- **`ListaDaMesa`** — A mesa como lista, com busca e o contador de contingências da sessão
- **`CartaoJogador`** — Um jogador: saldo, hora de entrada, barra de limite e marca de contingência
- **`CadastroJogador`** — O cadastro — a única tela do app sem saída de exceção
- **`MesaVisual`** — A mesa vista de cima, com os dez lugares e quem ainda está de pé

> ⚠️ **Sobre a `MesaVisual` (F13 do PRD), leia antes de implementar.**
>
> Ela é a **primeira funcionalidade a cair** se o prazo apertar — antes até do
> Painel da Noite. Ela mostra uma regra sem guardar nenhuma: tudo que ela exibe
> já existe na `ListaDaMesa`. Se o cronograma apertar, corte esta antes de
> qualquer outra coisa.
>
> **O número do lugar precisa de origem no seu dado.** `LugarOcupado.lugar` não
> pode ser o índice do array nem a ordem de chegada: se for, dois jogadores
> trocam de lugar sozinhos assim que um deles fecha a conta. `lugar` tem que
> ser **campo próprio da Participação**, gravado quando o jogador confirma a
> primeira ficha. O que decide a ocupação é a confirmação, não a entrada na
> sessão — é o critério **A26**, e é o que dá sentido à tela.

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onCadastrar(jogador)` | O formulário está completo e o operador confirma |
| `onUsarExistente(nome, whatsapp)` | O par já existe e o operador escolhe sentar quem já está cadastrado |
| `onAbrirJogador(id)` | O operador toca num jogador da mesa |
| `onSentar(lugar)` | O operador toca num lugar livre no desenho da mesa |
| `onBuscar(termo)` | O operador digita na busca |

## Fluxos esperados

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

## Testes

Veja `product-plan/sections/jogadores-e-mesa/tests.md`.

## Arquivos de referência

- `product-plan/sections/jogadores-e-mesa/README.md`
- `product-plan/sections/jogadores-e-mesa/types.ts`
- `product-plan/sections/jogadores-e-mesa/sample-data.json`
- `mesa.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular
