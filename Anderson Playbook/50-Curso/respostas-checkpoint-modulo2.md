---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: ativo
tipo: checkpoint
---

# Checkpoint — Módulo 2: Ambiente, SOPs e Políticas Operacionais

**Projeto:** StackTrack — controle de fichas em clube de pôquer

---

## 1. Verificação do ambiente do Claude Code

O diagnóstico verifica três coisas antes de qualquer geração:
**dependências instaladas**, **autenticação ativa** e **integridade do
ambiente** — se a ferramenta reconhece o projeto e não há erro
bloqueante.

Antes de gerar SOP eu preciso confirmar que:

- a autenticação está válida (sem isso a chamada falha ou retorna vazio)
- o ambiente enxerga o diretório do projeto — ou seja, o agente consegue
  **ler os arquivos do vault**, não só o texto que eu colo
- não há erro bloqueante pendente

**Por que importa:** sem esse diagnóstico, a geração pode falhar em
silêncio ou — pior — produzir output **sem o contexto do projeto**. O
resultado parece certo e é genérico. Foi exatamente o que a versão A do
meu experimento mostrou ([[ANALISE-Consistencia-A-vs-B]]): documento
fluente, plausível, e sem nada da minha operação.

No meu caso a verificação foi prática: o `setup-playbook.sh` testa
`command -v claude` antes de tentar gerar, e reporta ausência em vez de
gravar arquivo vazio.

---

## 2. Engenharia de contexto e redução de alucinação

**Engenharia de contexto** é selecionar, estruturar, versionar e manter
as fontes de informação entregues à IA. Não é "escrever um bom prompt" —
o prompt é a instrução; o contexto é o material com que ela trabalha.

**Por que reduz alucinação:** a IA preenche lacuna com a média da
internet. Se eu não digo qual é a restrição, ela inventa uma plausível.
Com contexto real — restrições, métricas, exceções — não sobra lacuna
para preencher.

**Exemplo concreto do meu projeto:** o [[PKG-Geracao-de-SOP-v2]] tem
uma seção de *Fontes rastreáveis* que aponta para 8 notas do vault
(briefing, 5 decisões, template, revisão). Quando gerei o SOP de cadastro
de jogador a partir dele, saíram passos que **nenhum modelo teria como
inventar**: verificação de dívida anterior, limite de crédito individual
e consentimento LGPD bloqueante.

A medida disso está em [[ANALISE-Consistencia-A-vs-B]]: a versão sem
pacote teve **0 menções** a "LGPD", "limite de crédito" e "dívida"; a
versão com pacote teve 8, 4 e 7.

---

## 3. Prompt genérico vs. prompt operacional

| | Genérico | Operacional |
|---|---|---|
| Exemplo | *"Gere um SOP de cadastro de jogador"* | brief + contexto + critérios + formato |
| Resultado | Documento que serve para qualquer clube | Procedimento que serve para **este** clube |
| Rubric | 1/5 | 5/5 |

Um prompt operacional contém obrigatoriamente:

1. **Brief** — quem a IA é e o que deve produzir
2. **Contexto** — processo mapeado, restrições, ferramentas, atores
3. **Critérios de aceitação** — o que faz o output ser aprovado
4. **Exemplo/formato** — o padrão esperado

Faltando qualquer um dos quatro, o output exige retrabalho. No meu
experimento a diferença entre 1/5 e 5/5 veio **só do insumo** — mesmo
modelo, mesmo processo.

---

## 4. Publicar SOP sem revisar — erros prováveis e como a rubric previne

Erros que ele provavelmente cometeu:

| Erro | Consequência |
|---|---|
| SOP genérico, sem aderência ao contexto real | Ninguém consegue executar |
| Sem owner | Fica obsoleto **em silêncio** — não era de ninguém |
| Sem versão e data | Impossível saber se o time executa a versão certa |
| Sem critério de validação | "Parece certo" vira o único teste |
| Exceções não cobertas | Quebra na primeira variação real |

**Como a rubric previne:** ela troca *"parece bom"* por *"atende o
critério C2"*. E a rubric precisa ser fechada **antes** de gerar — senão
vira justificativa do que já saiu.

**Prova no meu projeto:** apliquei a rubric aos meus 7 SOPs e eles
tiraram **2/5** ([[REV-SOPs-2026-08-11]]). Achou um defeito real: o
`SOP-Retirada-de-Fichas` declarava "Responsável: Administrador de clube"
enquanto 3 dos 6 passos eram do **jogador** e do sistema — a leitura
literal levaria o admin a assinar pelo jogador, anulando a prova.

E o mais importante: a correção foi no **template**, não nos 7 arquivos.
Editar a saída trata o sintoma; corrigir o insumo impede que o oitavo SOP
nasça com o mesmo defeito. Resultado: **5/5 nos sete**.

---

## 5. Como testar casos de borda numa árvore de decisão

Processo que usei em [[ARV-Limites-de-Autoridade]]:

1. **Listar cenários extremos e cruzados** — não só o incomum, mas a
   combinação de dois eventos normais
2. **Percorrer a árvore com cada caso** e verificar se existe nó de
   decisão claro, ou se o fluxo termina em "não sei"
3. **Registrar resultado vs. esperado** numa tabela, com veredito
4. **Aplicar os ajustes na árvore**, não no caso
5. **Validar com quem executa** — se a pessoa trava num ponto, o nó está
   incompleto

**Resultado real:** 10 casos testados → 6 corretos, 2 refinamentos e
**3 ajustes estruturais**. Dois deles eram defeitos sérios:

- **ADJ-1:** duas retiradas pendentes, cada uma dentro do limite, juntas
  estourando o teto. A regra contava só movimentações **aceitas** — as
  duas passavam. Race condition real numa mesa com pedidos simultâneos.
- **ADJ-2:** um SOP bloqueava a apuração sem validação do dealer, outro
  exigia todo rake validado para encerrar a sessão. Dealer que sai sem
  validar **travava a sessão para sempre** — deadlock entre dois
  procedimentos, cada um correto isoladamente.

O segundo só apareceu porque o caso de borda **cruzou dois SOPs**.
Testar cada procedimento sozinho nunca teria encontrado.

---

## 6. Dados sensíveis em prompts e no vault

**O risco:** dado sensível em prompt pode ser registrado em log, ficar no
histórico de sessão ou vazar se o vault não tiver controle de acesso. É
risco de compliance e de vazamento — no meu caso, sob **LGPD**, porque o
StackTrack guarda CPF, assinatura e histórico financeiro de jogadores.

**Como estruturei para evitar:**

1. **O pacote descreve estrutura, não conteúdo.** Os pacotes
   ([[PKG-Geracao-de-SOP-v2]], [[PKG-Modelo-de-Dados-v1]]) definem
   campos, regras e formatos — nenhum nome, CPF ou telefone real.
2. **Seção de compliance explícita** em cada pacote, declarando que
   nenhum dado real entra na geração e que exemplos são fictícios.
3. **Dado real fica no banco, com RLS por clube** — fora do fluxo de
   geração com IA. A [[SPEC-Modelo-de-Dados-Supabase]] isola por clube e
   exige consentimento LGPD como `not null`.
4. **A regra virou estrutura, não lembrete:** não existe jogador
   cadastrado sem `consentimento_lgpd_em`. O banco recusa.

---

# Reflexão

## R1. O que faltaria se eu entregasse o SOP hoje, sem explicar nada

Três coisas:

**Os tempos ainda são hipótese.** Vários passos do AS-IS estão marcados
`(H)` em [[BRIEF-Sessao-Poker]] — estimados por mim, não medidos. Quem
executasse não saberia se 3 minutos por recompra é meta ou chute.

**Os três ajustes da árvore ainda não estão no sistema.** ADJ-1 e ADJ-3
exigem mudança no banco. Hoje a regra está escrita mas **não é
executada** — o app ainda liberaria as duas retiradas pendentes. Regra
escrita que o sistema não impõe depende de alguém lembrar.

**Falta quem exerce o N3.** Defini três níveis de escalação, mas o N3
("administrador geral") não tem nome. Se o dono do clube estiver
envolvido na divergência, ninguém sabe para quem ligar.

**O que eu ajustaria antes de publicar:** implementar ADJ-1 e ADJ-3 no
banco e nomear o N3. Os tempos podem ficar como hipótese — desde que
marcados como tal, o que já estão.

## R2. Como manter o pacote de contexto atualizado

**Gatilho concreto, não disposição.** A atualização fica amarrada ao
**modo sombra**: depois de cada sessão de teste, atualizar os SOPs e
pacotes com o que a realidade contradisse. São ~2 sessões por mês —
cadência baixa e evento que já vai acontecer de qualquer jeito.

Três mecanismos de apoio que já estão no vault:

1. **Versionamento obrigatório** — mudou conteúdo, muda `version` e
   `updated` (regra do `README.md`). É como eu e a IA sabemos se o
   contexto está velho.
2. **Referência em vez de cópia** — os pacotes apontam para as notas com
   `[[links]]`. Mudo a fonte num lugar só; não existem duas verdades.
3. **Changelog com causa** — o [[PKG-Geracao-de-SOP-v2]] registra que a
   v2 endureceu os critérios C1–C3 **porque** a v1 reprovou 2/5. Daqui a
   três meses a razão da regra ainda está escrita.

O maior risco continua sendo eu não atualizar. Por isso o gatilho é um
evento externo, não um lembrete.

## R3. Três critérios para delegar a geração de SOP

Se eu passasse isso para alguém que nunca usou Claude Code:

**1. Usou o pacote de contexto, não um prompt solto.**
Verificável: o SOP gerado precisa citar fontes do vault. Se não
referencia nenhuma nota, foi gerado sem contexto — e vai estar vazio de
um jeito convincente.

**2. Passou 5/5 na rubric antes de me mostrar.**
C1 passos numerados · C2 responsável **por passo** · C3 critério de
conclusão por passo · C4 exceções e escalação · C5 verbo de ação. O
critério C2 é o que mais reprova, e é o que mais importa: passos de
atores diferentes na mesma tabela é o caso normal.

**3. Se falhou na rubric, corrigiu o pacote — não o texto do SOP.**
É o critério que separa quem entendeu o método de quem só entregou o
documento. Editar a saída faz o SOP passar; corrigir o insumo faz o
**próximo** SOP nascer certo.

Com esses três, eu consigo aceitar o SOP sem revisar linha a linha —
porque a revisão já aconteceu contra critério explícito, e não contra a
minha opinião.
