# Testes: Fichas

Estas especificações são **independentes de framework**. Adapte para o seu setup (Vitest, Jest, Playwright, Cypress, Testing Library).

Elas descrevem **o que** testar — comportamento visível — e não como escrever o teste.

## O que esta seção faz

Lançar retirada com confirmação na tela girada para o jogador, registrar contingência quando ele não olha, checar o limite no ato e fechar a conta com devolução e extrato linha a linha.

---

## Fluxos

### Entregar fichas

**Passos**

1. O operador escolhe o jogador e digita o valor
2. Toca em "Girar a tela para o jogador"
3. O aparelho vai para o jogador, que lê o valor e toca em "Confirmar"

**Deve acontecer**

- [ ] A movimentação fica confirmada e a ficha pode ser entregue (regra N2)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Jogador não reconhece o valor

**Passos**

1. O jogador toca em "Não reconheço"

**Deve acontecer**

- [ ] A ficha não sai. A tela para no resultado e pede para conferir e lançar de novo — não volta ao seletor
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Jogador não olha a tela

**Passos**

1. O operador toca em "O jogador não olhou"
2. Escreve o motivo
3. Confirma a contingência

**Deve acontecer**

- [ ] A movimentação é confirmada e marcada como contingência. Da 4ª da sessão em diante, a ficha não sai (regras N16, critérios A20 e A21)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Fechar a conta

**Passos**

1. O operador conta as fichas junto com o jogador
2. Digita o total contado
3. Confere o extrato linha a linha e encerra a conta

**Deve acontecer**

- [ ] A conta fecha, e lançamentos que ainda aguardavam confirmação são cancelados (regra N7, critério A10)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo

---

## Estados vazios

- [ ] Ninguém escolhido → a lista de quem está na mesa, para escolher de quem é a ficha
- [ ] Ninguém na mesa → "Adicione um jogador antes de lançar fichas"

---

## Regras de cor que os testes precisam proteger

Estas não são estética. Elas vêm do PRD e quebram o produto se forem violadas:

- [ ] **Diferença esperada nunca aparece em vermelho.** Enquanto há rake na mesa, o tom é neutro (regra N8)
- [ ] **Nenhuma ação primária usa verde, âmbar ou vermelho.** Essas cores pertencem ao veredito do caixa
- [ ] **O nome do dealer nunca é pintado de cor de alerta**, nem no estado de furo (regra N14)

---

## Acessibilidade

- [ ] Todo elemento interativo é alcançável pelo teclado
- [ ] Todo campo de formulário tem rótulo associado
- [ ] Mensagens de erro são anunciadas por leitor de tela (`role="alert"`)
- [ ] A faixa de estado do caixa é uma região viva (`role="status"`, `aria-live="polite"`) **em todos os estados** — inclusive quando ela vira botão
- [ ] Alvo de toque mínimo de 44px

---

## Casos de borda

- [ ] Nomes longos quebram ou truncam sem vazar do contêiner
- [ ] Valores de quatro e cinco dígitos cabem sem estourar a caixa
- [ ] A transição de vazio para populado, e de volta, desenha corretamente
- [ ] Com `prefers-reduced-motion`, o layout inteiro aparece sem nenhuma animação

---

## Dados de amostra

Use `sample-data.json`, ou monte variações a partir de `types.ts`.
