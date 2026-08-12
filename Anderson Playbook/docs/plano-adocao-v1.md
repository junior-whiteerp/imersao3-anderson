---
tags: [adocao, resistencia, compliance, entrega, stacktrack]
owner: Anderson
versão: v1.0
data: 2026-08-11
data_revisao: 2026-11-11
status: ativo
---

# Entrega do Playbook com Resistência — StackTrack

> Playbook pronto ≠ playbook adotado. Este documento trata as objeções
> reais que a operação vai levantar, e o QA de compliance que as responde.

---

# PARTE 1 — QA final de segurança, privacidade e compliance

## Contexto regulatório real

O StackTrack registra **CPF, assinatura digital e histórico financeiro**
de jogadores. Isso é dado pessoal sob **LGPD** — com sanção de até 2% do
faturamento. Some-se o fato de que clube de pôquer opera em zona
sensível: registro de dívida entre pessoas físicas, com assinatura.

## Riscos identificados

### Risco 1 — Dados pessoais sem controle de acesso 🔴

**Achado:** o vault contém limites de crédito individuais, dívidas por
jogador e remuneração de dealers. Não existe controle de acesso por
papel: compartilhar o vault é expor tudo a todos.

**Impacto concreto:** o responsável pelas fichas passaria a ver quanto o
dealer ganha e quanto cada jogador deve. Vazamento entre colegas de
trabalho é vazamento.

**Correção:**

| Documento | Quem pode ver |
|---|---|
| [[SOP-Retirada-de-Fichas]], [[SOP-Devolucao-e-Fechamento]] | Todos os executores |
| [[SOP-Cobranca-de-Jogador-Devedor]] | Só o dono do clube |
| [[SOP-Pagamento-Diferido-ao-Dealer]] | Só o dono + o dealer envolvido |
| [[BRIEF-Sessao-Poker]], [[relatorio-qa-v2]] | Só Anderson e o dono |

Do lado do sistema, a RLS de [[SPEC-Modelo-de-Dados-Supabase]] já isola
por clube — falta espelhar isso no vault.

### Risco 2 — Instruções sem owner definido 🔴

**Achado:** os SOPs têm `owner: Anderson` no frontmatter, mas o **owner
operacional** não está definido. Se uma regra estiver errada na mesa, o
executor não sabe a quem recorrer — e a falha D3 do [[relatorio-qa-v2]]
mostra que nem os papéis estão declarados.

**Correção:** matriz RACI de [[governance]] já atribui R e A por
atividade. Falta declarar em [[BRIEF-Sessao-Poker]] se responsável pelas
fichas e dono do clube são pessoas distintas (correção F4).

### Risco 3 — Ausência de critério de validade 🟠

**Achado:** os SOPs estão em `status: rascunho` e os tempos do AS-IS são
hipótese `(H)`. Não existe data de validade — um SOP de 6 meses atrás
parece tão vigente quanto um de ontem.

**Correção:** já implementada em parte — `data_revisao` e
`gatilho_revisao` no frontmatter de [[governance]] e [[adoption-plan]].
Estender a todos os SOPs e adicionar ao `README.md` a regra: **documento
sem revisão há mais de 90 dias é marcado como `suspeito` no MOC.**

### Risco 4 — Retenção declarada sem expurgo 🟠

**Achado:** `retencao_dias = 1825` existe na spec, mas nada apaga nada.
Guardar 5 anos e nunca apagar contradiz o consentimento coletado.

**Correção:** job de expurgo ou anonimização após o prazo. Já registrado
como F10 no plano de correção.

### Risco 5 — Sem procedimento de incidente 🔴

**Achado:** nenhum SOP trata vazamento, token comprometido ou acesso
indevido. Sob LGPD, existe **prazo para comunicar** incidente.

**Correção:** criar `SOP-Resposta-a-Incidente` com: o que caracteriza
incidente, quem comunica, em quanto tempo, e a quem.

---

# PARTE 2 — As objeções reais e como respondê-las

Nenhuma é técnica. Todas são de confiança.

### Objeção 1 — *"Sempre funcionou no papel. Por que mudar?"*

**Quem levanta:** responsável pelas fichas, e provavelmente o dono.

**Resposta errada:** "porque o playbook é melhor."
**Resposta certa:** o dado do próprio clube.

> "Metade das suas sessões fecha com furo de R$ 300 a R$ 1.000, e você
> nunca sabe de quem foi. Não é falha sua — é o papel que não consegue
> somar sozinho."

### Objeção 2 — *"Isso foi escrito por IA. Como sei que está certo?"*

**Resposta:** mostrar o histórico de reprovação.

> "Foi. E a primeira versão **reprovou** — tirou 2 de 5 na revisão, com
> o responsável errado em três passos. A gente corrigiu e refez. Depois
> disso, 15 casos de teste: **9 falharam**, e cada falha virou correção
> com prazo e dono."

Playbook que nunca reprovou não foi testado. O histórico em
[[relatorio-qa-v2]] é o argumento — não apesar das falhas, **por causa**
delas.

### Objeção 3 — *"E os dados dos jogadores?"*

**Resposta:** LGPD virou estrutura, não promessa.

> "Não existe jogador cadastrado sem consentimento — o banco recusa. CPF
> é opcional. Cada clube só enxerga os próprios dados. E nenhum nome real
> aparece em documento nenhum."

### Objeção 4 — *"Quem garante que isso está atualizado?"*

**Resposta:** owner nomeado, versão, data e gatilho de revisão no topo de
cada arquivo. Revisão de 15 minutos ao fim de **cada sessão**, e revisão
extraordinária automática se o furo passar de R$ 100.

### Objeção 5 — *"E se eu seguir a instrução e der problema?"*

Essa é a objeção mais legítima, e a mais fácil de responder bem.

> "Hoje, se der divergência, é a sua palavra contra a do jogador — e o
> clube cede. Com o registro, a prova responde por você. **O playbook
> protege quem executa**, não fiscaliza."

### Objeção 6 — do dealer: *"Vão me controlar?"*

> "Ao contrário. Hoje você recebe sobre um número que não pode conferir.
> Com a validação, o valor que você entregou fica registrado, e seu
> pagamento é calculado na sua frente, com histórico."

---

# PARTE 3 — Adoção incremental em 3 fases

## Fase 1 — Piloto silencioso

| Item | Definição |
|---|---|
| **Escopo** | 1 clube · só o dono usa o app · resp. fichas continua no papel |
| **Duração** | Sessões 1–2 (~1 mês) |
| **Critério de entrada** | Correções F1–F4 do [[relatorio-qa-v2]] concluídas · controle de acesso definido |
| **Critério de saída** | App não trava · caixa fecha nas 2 sessões · nenhum incidente de dados |
| **Objeção que endereça** | 2 e 3 — ninguém é obrigado a nada; o risco é do Anderson |

## Fase 2 — Expansão monitorada (modo sombra)

| Item | Definição |
|---|---|
| **Escopo** | Resp. fichas usa app **e** papel · dealers validam rake |
| **Duração** | Sessões 3–5 (~1,5 mês) |
| **Critério de entrada** | Fase 1 concluída · treinamento da S2 feito · cartão de mesa impresso |
| **Critério de saída** | D1 ≥ 95% · D3 ≤ 2 perguntas · D4 ≤ 3 min · 3 sessões com caixa fechado |
| **Objeção que endereça** | 1 e 5 — a comparação papel × app é a prova, e o papel segue como rede de segurança |

## Fase 3 — Adoção plena

| Item | Definição |
|---|---|
| **Escopo** | App é o registro oficial · papel vira backup · replicar no 2º clube |
| **Duração** | Sessões 6+ |
| **Critério de entrada** | Fase 2 concluída · rollback testado ao menos uma vez em simulação |
| **Critério de saída** | 2º clube rodando sem Anderson presente |
| **Objeção que endereça** | 4 e 6 — governança rodando e dealers já validando há 3 sessões |

> **Nenhuma fase força adoção.** Em Fase 1 e 2 o papel continua rodando —
> o custo de errar é zero. É o oposto de "vai passar a ser assim a partir
> de segunda".

---

# PARTE 4 — Governança mínima

| Elemento | Definição | Onde |
|---|---|---|
| **Owner por SOP** | Anderson (documento) · dono do clube (operação) | frontmatter + RACI |
| **Ciclo de revisão** | 15 min ao fim de cada sessão · 30 min mensal | [[governance]] |
| **Revisão extraordinária** | 6 gatilhos quantitativos (furo > R$ 100, > 3 contingências…) | [[governance]] |
| **Canal de dúvidas** | Grupo de WhatsApp "StackTrack — Operação" · SLA 24h | [[adoption-plan]] |
| **Rollback** | 8 passos, ~1h40, com critério de reativação | [[continuous-improvement]] |
| **Controle de acesso** | Por papel — SOPs sensíveis restritos | Parte 1, Risco 1 |

---

## Checklist de prontidão para entrega

- [ ] F1–F4 do [[relatorio-qa-v2]] corrigidos
- [ ] Controle de acesso por papel definido
- [ ] `SOP-Resposta-a-Incidente` criado
- [ ] `SOP-Contingencia-de-Sistema` criado
- [ ] Job de expurgo de retenção implementado
- [ ] Cartão de mesa (1 página) impresso
- [ ] Papéis declarados no briefing (resp. fichas × dono são a mesma pessoa?)

**Enquanto houver item aberto, a entrega não acontece.**

## Relacionado

- [[adoption-plan]] · [[governance]] · [[continuous-improvement]]
- [[relatorio-qa-v2]] · [[QA-Playbook-2026-08-11]] · [[MOC-StackTrack]]

## Histórico de versões

| Versão | Data | Mudança | Autor |
|---|---|---|---|
| v1.0 | 2026-08-11 | QA de compliance com 5 riscos, 6 objeções tratadas, adoção em 3 fases | Anderson |
