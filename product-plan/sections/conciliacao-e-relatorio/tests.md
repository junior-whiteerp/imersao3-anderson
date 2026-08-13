# Testes: Conciliação e Relatório

Estas especificações são **independentes de framework**. Adapte para o seu setup (Vitest, Jest, Playwright, Cypress, Testing Library).

Elas descrevem **o que** testar — comportamento visível — e não como escrever o teste.

## O que esta seção faz

Mostrar o veredito do caixa a cada lançamento de rake — com valor, janela e dealer quando falta ficha — e guardar o relatório da sessão com todos os checkpoints da noite.

---

## Fluxos

### Investigar um furo

**Passos**

1. O veredito mostra "Faltam R$ 480" com a janela 20h15–21h08
2. O operador toca em "Ver os lançamentos dessa janela"
3. Ele vê os turnos que a janela atravessa

**Deve acontecer**

- [ ] Ele sabe onde olhar e quem estava operando — o app mostra a janela, não acusa pessoa (regra N14)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Abrir o relatório da noite

**Passos**

1. A sessão é encerrada
2. A seção passa a mostrar o relatório

**Deve acontecer**

- [ ] Todos os checkpoints, a conta, quem passou pela mesa e cada exceção com motivo escrito (critério A14)
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo

---

## Estados vazios

- [ ] Nenhum rake lançado → "O primeiro checkpoint aparece no primeiro lançamento"
- [ ] Sessão ainda aberta → o relatório não existe. A tela mostra a conciliação ao vivo

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
