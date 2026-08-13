# Milestone 5: Fichas

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

Implementar a seção **Fichas** — Lançar retirada com confirmação na tela girada para o jogador, registrar contingência quando ele não olha, checar o limite no ato e fechar a conta com devolução e extrato linha a linha.

## O que a interface permite

- Lançar retirada com teclado numérico e limite exposto no ato
- Girar a tela para o jogador confirmar — em tela cheia, sem o painel do clube à vista
- Registrar contingência com motivo escrito quando o jogador não olha a tela
- Liberar acima do limite com motivo escrito e registrado
- Fechar a conta com devolução e extrato linha a linha

## Componentes entregues

Copie de `product-plan/sections/fichas/components/`:

- **`LancarRetirada`** — O lançamento, com medidor de limite e teclado numérico de alvo grande
- **`TelaConfirmacao`** — A tela girada para o jogador. Aceita `plenaTela` para ocupar o aparelho inteiro
- **`ExtratoFechamento`** — O extrato linha a linha, com a contingência marcada e o resultado da noite

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onDigitar(tecla)` | O operador toca no teclado numérico |
| `onGirarTela` | O valor está pronto e o aparelho vai para o jogador |
| `onLiberar` | O valor passa do limite e o operador abre o campo de motivo |
| `onConfirmar` | O jogador toca em "Confirmar" |
| `onRecusar` | O jogador toca em "Não reconheço" |
| `onContingencia` | O operador registra que o jogador não olhou a tela |
| `onEncerrarConta` | A devolução está contada e a conta fecha |

## Fluxos esperados

### Entregar fichas

1. O operador escolhe o jogador e digita o valor
2. Toca em "Girar a tela para o jogador"
3. O aparelho vai para o jogador, que lê o valor e toca em "Confirmar"

**Resultado:** A movimentação fica confirmada e a ficha pode ser entregue (regra N2)

### Jogador não reconhece o valor

1. O jogador toca em "Não reconheço"

**Resultado:** A ficha não sai. A tela para no resultado e pede para conferir e lançar de novo — não volta ao seletor

### Jogador não olha a tela

1. O operador toca em "O jogador não olhou"
2. Escreve o motivo
3. Confirma a contingência

**Resultado:** A movimentação é confirmada e marcada como contingência. Da 4ª da sessão em diante, a ficha não sai (regras N16, critérios A20 e A21)

### Fechar a conta

1. O operador conta as fichas junto com o jogador
2. Digita o total contado
3. Confere o extrato linha a linha e encerra a conta

**Resultado:** A conta fecha, e lançamentos que ainda aguardavam confirmação são cancelados (regra N7, critério A10)

## Estados vazios

- **Ninguém escolhido:** a lista de quem está na mesa, para escolher de quem é a ficha
- **Ninguém na mesa:** "Adicione um jogador antes de lançar fichas"

## Testes

Veja `product-plan/sections/fichas/tests.md`.

## Arquivos de referência

- `product-plan/sections/fichas/README.md`
- `product-plan/sections/fichas/types.ts`
- `product-plan/sections/fichas/sample-data.json`
- `fichas-confirmacao.png`
- `fichas-extrato.png`
- `fichas-lancar.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular
