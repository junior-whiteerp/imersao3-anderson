# Contratos de dados da interface

Estes tipos definem a forma dos dados que os componentes esperam receber via props. Eles são o **contrato do frontend** — o que os componentes precisam para desenhar.

Como você modela, guarda e busca esses dados no backend é decisão de implementação. Você pode juntar, separar ou estender estes tipos conforme a sua arquitetura.

## Entidades por seção

| Seção | Tipos principais |
|---|---|
| `painel-da-noite` | `PainelDaNoite`, `PainelSessao`, `PainelCheckpoint`, `PainelTurno`, `PainelFluxo`, `PainelJogador` |
| `sessao-e-caixa` | `Sessao`, `ResumoSessao`, `TurnoResumo`, `JogadorNaMesa` |
| `jogadores-e-mesa` | `JogadorNaMesa`, `NovoJogador`, `LugarOcupado` |
| `fichas` | `JogadorSelecionado`, `Extrato`, `LinhaExtrato` |
| `turnos-e-rake` | `TurnoAberto`, `TurnoFechado`, `Dealer`, `LancamentoRake` |
| `conciliacao-e-relatorio` | `Checkpoint`, `VereditoAtual`, `Relatorio`, `RelatorioTurno`, `RelatorioJogador`, `RelatorioRegistro` |

Cada seção traz o `types.ts` completo. Veja `overview.ts` para tudo junto.

## Uma observação sobre posições

O `painel-da-noite` recebe posições já normalizadas de 0 a 1 (`posicao`, `de`, `ate`, `agora`), em vez de minutos crus. Isso é proposital: quem sabe a hora de abertura e a hora atual é a camada de dados, não o componente. Passar minutos obrigaria o painel a conhecer o modelo de tempo do produto.

Na sua implementação, calcule assim:

```ts
const inicio = sessao.abertaEm
const fim = sessao.encerradaEm ?? agora
const vao = Math.max(fim - inicio, 1)   // sessão recém-aberta tem duração zero
const posicao = (minuto) => Math.min(Math.max((minuto - inicio) / vao, 0), 1)
```
