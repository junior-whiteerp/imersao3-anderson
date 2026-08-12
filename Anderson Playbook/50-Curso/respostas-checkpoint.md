# Checkpoint — Módulo 1: Contexto, Processo e Base de Conhecimento

**Aluno:** Anderson
**Projeto:** StackTrack — controle de fichas em clube de pôquer
**Data:** 2026-08-11

---

## 1. O que diferencia um playbook executável de um backlog de tarefas?

Dê um exemplo concreto de algo que estaria num playbook mas não num backlog.

**Resposta:**

O playbook tem as **decisões**; o backlog tem só os passos. Além das
decisões, o playbook também tem **critérios de aceitação**, **exceções**
e **métricas** — nada disso existe num backlog.

**Exemplo concreto (SOP-Cobranca-de-Jogador-Devedor):**

> "Jogador estoura o limite de crédito → bloquear nova retirada até
> liberação explícita do dono, registrada."

Isso é uma **decisão**, não um passo. Num backlog não apareceria porque
backlog lista o que fazer em sequência — não descreve como decidir
diante de uma bifurcação.

---

## 2. Quais são os elementos essenciais de um briefing de contexto reutilizável?

Por que cada um deles importa para a geração de SOPs com IA?

**Resposta:**

Elementos essenciais: **problema**, **restrições**, **métricas**,
**quem executa cada etapa** e o **contexto do negócio** (o que é a
operação, porte, modelo).

O que a IA inventa quando cada um falta:

| Se falta... | A IA inventa |
|---|---|
| **Problema** | Inventa o problema — resolve uma dor que não é a real |
| **Restrições** | Inventa o escopo. No StackTrack, teria proposto app nativo nas duas plataformas com dashboard completo, sem saber das 10h/semana nem do Supabase fixo |
| **Métricas** | Escreve os passos, mas não dá para saber se o SOP funcionou — sem baseline e meta, não existe critério de sucesso |
| **Quem executa** | SOP sem responsável — e SOP sem dono ninguém segue |
| **Contexto do negócio** | SOP genérico, que serviria para qualquer empresa |

---

## 3. Qual a diferença entre mapeamento AS-IS e TO-BE?

Por que é erro pular direto para o TO-BE sem documentar o AS-IS primeiro?

**Resposta:**

AS-IS é onde o processo está hoje; TO-BE é onde eu quero chegar.

Pular o AS-IS é **automatizar o caos** — você acaba codificando um
processo que não existe.

**Caso real:** cheguei com o mockup do StackTrack pronto e a arquitetura
decidida, pronto para modelar o Supabase. O mapeamento do AS-IS revelou
devolução de fichas (transação ausente), o dealer (ator ausente), rake
sem aceite, conferência de caixa sem tela e R$ 14.400/ano de
inadimplência invisível. Nenhum desses buracos aparecia no mockup — só
no mapa.

---

## 4. Uma fundadora cria uma pasta por SOP, sem links internos e sem MOC.

Qual problema operacional isso vai causar conforme o vault crescer?

**Resposta:**

**Rastreabilidade zero** — sem MOC e sem links, ela não saberia qual
arquivo atualizar quando o processo mudasse.

**Exemplo:** se eu mudar a cadência do rake de 30 min para 2 horas, a
mudança toca em 4 arquivos (SOP do rake, SOP de conferência de caixa,
DEC-003 e o briefing). Com os links, abro o [[MOC-StackTrack]] e vejo.
Sem eles, dependo de lembrar — e o vault vira uma pasta de documentos
no desktop, onde o desatualizado convive com o atual sem ninguém notar.

---

## 5. Por que um SOP em Markdown com metadados (owner, versão, data) é mais confiável?

**Resposta:**

**Owner** define quem mantém o documento. Sem ele, o SOP fica obsoleto
**silenciosamente** — ninguém errou, simplesmente não era de ninguém.

**Versão e data** mostram se o documento está atualizado. Sem elas, não
dá para fazer rollback, nem saber se o time executa a versão correta —
e a IA não tem como saber se o contexto que recebeu ainda vale.

Markdown com metadados também permite integração com Obsidian, Git e
Claude Code, tornando o playbook auditável e governável.

---

## 6. Rafael, COO de um SaaS B2B, quer gerar o primeiro SOP de onboarding com IA — sem briefing e sem AS-IS.

Que dois riscos concretos isso representa, e o que você recomendaria fazer antes?

**Resposta:**

**Risco 1 — SOP genérico.** Sem contexto do negócio (ICP, ferramentas,
critérios de sucesso), a IA gera um documento que serviria para qualquer
empresa — e que o time do Rafael não consegue executar.

**Risco 2 — automatizar o caos.** Sem AS-IS mapeado, o SOP pode
codificar gargalos existentes ou ignorar exceções que o time já conhece
na prática.

**Recomendação:** capturar o briefing primeiro (contexto, stakeholders,
restrições), depois mapear o AS-IS **com quem executa hoje**, definir os
critérios de sucesso do TO-BE — e só então usar IA para rascunhar o SOP.

---

# Reflexão

## R1. Três surpresas do seu AS-IS

Se você explicasse o AS-IS do controle de fichas para alguém de fora, quais
seriam as três maiores surpresas ou complexidades que a pessoa não esperaria?
Como isso muda o que precisa estar no SOP?

**Resposta:**

**1. O dealer.** Mexe em dinheiro (retira o rake do pote) mas **não é
usuário do sistema** — não tem login. Ninguém espera um ator financeiro
sem acesso. Consequência para o SOP: ele precisa ser modelado como
entidade rastreada com registro de turno, não como perfil de usuário.

**2. O rake.** Parece só "a taxa da casa", mas é **receita do clube e
folha de pagamento do dealer ao mesmo tempo**. Por isso o lançamento sem
validação era grave: o mesmo número define o faturamento e o salário de
quem trabalha na mesa.

**3. A inadimplência.** A surpresa é que o clube concede ~R$ 144.000/ano
de crédito por clube **sem nenhum registro que sobreviva à sessão** — e
mesmo assim recupera 100%. O resultado é bom, mas depende inteiramente
da memória e das relações do dono.

---

## R2. Risco de abandono do vault

Qual o maior risco de esse vault estar desatualizado ou abandonado em 90 dias?
Que decisão de estrutura ou governança você tomaria agora para reduzir isso?

**Resposta:**

O maior risco é simples: **eu não atualizar.**

**Decisão de governança:** amarrar a atualização do vault ao **modo
sombra**. Depois de cada sessão de teste, atualizar os SOPs com o que a
realidade contradisse — tempos reais, exceções que apareceram, decisões
que mudaram.

São ~2 sessões/mês: cadência baixa e gatilho concreto. Vault morre
quando atualizar depende de disposição; sobrevive quando está preso a um
evento que já vai acontecer de qualquer forma.

---

## R3. O que ainda está só na sua cabeça

Pensando em quem vai executar esses processos — dono do clube, responsável
pelas fichas, dealer — o que no briefing ou no vault ainda **não está
explícito o suficiente** para outra pessoa executar sem te perguntar?

**Resposta:**

O **limite de crédito por jogador** — varia de pessoa para pessoa e
existe apenas na minha cabeça. É o que sustenta os 0% de perda hoje, e é
exatamente o que não sobrevive a mais clubes ou à minha ausência numa
sessão.

Na mesma condição, mais dois julgamentos não escritos:

- **O critério para conceder prazo** — quanto tempo, para quem, com base
  em quê
- **O que me faz liberar ficha para um jogador que já deve**

Os três são decisões discricionárias legítimas — não precisam virar
regra automática. Mas precisam de **registro**: o sistema não decide por
mim, mas mostra o histórico antes da decisão e guarda o que foi
combinado.

