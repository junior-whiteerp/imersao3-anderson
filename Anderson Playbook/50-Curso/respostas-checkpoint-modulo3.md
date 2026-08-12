---
tags: [checkpoint, qa, adocao, entrega]
owner: Anderson
versão: v1.0
data: 2026-08-11
status: ativo
---

# Checkpoint Final — Módulo 3: QA, Adoção e Entrega

**Projeto:** StackTrack — controle de fichas em clube de pôquer

---

## 1. Caso de teste × leitura de revisão

Leitura de revisão é ler o documento e julgar se "faz sentido". **Caso de
teste define uma situação de entrada, os passos executados e o resultado
esperado** — e precisa ser executável por alguém que não escreveu o SOP,
com critério de aceitação verificável.

**Exemplo concreto — caso de teste para o SOP de onboarding de cliente**
(no meu playbook, `SOP-Cadastro-de-Jogador`: o onboarding do cliente é o
cadastro do jogador na mesa):

> **Situação de entrada:** cliente novo chega ao clube às 21h. Não tem
> cadastro. Traz celular com WhatsApp ativo. Quer começar a jogar com
> buy-in de R$ 500.
>
> **Passos executados:**
> 1. Responsável busca o cliente pelo WhatsApp na base — retorna "não encontrado"
> 2. Coleta nome e WhatsApp
> 3. Pergunta o CPF (opcional) — cliente recusa informar
> 4. Sistema envia o termo de consentimento LGPD ao celular do cliente
> 5. Cliente lê e aceita o termo no próprio aparelho
> 6. Dono define o limite de crédito do cliente
> 7. Sistema confirma o cadastro
> 8. Responsável lança o buy-in inicial de R$ 500
>
> **Resultado esperado:** cliente ativo na mesa, com
> `consentimento_lgpd_em` preenchido, limite individual gravado e o
> buy-in aguardando aceite.
>
> **Critérios de aceitação verificáveis:**
> - Cliente recebe o termo de consentimento no celular em até 1 minuto
>   após o passo 4
> - Cadastro **não é criado** sem o aceite do passo 5
> - Cliente apto a receber fichas em até 5 minutos da chegada
> - O executor completa os 8 passos **sem consultar ninguém além do SOP**

O último critério é o que separa caso de teste de leitura de revisão:
ele só pode ser verificado **executando com outra pessoa**. Lendo, o SOP
"faz sentido" — foi por isso que ele passou 5/5 na rubric de forma e
mesmo assim o QA encontrou falhas.

Prova disso na minha suíte: o caso B1 do [[relatorio-qa-v2]] usou
exatamente essa situação de entrada (cliente novo pedindo fichas) e
**falhou** — o SOP de cadastro estava na pasta de experimentos, não no
diretório oficial. Quem seguisse o playbook não encontraria o
procedimento. Nenhuma leitura de revisão acharia isso, porque o documento
estava correto; o que estava errado era onde ele vivia.

---

## 2. O que o checklist de QA cobre além de completude

| Dimensão | Por que importa antes de publicar |
|---|---|
| **Dados / privacidade** | O playbook toca CPF, assinatura e histórico financeiro — dado pessoal sob LGPD. Publicar sem tratar cria risco de sanção |
| **Segurança e acesso** | Sem controle por papel, compartilhar o vault expõe a remuneração do dealer e a dívida dos jogadores a quem não deveria ver |
| **Rastreabilidade** | Sem owner, versão e data, o documento fica obsoleto **em silêncio** — ninguém errou, simplesmente não era de ninguém |

**Completude de conteúdo não garante segurança operacional nem
governança.** Prova disso: meus 7 SOPs passaram **5/5 na rubric de
forma** e o QA de compliance encontrou **3 falhas** — vault sem controle
de acesso, retenção sem expurgo e ausência de procedimento de incidente.

---

## 3. "Vou mandar o link no WhatsApp"

Riscos que essa abordagem ignora:

| Risco ignorado | Consequência |
|---|---|
| **Sem owner formal** | Ninguém mantém; obsoleto em semanas |
| **Sem versão documentada** | Duas pessoas executam versões diferentes sem saber |
| **Sem treinamento** | Executor não sabe quando usar nem onde procurar |
| **Sem canal de feedback** | O erro encontrado na mesa morre na conversa |
| **Sem definição de revisão** | Não existe "quando" nem "por quem" |
| **Sem controle de acesso** | Todos veem dados sensíveis de todos |

**O que fazer no lugar:** plano de adoção com responsáveis, sessão de
alinhamento por papel, ciclo de revisão definido e critério explícito de
quando o playbook está "em uso".

No meu projeto isso virou [[adoption-plan]] (cronograma por papel, canal
de feedback com SLA de 24h, 5 critérios de sucesso) e [[governance]]
(RACI de 8 atividades, cadência mensal, 6 gatilhos de revisão
extraordinária).

E uma decisão de realidade: **ninguém vai ler o vault.** Executor de mesa
não abre Obsidian às 23h. Do vault de 30 arquivos sai **um** artefato de
campo — cartão plastificado de 1 página com os 6 passos e quando chamar
o dono.

---

## 4. Governança e seus três componentes mínimos

Governança define **quem é responsável pelo documento, como ele é
atualizado e quando**.

| Componente | No meu projeto |
|---|---|
| **Owner** | `owner:` no frontmatter de todo arquivo + RACI com R e A por atividade |
| **Ciclo de revisão** | 15 min ao fim de **cada sessão** + 30 min mensal. Gatilhos extraordinários quantitativos: furo > R$ 100, > 3 contingências, > 5 perguntas do executor |
| **Changelog** | `Histórico de mudanças` em cada artefato, com o motivo — não só o que mudou |

Sem os três, qualquer mudança de processo torna o playbook desatualizado
**sem que ninguém perceba**. É o modo de falha mais comum: não há
incidente, há erosão.

Detalhe que aprendi: a cadência precisa estar amarrada a **um evento que
já vai acontecer** — a sessão do clube. Revisão que depende de disposição
não acontece.

---

## 5. Métricas operacionais e QA

QA valida se o playbook **é executável**. Métricas validam se ele está
**gerando resultado na operação real** — não apenas se foi seguido.

**Métrica indicando que funciona:**
> "Furo de caixa não atribuído caiu de R$ 300–1.000 em metade das sessões
> para R$ 0 em 3 sessões consecutivas."

**Métrica indicando que precisa revisão:**
> "Taxa de contingência subiu para 30% das retiradas."
>
> Interpretação: o aceite voltou a ser presencial na maioria dos casos —
> ou seja, virou **teatro digital**. O critério do SOP está sendo
> contornado, e a prova voltou a ser frágil. É o problema original com
> roupa nova.

Segunda métrica de alerta, do meu dashboard:
> "Perguntas do executor por sessão continuam acima de 5 na 5ª sessão."
>
> O playbook não foi adotado — foi imposto. O SOP não está claro.

---

## 6. Riscos e automações fazem parte da entrega final

**Porque o momento de mapear é enquanto o processo está sendo documentado
e testado — o contexto está fresco.**

Riscos não documentados viram surpresa na operação. Oportunidades não
registradas se perdem quando o time muda. E quem herdar o playbook
precisa entender **o que pode dar errado** e **o que pode ser
automatizado** sem ter que redescobrir.

**Prova disso no meu projeto:** os três ajustes mais importantes
(ADJ-1 race condition no limite, ADJ-2 deadlock entre dois SOPs, ADJ-3
aceite fantasma) apareceram **durante** o teste de casos de borda. Se eu
tivesse deixado para "uma fase futura", teriam aparecido em produção,
com dinheiro real na mesa.

O mesmo vale para as automações: o invariante `Σ saldos = −rake` só foi
identificado como detector de furo **porque** eu estava mapeando o
processo. Ninguém acha isso depois, olhando o sistema pronto.

---

# Reflexão

## R1. Qual é o ponto mais frágil hoje

**Não é o conteúdo nem o QA. É o plano de adoção — e dentro dele, o
treinamento.**

O conteúdo passou 5/5 na rubric. O QA está feito e encontrou 9 falhas em
15 casos, todas com correção, owner e critério de aceitação. Mas o
**plano de adoção nunca foi testado com uma pessoa real.**

Duas das quatro dimensões de QA — **clareza** e **consistência** — só
podem ser medidas com alguém executando, e isso ainda não aconteceu.
Da minha mesa, o teto é 4 de 8: abaixo do corte de 6.

**O que eu faria diferente:** teria envolvido o responsável pelas fichas
**na escrita**, não só na validação. Escrevi 7 SOPs sozinho sobre o
trabalho de outra pessoa. O QA vai medir a distância entre o que escrevi
e o que ela faz — mas essa distância poderia não existir.

## R2. Três meses depois, playbook abandonado — sinais de governança ausente

Olhando o que foi entregue, os sinais seriam:

| Sinal | O que revela |
|---|---|
| Artefatos parados em `v0.1` e `status: rascunho` | Nunca foram promovidos — logo, nunca foram validados em uso |
| `data_revisao` vencida sem nova versão | O ciclo existia no papel e não rodou |
| Changelog sem entradas após a data de criação | Nenhuma mudança de processo chegou ao documento |
| Zero mensagens no canal de feedback | Não é ausência de problema — é ausência de uso |
| Tempos ainda marcados `(H)` | O modo sombra nunca aconteceu |
| ADJ-1 e ADJ-3 ainda não implementados | A ponte entre regra e sistema nunca foi construída |

**O ciclo que evita isso** — e que já está desenhado em
[[continuous-improvement]]:

```
Sessão → retrospectiva de 15 min → dashboard atualizado
   ↓
Métrica fora do threshold?
   ├─ SIM → revisão extraordinária → correção → sobe versão
   └─ NÃO → segue
   ↓
Fim da rodada → entregável → decisão de avançar de fase
```

O elemento crítico é o **gatilho externo**: a retrospectiva acontece ao
fim da sessão, que vai acontecer de qualquer jeito. Vault que depende de
alguém lembrar morre; vault amarrado a evento sobrevive.

## R3. ROI em cinco minutos

**Custo do problema, hoje, com dados do próprio clube:**

| Fonte | Valor |
|---|---|
| Furo de caixa não atribuído | R$ 300–1.000 em ~50% das sessões → **R$ 3.600–12.000/ano por clube** |
| Tempo em administração manual | ~2h de uma sessão de 10h — **20% da noite** |
| Crédito concedido sem ver dívida anterior | R$ 6.000/sessão de exposição, controlada só pela memória do dono |
| Sessões com divergência | **100%** |

**Na operação de 2–3 clubes: R$ 7.200 a 36.000/ano** só de furo.

**O que o playbook entrega contra isso:**

| Métrica | Baseline | Meta |
|---|---|---|
| Furo não atribuído | R$ 300–1.000 em 50% das sessões | **R$ 0** |
| Sessões com divergência | 100% | **≤ 5%** |
| Tempo de conferência do caixa | ~20 min manual | **< 2 min** |
| Janela de localização do furo | 10 horas | **≤ 30 min** |
| Sessões com histórico retido | 0% | **100%** |

**Sim, estão documentadas** — são M1 a M6 do [[BRIEF-Sessao-Poker]], com
baseline e meta, definidas antes de qualquer linha de código.

**O argumento que eu usaria com um sócio**, em uma frase:

> "O papel custa até R$ 36 mil por ano em furo que ninguém consegue
> cobrar, e o controle de crédito depende inteiramente da memória de uma
> pessoa. O playbook não reduz a inadimplência — ela já é zero. Ele
> **preserva esse zero quando a operação crescer**, e transforma um furo
> de 10 horas sem dono num alerta de 30 minutos com nome."

E uma ressalva honesta que eu faria junto: **as metas ainda não foram
provadas em campo.** O piloto em modo sombra é o que converte projeção em
evidência — e é exatamente por isso que o modo sombra roda em paralelo ao
papel, sem risco para o clube.

---

## Relacionado

- [[BRIEF-Sessao-Poker]] · [[relatorio-qa-v2]] · [[adoption-plan]]
- [[governance]] · [[continuous-improvement]] · [[plano-adocao-v1]]
- [[MOC-StackTrack]]
