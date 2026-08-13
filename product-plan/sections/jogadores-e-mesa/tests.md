# Testes: Jogadores e Mesa

Estas especificações são **independentes de framework**. Adapte para o seu setup (Vitest, Jest, Playwright, Cypress, Testing Library).

Elas descrevem **o que** testar — comportamento visível — e não como escrever o teste.

## O que esta seção faz

Cadastrar o jogador com nome e WhatsApp obrigatórios, adicioná-lo à mesa da sessão e encerrar a participação dele quando sair.

---

## Fluxos

### Cadastrar e sentar um jogador novo

**Passos**

1. O operador toca em adicionar
2. Preenche nome, WhatsApp e limite, e marca o consentimento
3. Toca em "Cadastrar e sentar"

**Deve acontecer**

- [ ] O jogador entra na sessão e aparece na mesa com saldo zero
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Tentar cadastrar sem WhatsApp

**Passos**

1. O operador preenche só o nome
2. Procura um jeito de seguir sem o número

**Deve acontecer**

- [ ] O botão continua desligado e **não existe nenhum botão de liberar** — é a regra N15, a única sem escalação (critério A19)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Mesmo WhatsApp, outra pessoa

**Passos**

1. O operador digita um número que já pertence a outro jogador
2. A tela avisa de quem é o número e pede confirmação de que é outra pessoa
3. Ele marca a confirmação e conclui

**Deve acontecer**

- [ ] Os dois cadastros coexistem, e a lista da mesa os distingue (critérios A17 e A18)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo

---

## Estados vazios

- [ ] Ninguém na mesa → "A noite começa quando o primeiro jogador senta", com o botão de adicionar
- [ ] Sem sessão aberta → o cadastro fica desligado, com a explicação de que sem noite aberta não há mesa
- [ ] Busca sem resultado → "Ninguém na mesa com esse nome"

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
