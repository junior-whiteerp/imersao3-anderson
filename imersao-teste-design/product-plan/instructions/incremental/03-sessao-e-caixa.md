# Milestone 3: Sessão e Caixa

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

Implementar a seção **Sessão e Caixa** — Abrir a noite com o caixa inicial de fichas, acompanhar a sessão em andamento e encerrá-la — garantindo uma sessão aberta por clube e nenhum jogador na mesa no fechamento.

## O que a interface permite

- Abrir a sessão informando o caixa inicial de fichas
- Acompanhar o tempo decorrido, retiradas, devoluções e rake da noite
- Ver a linha do tempo dos turnos, com o rake de cada um
- Encerrar a noite — bloqueado enquanto houver jogador na mesa

## Componentes entregues

Copie de `product-plan/sections/sessao-e-caixa/components/`:

- **`AbrirSessao`** — Estado vazio da seção: uma pergunta, um campo, um botão
- **`ResumoCaixa`** — O resumo da noite até agora, com o rótulo mudando conforme haja ou não rake na mesa
- **`LinhaDoTempoTurnos`** — Os turnos da noite com dealer, período e rake
- **`EncerrarSessao`** — O encerramento, com a lista de quem ainda falta sair

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onAbrir(caixaInicial)` | O operador confirma o caixa inicial e abre a noite |
| `onVerTurno(turnoId)` | O operador toca num turno da linha do tempo |
| `onEncerrar` | O operador encerra a sessão com a mesa vazia |

## Fluxos esperados

### Abrir a noite

1. O operador conta o caixa de fichas
2. Digita o valor no campo "Caixa inicial de fichas"
3. Toca em "Abrir a noite"

**Resultado:** A sessão abre e o painel passa a acompanhar a conta

### Tentar encerrar com gente na mesa

1. O operador abre a seção Sessão
2. O bloco "Encerrar a noite" lista quem ainda está jogando
3. O botão "Encerrar sessão" está visível e desligado

**Resultado:** Ele sabe o que precisa resolver, não só que não pode (regra N11)

## Estados vazios

- **Nenhuma sessão aberta:** o formulário de abertura ocupa a tela, com o campo do caixa inicial
- **Sessão anterior encerrada:** uma linha informa que o relatório ficou guardado, com atalho para ele

## Testes

Veja `product-plan/sections/sessao-e-caixa/tests.md`.

## Arquivos de referência

- `product-plan/sections/sessao-e-caixa/README.md`
- `product-plan/sections/sessao-e-caixa/types.ts`
- `product-plan/sections/sessao-e-caixa/sample-data.json`
- `sessao.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular
