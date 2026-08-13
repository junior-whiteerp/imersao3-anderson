# Milestone 1: Shell

> **Entregue junto:** `product-overview.md` e `regras/README.md`
> **Depende de:** nada

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

Montar os tokens do design system e o shell — a moldura fixa que envolve todas as seções.

## 1. Tokens

- `product-plan/design-system/tokens.css` — as variáveis, prontas para colar
- `product-plan/design-system/tailwind-colors.md` — **leia a regra de cor antes de qualquer tela**
- `product-plan/design-system/fonts.md` — as três famílias e o import

⚠️ **A regra de cor não é estética.** Verde, âmbar e vermelho pertencem ao veredito do caixa e a mais nada. Um botão verde já gasta o canal que devia avisar do furo. Isso vem da regra N8 do PRD.

O tema do produto vive no atributo `data-cv-tema`, não numa classe global — duas aplicações disputando a mesma classe `dark` brigam.

## 2. As regras

Antes das telas, leia `product-plan/regras/README.md` e decida: usar a implementação de referência, traduzir para a sua linguagem, ou reimplementar mantendo as provas verdes.

**A conta do checkpoint tem uma premissa que o PRD não fecha.** Está documentada em `regras/README.md`. Confirme com o dono do processo antes de codar — se ela estiver errada, muda o produto inteiro.

## 3. O shell

Copie `product-plan/shell/components/` para o seu projeto.

**Navegação** — ligue ao seu roteamento:

| Aba | Rota | Seção |
|---|---|---|
| Painel | `/painel` | Painel da Noite |
| Sessão | `/sessao` | Sessão e Caixa |
| Mesa | `/mesa` | Jogadores e Mesa |
| Ao vivo | `/ao-vivo` | Jogadores e Mesa (desenho da mesa) |
| Fichas | `/fichas` | Fichas |
| Rake | `/rake` | Turnos e Rake |
| Caixa | `/caixa` | Conciliação e Relatório |

**A faixa de estado** é a peça que faz o produto ser o que é. Ela nunca sai da tela. Alimente-a com o estado derivado das regras (`estadoDaFaixa` em `regras/modelo.ts`).

**O menu do operador** precisa de: nome, callback de tema, callback de sair, callback de encerrar sessão.

## 4. A porta de entrada

⚠️ **`Login.tsx` é uma demonstração, não autenticação.** O par usuário/senha está no código que o navegador baixa e não protege nada. O PRD deixa login fora do escopo da release 1.

Ela existe para dar um começo à demo e para desenhar o lugar onde a autenticação real vai entrar. Quando você implementar de verdade: servidor, senha com hash, sessão. A tela vira só a camada visual.

O nome digitado vira o nome do operador — o PRD manda registrar "quem lançou" em cada movimentação.

## Pronto quando

- [ ] Os tokens estão configurados e a regra de cor está entendida pelo time
- [ ] As regras do caixa estão implementadas (ou a referência está integrada) e as provas passam
- [ ] O shell desenha com a navegação ligada ao roteamento
- [ ] A faixa de estado reage ao estado real e nunca some da tela
- [ ] A faixa continua sendo região viva para leitor de tela em **todos** os estados
- [ ] O menu do operador mostra quem está operando
- [ ] Funciona no celular, com alvos de toque de 44px
