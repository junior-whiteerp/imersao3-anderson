# As regras do caixa

**Leia isto antes de implementar qualquer tela.**

As regras deste produto não são detalhe de implementação — elas *são* o produto. Um caderno digital bonito que não pega o furo não vale nada. Por isso a entrega inclui uma **implementação de referência** das regras, e as provas que a sustentam.

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `modelo.ts` | As entidades e os cálculos: caixa esperado, fichas em jogo, veredito, limites, turnos |
| `reducer.ts` | Cada regra do PRD que muda estado, marcada pelo número dela (N1 a N18) |
| `provas/` | Três suítes que rodam a noite inteira pelo reducer e verificam os casos de borda |

Isto é TypeScript puro, sem React e sem dependência nenhuma. Você pode:

- **Usar como está**, se o seu backend for TypeScript
- **Traduzir para a sua linguagem**, usando as provas como especificação executável
- **Ignorar e reimplementar**, desde que as provas continuem passando

## A conta que precisa fechar

⚠️ **Escrita no PRD v1.7, seção 7 — mas ainda pendente de confirmação do dono do processo.** Ela não estava no documento até a v1.6: foi decidida na construção. Se estiver errada, muda o produto inteiro.

O PRD diz que a conta é `tudo que saiu = tudo que voltou + o rake`. Mas no meio da noite os jogadores estão segurando fichas que saíram e não voltaram, então essa igualdade não pode fechar enquanto houver gente na mesa.

**A leitura adotada:** o checkpoint compara o que deveria estar **dentro da caixa de fichas** com o que está lá.

```
caixa esperada = caixa inicial
               − retiradas confirmadas
               + devoluções confirmadas
               + rake declarado

diferença      = caixa esperada − caixa contada − o que já foi registrado
```

Cada checkpoint registra apenas a falta **nova** da janela dele. É por isso que o relatório da noite soma R$ 540 mesmo quando a conferência final dá zero.

## As regras que mais custam se forem esquecidas

| Regra | O que ela evita |
|---|---|
| **N3** | O rake é atribuído pela hora em que **saiu da mesa**, não pela de digitação. Sem isso, a janela cai no dealer errado |
| **N6** | O limite conta o confirmado **mais** o que aguarda confirmação. Contar só o confirmado deixa a segunda retirada passar |
| **N7** | Encerrar a conta cancela os lançamentos que ainda aguardavam. Sem isso, o jogador confirma depois de ter ido embora |
| **N8** | Diferença com rake ainda na mesa **não é furo e não gera alerta** |
| **N9** | O veredito só aparece logo depois de um lançamento de rake. Ele é congelado, não contínuo |
| **N12** | Divergência nunca é arredondada nem apagada |
| **N15** | Sem WhatsApp não há cadastro, e sem cadastro não há ficha. **Sem escalação e sem exceção** |
| **N18** | Um lançamento aguardando **não expira por tempo** |

## Rodar as provas

As provas são scripts de nó, sem framework de teste. No projeto de origem:

```bash
npm run provas
```

Elas cobrem, entre outros: rake com hora adiante do relógio, janela invertida no primeiro checkpoint, veredito congelado com ficha confirmada depois, dois lançamentos aguardando que juntos estouram o limite, teto de contingência por sessão, rake em hora sem turno, e conferência final sem janela invertida.

## ⚠️ Pendência conhecida

Uma movimentação que teve **as duas** exceções — liberação de limite (N10) e contingência (N16) — guarda os dois motivos num campo só, juntos por " · ". É melhor do que perder um, mas não é o certo: **no produto os dois motivos precisam de campos separados**. São exceções diferentes, com autoridades diferentes, e uma auditoria vai querer filtrar por uma sem a outra.
