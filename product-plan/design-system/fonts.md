# Tipografia

## Três famílias, três papéis

| Família | Papel | Onde |
|---|---|---|
| **Instrument Serif** | Julgamento | O veredito, os títulos de tela, o nome do jogador na tela girada |
| **Instrument Sans** | Instrução | Rótulos, botões, texto corrido |
| **Azeret Mono** | Fato | Dinheiro, hora, contagem |

O operador distingue "o que o app decidiu" de "o que o app registrou" pela forma da letra, antes de terminar de ler a palavra.

## Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

O `AppShell` já injeta esse `<link>` sozinho se ele não existir, para funcionar sem depender do `<head>` da aplicação hospedeira. Na sua implementação, prefira o `<link>` no HTML e pode remover o `useEffect`.

## Tokens

```css
@theme {
  --font-cv-display: "Instrument Serif", ui-serif, Georgia, serif;
  --font-cv-sans: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
  --font-cv-mono: "Azeret Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

## Números

Todo valor em dinheiro e toda hora usam a mono com **numerais tabulares e zero cortado**:

```css
@utility cv-num {
  font-variant-numeric: tabular-nums slashed-zero;
  letter-spacing: -0.01em;
}
```

O motivo é prático: quando o saldo muda de R$ 1.480 para R$ 1.000, os dígitos não se deslocam. Em fonte proporcional eles dançam, e o olho perde a referência.
