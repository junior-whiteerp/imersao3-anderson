---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: ativo
tipo: briefing
---

# Briefing — Ciclo do Cliente em Clube de Pôquer (StackTrack)

> **Completo e validado.** Blocos 1–8 preenchidos.
> Pendências abertas: restrições R5 (equipe) e R6 (orçamento);
> tempos do AS-IS marcados **(H)** seguem como hipótese até o modo sombra.
>
> Este documento é a especificação de origem do StackTrack. Os SOPs em
> `10-SOPs/` e as decisões em `20-Decisoes/` derivam dele.
> Índice: [[MOC-StackTrack]]

---

## 1. Processo

Controle de fichas e débito/crédito de jogadores em clube de pôquer
→ jogador recorrente com histórico acumulado de sessões, saldos
liquidados e prova de aceite de cada movimentação.

**Estrutura em camadas** (escopo = ciclo do cliente):

```
CICLO DO CLIENTE
├── Cadastro do jogador          (1x)
├── Sessão de jogo               (repete N vezes)  ◄── núcleo detalhado
│   ├── Retirada de fichas + aceite
│   ├── Fechamento da sessão
│   └── Liquidação da conta
└── Histórico acumulado
```

**Contexto de referência:** clube real; controle atual 100% em papel,
descartado após o acerto. Jogador já assina o papel a cada retirada.
Este briefing alimenta a especificação do app StackTrack (o TO-BE).

---

## 2. Problema

Toda sessão de jogo (~2/mês por clube, em 2–3 clubes reais) tem pelo
menos uma divergência sobre retirada de fichas, **porque** a entrega é
concorrente — vários jogadores pedem fichas ao mesmo tempo a um único
responsável — e o registro manual falha nos dois sentidos:

| Modo | Mecanismo | Consequência | Custo |
|---|---|---|---|
| **A — Contestação** | Retirada anotada, mas jogador assinou sem conferir (esquece que pegou; no fechamento olha só o total) | Sem prova confiável, o clube cede para não perder o cliente | Não quantificado |
| **B — Sem registro** | Responsável esquece de anotar sob pressão de pico | Furo detectado na conferência de caixa do fim da sessão, **sem atribuição possível** — irrecuperável | R$ 300–1.000 em ~metade das sessões |

**Prejuízo estimado (só Modo B):** R$ 300–1.000/mês por clube →
R$ 3.600–12.000/ano por clube → **R$ 7.200–36.000/ano na operação**.
Modo A soma por cima, em toda sessão.

Agravante estrutural: o papel é **descartado após o acerto** — nenhuma
prova ou histórico sobrevive à sessão. A assinatura existe como gesto,
mas não funciona como prova (feita sem atenção, morta com o papel).

---

## 3. Objetivo

Zerar o furo de caixa não atribuído (de R$ 300–1.000 em ~50% das
sessões para **R$ 0**) e reduzir sessões com divergência (de 100% para
**≤ 5%**) em **90 dias**, validado em piloto com 1 clube real.

> Nota de risco: o prazo de 90 dias pressupõe app rodando em piloto —
> com apps nativos separados (Android + iOS), o caminho crítico é o
> desenvolvimento, não o processo. Mitigação possível: piloto com uma
> plataforma só (a que os jogadores do clube piloto mais usam).

---

## 4. Restrições

| # | Categoria | Restrição | Impacto no playbook |
|---|---|---|---|
| R1 | Tempo / acesso | Clube roda ~2 sessões/mês; 2–3 clubes disponíveis | Máx. ~6 janelas de teste/mês. Piloto precisa aproveitar **toda** sessão → estratégia de modo sombra |
| R2 | Ferramenta | Backend fixo: **Supabase** | Modelagem, auth e storage dentro do que o Supabase oferece |
| R3 | Arquitetura | **Opção C decidida:** admin em app nativo (1 plataforma); jogador aceita via **link web** enviado por WhatsApp | Zero instalação para o jogador → adoção sem fricção. Auth assimétrica: admin com conta, jogador com token de uso único |
| R4 | Regulação | **LGPD** — CPF, assinatura e histórico financeiro são dados pessoais | Exige consentimento no cadastro, prazo de retenção definido e controle de acesso. Tensão a resolver: o valor do produto é *não descartar* o registro |
| R5 | Equipe | **(P)** Anderson sozinho, ~10h/semana | A 10h/semana, 100–180h de esforço = 10 a 18 semanas. O objetivo de 90 dias só cabe no melhor caso com admin nativo |
| R6 | Orçamento | **(P)** Custo mínimo até o piloto provar valor | Evitar serviço pago antes de receita: Supabase free tier, distribuição interna em vez de loja, envio de link sem API paga de WhatsApp |

> **(P) = premissa**, não resposta confirmada. Registrada em 2026-08-11
> para destravar o planejamento. Confirmar com o dono do playbook.
>
> ⚠️ Consequência direta: se as horas semanais reais forem menores que 10,
> o prazo de 90 dias do objetivo (bloco 3) precisa ser revisto — ou o
> escopo cortado para admin em PWA, que devolve ~6 semanas.

### Estratégia adotada para contornar R1

**Modo sombra:** nas primeiras sessões o app roda **em paralelo ao
papel**, não no lugar dele. Ao final compara-se caixa do papel vs.
caixa do app.
→ Toda sessão vira janela de teste sem risco operacional para o clube,
e a diferença encontrada vira prova de valor para o dono do clube.

### Escopo do MVP para o piloto

Somente o circuito do dinheiro:
`cadastro → retirada com aceite → fechamento → conferência de caixa`

Fase 2 (fora do piloto): mesa visual com 10 assentos, parcelamento em
cartão, dashboard do administrador geral, app nativo do jogador.

### Plano de 90 dias

| Janela | Entrega |
|---|---|
| Dias 0–30 | Modelagem Supabase + circuito do dinheiro (MVP osso) |
| Dias 30–60 | Modo sombra em 2–3 clubes (~4–6 sessões comparadas) |
| Dias 60–90 | Piloto real: app é o registro oficial, papel vira backup. Medir furo, divergências e tempo de fechamento |

---

## 4b. Atores e transações (levantado no mapeamento)

### Atores

| Ator | Tipo | Acesso | Papel |
|---|---|---|---|
| Administrador geral | Usuário | Login | Cria os clubes |
| Administrador de clube ("dono do jogo") | Usuário | Login | Lança retiradas, devoluções e rake; fecha contas |
| Jogador | Semi-usuário | **Link web por token** (sem instalar app) | Aceita/recusa e assina cada movimentação |
| **Dealer** | **Entidade rastreada** | **Sem login** | Opera a mesa; retira rake e entrega ao dono. Precisa de cadastro + registro de turno |

### Tipos de transação

| Tipo | Direção | Lançado por | Aceite |
|---|---|---|---|
| Buy-in / retirada de fichas | Clube → jogador | Admin | Jogador assina |
| Devolução de fichas ao caixa | Jogador → clube | Admin | Contagem dupla + aceite do extrato ✔ |
| Rake | Mesa → caixa do clube | Admin (recebe do dealer) | **Dealer valida o valor entregue** ✔ |
| Pagamento ao dealer | Caixa do clube → dealer | Admin | **Dealer confirma o recebimento** ✔ (diferido) |
| Acordo de dívida | Clube ↔ jogador | Admin | Jogador aceita o acordo ✔ |
| Liquidação (Pix/dinheiro/cartão) | Ambas direções | Admin | Jogador assina |

> **Princípio de design consolidado:** nenhuma movimentação de valor entra
> no sistema sem confirmação da contraparte. Vale para jogador, dealer e
> clube — sem exceção.

### Remuneração do dealer

Dealer recebe **% do rake** ao final de cada sessão; o percentual é
definido por cada dono de clube (configuração por clube).

Consequências:
- O registro de turno deixa de ser auditoria e vira **base de cálculo de
  pagamento** — passa a ser obrigatório.
- ⚠️ **Dois timestamps distintos:** `hora_retirada` (quando o rake saiu da
  mesa) e `hora_lancamento` (quando entrou no sistema). A atribuição ao
  turno usa **hora_retirada** — senão, na troca de turno, o dealer errado
  é remunerado.
- Efeito colateral positivo: pagamento transparente vira argumento de
  **retenção de dealer** — canal de adoção não previsto inicialmente.

### Invariante de integridade (detector de furo)

```
Σ saídas = Σ devoluções + rake
⟹  Σ (saldos dos jogadores) = − rake
```

| Resultado | Diagnóstico |
|---|---|
| `Σ saldos = −rake` | Sessão íntegra |
| `Σ saldos < −rake` | Rake declarado a menos |
| `Σ saldos > −rake` | Retirada não registrada |

**Cadência:** rake é retirado da mesa a cada 30–60 min e entregue ao dono,
que lança no sistema. O turno do dealer coincide com essa janela.

⚠️ **Regra de alerta:** entre lançamentos de rake existe divergência
esperada (rake acumulado não declarado). O alerta de furo só é válido
**logo após** um lançamento de rake. Alertar continuamente gera falso
positivo e faz o admin desligar a notificação.

**Ganho:** o furo deixa de ser "aconteceu em algum momento da noite" e
passa a ser localizado numa janela de 30 min, com dealer identificado.

## 5. Métricas de Sucesso

| # | Métrica | Baseline (papel) | Meta | Prazo |
|---|---|---|---|---|
| M1 | Furo de caixa não atribuído | R$ 300–1.000 em ~50% das sessões | **R$ 0** | 90 dias |
| M2 | Sessões com divergência | 100% das sessões | **≤ 5%** | 90 dias |
| M3 | Retiradas com aceite consciente (valor exibido antes de assinar) | ~0% (assinatura sem conferência) | **100%** | 90 dias |
| M4 | Tempo de conferência do caixa | ~20 min manual, ao fim da sessão | **< 2 min** (contínuo) | 90 dias |
| M5 | Sessões com histórico retido | 0% (papel descartado) | **100%** | 90 dias |
| M6 | Janela de localização do furo | sessão inteira (~5h) | **≤ 30 min** | 90 dias |

M1 e M2 são as métricas de resultado; M3–M6 são as métricas de mecanismo
(o que precisa mudar no processo para M1 e M2 acontecerem).

---

## 6. AS-IS — como funciona hoje

> Tempos **(C)** = confirmados pelo dono do processo · **(H)** = hipótese
> a validar no modo sombra.
>
> **Referência da sessão:** duração **10h (C)** · mesa de até 10 lugares ·
> número de jogadores **varia por sessão (C)** · ~2 sessões/mês por clube.

| # | Etapa | Responsável | Ferramenta | Tempo | Handoff |
|---|---|---|---|---|---|
| 1 | Abrir a sessão / montar a mesa | Dono do clube | — | 15 min **(H)** | — |
| 2 | Chegada e cadastro do jogador | Resp. fichas | Papel | 2 min **(H)** | — |
| 3 | Entrega do buy-in inicial + assinatura | Resp. fichas | Papel | 2 min **(H)** | ✋ clube → jogador |
| 4 | **Retirada adicional (recompra)** — **15×/sessão (C)** | Resp. fichas | Papel | **3 min (C)** | ✋ clube → jogador |
| 5 | Dealer retira o rake do pote | Dealer | — | a cada 30–60 min **(C)** | — |
| 6 | **Dealer entrega o rake ao dono** | Dealer | — | 2 min **(H)** | ✋ dealer → dono |
| 7 | Troca de turno do dealer | Dealer | — | 30–60 min | ✋ dealer → dealer |
| 8 | **Jogador devolve fichas ao caixa** | Resp. fichas | Papel | **5 min (C)** | ✋ jogador → clube |
| 9 | Apuração do saldo do jogador | Dono | Papel + cabeça | 3 min **(H)** | — |
| 10 | Liquidação (Pix / dinheiro / cartão) | Dono | Papel | 3–5 min **(H)** | ✋ ambas direções |
| 11 | **Conferência do caixa de fichas** | Dono | Contagem manual | **30 min (C)** | — |
| 12 | Pagamento do dealer (% do rake) | Dono | Cálculo manual | 5 min **(H)** | ✋ clube → dealer |
| 13 | **Descarte do papel** | — | Lixo | — | — |

**5 handoffs de valor**, nenhum com prova verificável. Nenhuma etapa
produz registro que sobreviva à sessão.

### Carga operacional da sessão

| Atividade | Cálculo | Tempo |
|---|---|---|
| Recompras | 15 × 3 min | 45 min |
| Devoluções | ~9 × 5 min | 45 min |
| Conferência de caixa | — | 30 min |
| **Total de administração manual de fichas** | | **~2h de uma sessão de 10h (20%)** |

⚠️ Essas 2h acontecem **durante o jogo**, sob pressão e concorrência —
é exatamente a condição que produz G1.

### Efeito da duração real (10h) sobre o modelo

| Item | Consequência |
|---|---|
| Janelas de rake | **10 a 20 por sessão** (a cada 30–60 min) |
| Turnos de dealer | Vários por sessão — ninguém opera 10h seguidas. O registro de turno passa a ser a espinha do cálculo de pagamento |
| Localização do furo | 10 a 20 checkpoints de auditoria por noite, contra **um único número** no fim de 10h no processo em papel |

---

## 7. Gargalos

| # | Etapa | Tipo | Frequência | Impacto quantitativo |
|---|---|---|---|---|
| G1 | 4 — Retirada sob concorrência | Dependência / pico | Toda sessão | Retirada não registrada → **R$ 300–1.000 em ~50% das sessões**. Irrecuperável: sem atribuição |
| G2 | 4 — Assinatura sem conferência | Retrabalho / disputa | Toda sessão | Jogador contesta de boa-fé; sem prova útil, **o clube cede** para não perder o cliente |
| G3 | 6 — Entrega do rake sem validação | Dependência | A cada 30–60 min | Dealer é pago sobre valor que **não pode conferir**; risco de erro de pagamento e de desconfiança na equipe |
| G4 | 11 — Conferência só no fim da sessão | Espera / detecção tardia | Toda sessão | Furo detectado **~5h depois**, com jogadores já ausentes → prejuízo sem dono |
| G5 | 13 — Descarte do papel | Perda de informação | Toda sessão | **Zero histórico.** Impossível auditar, cobrar depois, ou identificar padrão de perda |
| G6 | 9 — Soma manual do saldo | Retrabalho | Por jogador | Erro aritmético não detectável; jogador confere só o total, não as linhas |

**Justificativa de criticidade:** G1 é o mais crítico. G2 gera perda
visível e negociável; G1 gera perda **invisível e irrecuperável** — o
clube nem sabe de quem cobrar. G4 é o que transforma G1 de incidente
corrigível em prejuízo consumado, porque adia a detecção para depois de
todo mundo ir embora.

---

## 8. TO-BE — como deveria funcionar

| Gargalo | Mudança concreta | Métrica que melhora |
|---|---|---|
| **G1** | Registro **atômico com a entrega**: a ficha só sai após o aceite chegar ao celular do jogador. Cada pedido vira transação com fila própria — a concorrência deixa de disputar a atenção de uma pessoa | M1: R$ 300–1.000 → **R$ 0** |
| **G2** | Aceite no **celular do próprio jogador**, com valor na tela antes de assinar. Assinar sem ver deixa de ser possível | M3: ~0% → **100%**; M2: 100% → **≤ 5%** |
| **G3** | Dono lança o rake → **dealer valida o valor** por link no próprio celular. Cadeia de custódia fechada | Erro de pagamento ao dealer → **0** |
| **G4** | Conciliação **contínua** pelo invariante `Σ saldos = −rake`, verificada a cada lançamento de rake | M4: ~20 min → **< 2 min**; M6: ~5h → **≤ 30 min** |
| **G5** | Registro **persistente** com consentimento e prazo de retenção (LGPD). Histórico por jogador e por sessão | M5: 0% → **100%** |
| **G6** | Soma automática; jogador vê **extrato linha a linha** no fechamento, não só o total | Erro aritmético → **0** |

### Riscos de implementação antecipados

| Risco | Mitigação |
|---|---|
| Alerta contínuo de divergência gera falso positivo e o admin desliga a notificação | Alertar **apenas** após lançamento de rake; entre janelas, exibir a diferença como "rake pendente", em tom neutro |
| Jogador sem internet / celular no momento da retirada | Modo de contingência com aceite presencial registrado + justificativa. **Nunca** silencioso |
| App vira gargalo novo: fila para lançar ficha em horário de pico | Medir tempo da etapa 4 no modo sombra. Se piorar o tempo do papel, o piloto falhou mesmo com o caixa fechando |
| Publicação em loja atrasa o piloto | Distribuição interna (TestFlight / Play Internal Testing); jogador não instala nada (link web) |
| Resistência do dealer à validação de rake | Enquadrar como **proteção do pagamento dele**, não como controle |

### Critério de aceitação do piloto

O StackTrack só é considerado aprovado quando, em **3 sessões
consecutivas** em modo sombra:

1. O caixa do app fecha (`Σ saldos = −rake`) nas 3 sessões
2. O caixa do papel apresenta furo em pelo menos 1 delas — provando a
   diferença entre os dois métodos
3. O tempo médio da etapa 4 (retirada) **não piora** em relação ao papel
4. 100% das retiradas têm aceite registrado do jogador
