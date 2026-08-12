---
owner: Anderson
version: v0.2
updated: 2026-08-11
status: rascunho
estado: TO-BE
---

# SOP: Conferência de Caixa (conciliação contínua)

> Estado **TO-BE**. Corresponde à etapa 11 do [[BRIEF-Sessao-Poker]] e
> corrige G4 — a detecção tardia que transforma incidente em prejuízo
> sem dono. **Esta etapa não tem tela no mockup atual.**

## Gatilho

- **Automático:** logo após cada validação de lançamento de rake
- **Manual:** a qualquer momento, pelo dono do clube
- **Obrigatório:** no encerramento da sessão

> ⚠️ **No R1 não existe validação de rake pelo dealer.** O gatilho
> automático é o **próprio lançamento** do rake — ele entra já validado.
> A validação do dealer é release 2 · [[DEC-006-aceite-presencial-no-r1]]
> e `docs/PRD.md` seção 13.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Sistema | Calcula, classifica e exibe o estado |
| Dono do clube | Interpreta o resultado e age sobre a divergência |

## O invariante

```
Σ saídas  =  Σ devoluções  +  rake

⟹   Σ (saldos dos jogadores)  =  − rake
```

Toda ficha emitida pelo clube volta — pelas mãos dos jogadores ou pelo
rake. O que os jogadores perdem, somado, é exatamente o rake recolhido.

## Passos

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Calcular `Σ saldos` de todos os jogadores da sessão | Sistema | Automático | Soma disponível |
| 2 | Comparar com `− rake validado` | Sistema | Automático | Divergência calculada |
| 3 | Classificar o resultado (ver árvore de decisão) | Sistema | Automático | Estado: `íntegro`, `rake pendente` ou `furo` |
| 4 | Exibir o estado com a linguagem correta | Sistema | App admin | Neutro se rake pendente; alerta só após validação |
| 5 | Registrar janela e dealer do turno, se houver furo | Dono do clube | App admin | Divergência registrada com intervalo e turno identificados |

## Decisões

| Situação | Estado | Como exibir |
|---|---|---|
| `Σ saldos = −rake`, logo após validação de rake | **Íntegro** | ✅ "Caixa fechado" |
| Diferença **com rake pendente** (entre lançamentos) | **Esperado** | Neutro: *"Diferença R$ X · rake não declarado desde HH:MM"* |
| Diferença **logo após** validação de rake | **Furo** 🔴 | Alerta: *"Caixa não fechou: R$ X na janela HH:MM–HH:MM"* |
| `Σ saldos > −rake` | Falta ficha | Retirada não registrada — investigar a janela |
| `Σ saldos < −rake` | Sobra ficha | Rake declarado a menos, ou devolução lançada a mais |

### As três faixas do furo — o que fazer com o número

> 🆕 **Novo na v0.2.** Antes o operador via *"faltam R$ 480"* e não sabia
> se parava a sessão ou seguia. A resposta vivia só na
> [[ARV-Limites-de-Autoridade]] A3. Agora o painel mostra a ação junto do
> valor · regra **N17** e critério **A23** do `docs/PRD.md` v1.6.

| Diferença após o checkpoint | O que o painel recomenda |
|---|---|
| Até **R$ 100** | Registrar e seguir. Ruído não para a sessão |
| **R$ 100 a R$ 500** | Revisar a janela **ainda na sessão**, com as pessoas no local |
| Acima de **R$ 500** | **Suspender novas retiradas** até apurar |

> ⚠️ **O app recomenda, não bloqueia.** A suspensão continua sendo decisão
> do operador. Bloquear sozinho criaria um jeito novo de a sessão travar —
> o mesmo erro que o ajuste **ADJ-2** da árvore corrigiu.

> ⚠️ **A linha mais frágil.** Se a divergência estiver na janela em que o
> próprio operador lançou o rake, a árvore manda apurar com um terceiro
> (N3). No R1 **não existe N3** — resta registrar e apurar depois da
> sessão, com outra pessoa.

## Regra de alerta

> ⚠️ **Nunca alertar continuamente.** Entre lançamentos de rake existe
> divergência esperada. Alerta a cada 30 min vira ruído, o admin desliga
> a notificação, e o detector de furo morre junto.
>
> Alerta só é válido **imediatamente após** uma validação de rake, quando
> as contas podem fechar.

## Critério de conclusão (encerramento da sessão)

- [ ] Todos os jogadores com conta encerrada
- [ ] Todo rake lançado e validado
- [ ] `Σ saldos = − rake` — ou divergência registrada com janela e dealer identificados
- [ ] Contagem física do caixa de fichas confere com o sistema
- [ ] Relatório da sessão gerado e persistido

## Exceções

> ⚠️ Divergência **não** acusa pessoa. O sistema aponta a janela de 30 min
> e quem estava operando. A investigação é humana. Enquadrar como controle
> de processo, não como vigilância — senão a equipe sabota a adoção.

> ⚠️ Se houver contingências (aceite presencial) na janela divergente,
> começar a investigação por elas.

## Valor demonstrável no piloto

Em modo sombra, esta é a tela que prova o produto: caixa do papel com
furo de R$ 300–1.000 ao lado do caixa do app fechado em R$ 0.

## Relacionado

- [[BRIEF-Sessao-Poker]] · etapa 11, gargalo G4, invariante
- [[ARV-Limites-de-Autoridade]] v3.5 · A3, origem das três faixas
- [[SOP-Rake-e-Turno-do-Dealer]]
- [[SOP-Devolucao-e-Fechamento]]
- [[SOP-Retirada-de-Fichas]] v0.7 · contingências a investigar primeiro
- [[MOC-StackTrack]]
- `docs/PRD.md` — Caixa Vivo, seção 7 e regras N8, N9, N17

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v0.1 | 2026-08-11 | Anderson | Criação. Conciliação contínua pelo invariante, com a regra de alerta que evita falso positivo |
| v0.2 | 2026-08-11 | Anderson | **As três faixas de divergência da [[ARV-Limites-de-Autoridade]] A3 chegam ao painel** como recomendação, não bloqueio (N17/A23 do PRD v1.6). Registrado que no R1 o gatilho automático é o lançamento do rake, não a validação do dealer — ela é release 2 |
