# As provas

Três suítes que rodam a noite inteira pelo mesmo reducer que as telas usam, e verificam os casos de borda que custaram caro para descobrir.

| Suíte | O que cobre |
|---|---|
| `prova-simulacao.ts` | A noite completa: abertura, retiradas, rake, checkpoints, encerramento |
| `prova-graves.ts` | Rake com hora adiante do relógio, janela invertida no primeiro checkpoint, veredito congelado com ficha confirmada depois, dois lançamentos aguardando que juntos estouram o limite |
| `prova-medias.ts` | Mesmo WhatsApp com nome diferente, teto de contingência por sessão, conta encerrada que não recebe mais ficha, motivo só com espaços, rake em hora sem turno, conferência final sem janela invertida |

São scripts de nó, sem framework de teste — a intenção é que sirvam de **especificação executável** mesmo para quem for reimplementar as regras em outra linguagem.

No projeto de origem, rodam com:

```bash
npm run provas
```

Elas dependem de `../modelo.ts` e `../reducer.ts`. Se você mover os arquivos, ajuste os imports.
