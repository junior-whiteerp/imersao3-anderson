# Testes: Painel da Noite

Estas especificações são **independentes de framework**. Adapte para o seu setup (Vitest, Jest, Playwright, Cypress, Testing Library).

Elas descrevem **o que** testar — comportamento visível — e não como escrever o teste.

## O que esta seção faz

A tela que fica aberta. Responde, de longe e sem toque, a única pergunta que importa durante a noite: a conta está fechando?

---

## Fluxos

### Descobrir que a conta parou de fechar

**Passos**

1. O operador olha o painel entre lançamentos
2. O herói mostra o último veredito congelado, com valor e janela
3. Ele localiza na espinha a ficha com rótulo — as que fecharam não levam número
4. Ele toca na ficha e cai na Conciliação, naquela janela

**Deve acontecer**

- [ ] A investigação começa com as pessoas ainda no local, não dez horas depois
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo
### Entender por que a conta não bate agora

**Passos**

1. O operador vê "fichas em jogo R$ 5.480" no mostrador
2. Ele lê o rodapé do herói: rake não declarado desde 21h40
3. Ele vê o trecho hachurado no fim da espinha

**Deve acontecer**

- [ ] Ele entende que a diferença é esperada e não interrompe a operação
- [ ] Nenhum número na tela é calculado pelo componente — todos vêm por props
- [ ] O callback correspondente é chamado com o identificador certo

---

## Estados vazios

- [ ] Sem sessão → "A noite ainda não começou", com um caminho para abrir a sessão. Nenhum número na tela
- [ ] Sessão aberta, sem rake → o herói diz que o primeiro checkpoint aparece no primeiro lançamento
- [ ] Sessão encerrada → o painel vira porta para o relatório — não há mais nada acontecendo para ele acompanhar

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
