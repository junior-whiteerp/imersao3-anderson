# Cores

## A regra que atravessa o produto inteiro

> **Ciano e violeta são cor de ação e de chrome. Verde, âmbar e vermelho são cor de veredito, e de mais nada.**

Isso não é preferência estética. Vem da regra N8 do PRD: *diferença esperada nunca usa vermelho*. Enquanto o rake está na mesa a conta não fecha, e está certo que não feche. Se o app alertar nessa hora, ele alerta errado quase o tempo todo — o operador desliga a atenção, e o detector de furo morre junto.

**Um botão colorido de verde já gasta o canal.** Por isso a ação primária do app é ciano, mesmo dentro de uma tela em estado de furo.

## Escolhas

| Papel | Cor Tailwind | Onde aparece |
|---|---|---|
| **Primária** | `cyan` | Ação primária, marca, foco, o ponto de "ao vivo" |
| **Secundária** | `violet` | Chrome: contingência, turno aberto, avatar do operador |
| **Neutra** | `zinc` | Fundo, texto, filetes |

## Os canais de veredito

| Canal | Cor | Quando |
|---|---|---|
| `cv-ch-neutro` | zinc | Rake ainda na mesa. Diferença esperada |
| `cv-ch-fecha` | emerald | Checkpoint bateu |
| `cv-ch-revisar` | amber | Falta entre R$ 100 e R$ 500 |
| `cv-ch-suspender` | rose | Falta acima de R$ 500 |
| `cv-ch-limite` | amber | Aviso de crédito do jogador — dentro do cartão dele, nunca na faixa do topo |

O estado entra por **variável, não por classe de cor**. `cv-ch-*` troca `--cv-accent`, e painel, régua, brilho e número leem dela. Trocar o veredito é trocar uma classe, não dez.

## Exemplos

```html
<!-- Ação primária -->
<button class="cv-ch-live cv-btn h-12">Lançar rake</button>

<!-- Veredito -->
<section class="cv-ch-fecha cv-panel cv-accent-ring">
  <p class="cv-accent-text font-cv-display text-5xl">Caixa fechado</p>
</section>

<!-- Ação destrutiva: contorno, nunca chapa cheia -->
<button class="cv-ch-suspender cv-accent-text cv-accent-border border rounded-xl">
  Encerrar sessão
</button>
```
