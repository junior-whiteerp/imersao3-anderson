# Testes: Turnos e Rake

Estas especificações são **independentes de framework**. Adapte para o seu setup (Vitest, Jest, Playwright, Cypress, Testing Library).

Elas descrevem **o que** testar — comportamento visível — e não como escrever o teste.

## O que esta seção faz

Abrir e trocar turno de dealer sem sobreposição, e lançar o rake com a hora em que ele saiu da mesa — inclusive retroativa — para atribuí-lo ao turno certo.

---

## Fluxos

### Lançar o rake da meia hora

**Passos**

1. O dealer entrega o rake
2. O operador digita o valor
3. Confere a hora em que ele saiu da mesa (vem preenchida com a atual)
4. Toca em "Lançar e conferir o caixa"

**Deve acontecer**

- [ ] O checkpoint abre em seguida com o veredito (critério A1: menos de 2 segundos)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Rake retroativo, com troca de turno no meio

**Passos**

1. O rake saiu da mesa às 21h05 e está sendo digitado às 21h12
2. A troca de turno aconteceu às 21h10
3. O operador corrige a hora de saída para 21h05

**Deve acontecer**

- [ ] O rake é atribuído ao dealer das 21h05, não ao das 21h12 (critério A5)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo

---

## Estados vazios

- [ ] Nenhum turno aberto → "Escolha o dealer para começar", com a lista de dealers
- [ ] Nenhum rake lançado → a lista de rakes não aparece

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
