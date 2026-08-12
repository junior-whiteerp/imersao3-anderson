---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: decidido
---

# DEC-005 — Dealer é entidade global, financeiro isolado por clube

## Contexto

[[DEC-004-aceites-e-cadastro-de-dealer]] definiu cadastro permanente com
alocação por sessão, mas assumiu que o dealer pertencia a **um** clube.
Na modelagem do banco a pergunta voltou: o mesmo dealer freela trabalha
em mais de um dos clubes da operação?

**Resposta do dono do processo: sim.**

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| `dealers.clube_id` (um dealer por clube) | Modelo mais simples; RLS trivial | Mesma pessoa cadastrada 2× — WhatsApp duplicado, histórico partido, nenhum clube vê o quadro completo |
| **`dealers` global + `dealers_clubes`** | Identidade única; contato único para o link de aceite | Exige RLS mais cuidadosa para não vazar dado entre clubes |

## Decisão

**`dealers` é global**, sem `clube_id`. O vínculo vive em
`dealers_clubes` (N:N).

E uma fronteira de privacidade explícita:

> **A identidade do dealer é compartilhada entre os clubes vinculados.
> O financeiro dele, não.**

| Dado | Quem enxerga |
|---|---|
| Nome, WhatsApp, vínculo | Clubes aos quais está vinculado |
| Turnos, rake apurado, obrigações, pagamentos | **Somente o clube da sessão** |

## Motivo

Cadastro duplicado quebra exatamente o que [[DEC-004-aceites-e-cadastro-de-dealer]]
foi criado para resolver: saber quanto se deve a quem, acumulado entre
sessões. Com duas linhas para a mesma pessoa, o saldo devido fica partido
e ninguém enxerga o total.

O isolamento financeiro não é preciosismo: o Clube A não tem motivo
legítimo para ver quanto o Clube B paga ao mesmo dealer, e expor isso
azedaria a relação com a equipe — que é justamente o que o aceite de rake
foi desenhado para proteger.

## Consequências

- `dealers` perde `clube_id`; `whatsapp` vira `unique` global (é a chave
  de contato para o link de aceite)
- Nova tabela `dealers_clubes`
- RLS separada: `SELECT` na identidade via vínculo; financeiro via
  `sessao_id → clube_id`
- Nova view `v_saldo_dealer_por_clube` — responde *"o clube deve R$ 840
  ao Fulano, de 3 sessões"* sem vazar para o outro clube
- ⚠️ Regra a implementar: só alocar em turno um dealer **vinculado ao
  clube da sessão**. A FK sozinha não garante — precisa de trigger
- Se o percentual de rake diferir entre clubes, vale o do clube da
  sessão (o percentual já vive em `clubes`)

## Relacionado

- [[DEC-004-aceites-e-cadastro-de-dealer]]
- [[SPEC-Modelo-de-Dados-Supabase]]
- [[SOP-Pagamento-Diferido-ao-Dealer]]
- [[MOC-StackTrack]]
