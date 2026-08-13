# Milestone 6: Turnos e Rake

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

Implementar a seção **Turnos e Rake** — Abrir e trocar turno de dealer sem sobreposição, e lançar o rake com a hora em que ele saiu da mesa — inclusive retroativa — para atribuí-lo ao turno certo.

## O que a interface permite

- Abrir turno escolhendo o dealer, e trocar de dealer sem sobreposição
- Lançar o rake com duas horas visíveis e separadas: a de saída e a de digitação
- Ver a qual turno o rake será atribuído, antes de confirmar
- Ser avisado quando a hora escolhida cai num turno já fechado

## Componentes entregues

Copie de `product-plan/sections/turnos-e-rake/components/`:

- **`TurnoEmAberto`** — O turno rodando agora, com o rake acumulado e os botões de troca
- **`LancarRake`** — O lançamento que dispara o checkpoint, com as duas horas lado a lado
- **`ListaDeRakes`** — Os rakes da noite, com barra de proporção e a hora digitada quando difere

## Callbacks a ligar

| Callback | Disparado quando |
|---|---|
| `onAbrirTurno(dealerId)` | O operador escolhe o dealer do primeiro turno |
| `onTrocarDealer(dealerId)` | O operador passa o turno para outro dealer |
| `onDigitarValor(valor)` | O operador digita o valor do rake |
| `onMudarHora(hora)` | O operador corrige a hora em que o rake saiu da mesa |
| `onLancar` | O rake é lançado e o checkpoint abre em seguida |

## Fluxos esperados

### Lançar o rake da meia hora

1. O dealer entrega o rake
2. O operador digita o valor
3. Confere a hora em que ele saiu da mesa (vem preenchida com a atual)
4. Toca em "Lançar e conferir o caixa"

**Resultado:** O checkpoint abre em seguida com o veredito (critério A1: menos de 2 segundos)

### Rake retroativo, com troca de turno no meio

1. O rake saiu da mesa às 21h05 e está sendo digitado às 21h12
2. A troca de turno aconteceu às 21h10
3. O operador corrige a hora de saída para 21h05

**Resultado:** O rake é atribuído ao dealer das 21h05, não ao das 21h12 (critério A5)

## Estados vazios

- **Nenhum turno aberto:** "Escolha o dealer para começar", com a lista de dealers
- **Nenhum rake lançado:** a lista de rakes não aparece

## Testes

Veja `product-plan/sections/turnos-e-rake/tests.md`.

## Arquivos de referência

- `product-plan/sections/turnos-e-rake/README.md`
- `product-plan/sections/turnos-e-rake/types.ts`
- `product-plan/sections/turnos-e-rake/sample-data.json`
- `rake.png`

## Pronto quando

- [ ] Os componentes desenham com dados reais
- [ ] Os estados vazios aparecem quando não há registro
- [ ] Todos os callbacks estão ligados a funcionalidade que funciona
- [ ] O operador completa os fluxos acima de ponta a ponta
- [ ] As regras de cor do PRD continuam valendo (ver `tests.md`)
- [ ] Funciona no celular
