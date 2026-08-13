# Testes: Sessão e Caixa

Estas especificações são **independentes de framework**. Adapte para o seu setup (Vitest, Jest, Playwright, Cypress, Testing Library).

Elas descrevem **o que** testar — comportamento visível — e não como escrever o teste.

## O que esta seção faz

Abrir a noite com o caixa inicial de fichas, acompanhar a sessão em andamento e encerrá-la — garantindo uma sessão aberta por clube e nenhum jogador na mesa no fechamento.

---

## Fluxos

### Abrir a noite

**Passos**

1. O operador conta o caixa de fichas
2. Digita o valor no campo "Caixa inicial de fichas"
3. Toca em "Abrir a noite"

**Deve acontecer**

- [ ] A sessão abre e o painel passa a acompanhar a conta
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Tentar encerrar com gente na mesa

**Passos**

1. O operador abre a seção Sessão
2. O bloco "Encerrar a noite" lista quem ainda está jogando
3. O botão "Encerrar sessão" está visível e desligado

**Deve acontecer**

- [ ] Ele sabe o que precisa resolver, não só que não pode (regra N11)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo

---

## Estados vazios

- [ ] Nenhuma sessão aberta → o formulário de abertura ocupa a tela, com o campo do caixa inicial
- [ ] Sessão anterior encerrada → uma linha informa que o relatório ficou guardado, com atalho para ele

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
