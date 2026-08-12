---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: experimento
estado: TO-BE
origem: PKG-Geracao-de-SOP-v2
---

# SOP: Cadastro de Jogador

> **Versão B do experimento.** Gerada a partir de [[PKG-Geracao-de-SOP-v2]].
> Cobre a etapa 2 do AS-IS de [[BRIEF-Sessao-Poker]].

## Objetivo

Registrar o jogador na base permanente do clube com consentimento LGPD,
limite de crédito definido e histórico de dívida visível — de forma que a
primeira retirada de fichas já ocorra com prova de aceite e decisão de
crédito informada.

## Pré-requisitos

- [ ] Sessão aberta no clube · ver [[SOP-Abertura-e-Encerramento-de-Sessao]]
- [ ] Jogador presente com celular e WhatsApp ativo

## Gatilho

Jogador chega à mesa e ainda não tem cadastro no clube — ou tem cadastro
e está retornando após sessão anterior.

## Responsáveis

| Papel | O que faz neste procedimento |
|---|---|
| Responsável pelas fichas | Coleta os dados e cadastra |
| Dono do clube | Define o limite de crédito e decide sobre devedor |
| **Jogador** | Confirma os dados e dá o consentimento LGPD |
| Sistema | Verifica dívida anterior e registra o consentimento |

## Passos

| # | Passo | Responsável | Ferramenta | Critério de conclusão |
|---|---|---|---|---|
| 1 | Buscar o jogador pelo WhatsApp na base do clube | Resp. fichas | App admin | Retorna cadastro existente ou "não encontrado" |
| 2 | Se já existe: exibir dívida, sessões em aberto e histórico | Sistema | App admin | Ficha de crédito visível antes de qualquer liberação |
| 3 | **Decidir sobre jogador devedor** (liberar, limitar ou recusar) | Dono do clube | App admin | Decisão registrada · ver [[SOP-Cobranca-de-Jogador-Devedor]] |
| 4 | Coletar nome e WhatsApp | Resp. fichas | App admin | Campos preenchidos; WhatsApp único no clube |
| 5 | Coletar CPF (opcional) | Resp. fichas | App admin | Preenchido ou explicitamente dispensado |
| 6 | Enviar o termo de consentimento LGPD ao celular do jogador | Sistema | Automático | Link entregue |
| 7 | **Ler e aceitar o termo de consentimento** | **Jogador** | Link web | `consentimento_lgpd_em` gravado |
| 8 | Definir o limite de crédito do jogador | Dono do clube | App admin | Valor gravado — individual, não padrão |
| 9 | Confirmar o cadastro | Sistema | Automático | Jogador ativo, apto a receber fichas |
| 10 | Lançar o buy-in inicial | Resp. fichas | App admin | Segue [[SOP-Retirada-de-Fichas]] a partir do passo 2 |

> ⚠️ O passo 7 é **do jogador**, no celular dele. Sem `consentimento_lgpd_em`
> o cadastro não é criado — a restrição é estrutural no banco, não um
> lembrete de processo.

## Decisões

| Se... | Então... |
|---|---|
| Jogador já cadastrado, **sem dívida** | Reativar na sessão. Pular passos 4 a 8 |
| Jogador já cadastrado, **com dívida em aberto** | Passo 3 obrigatório. Dono decide **vendo** valor, sessões e acordos vencidos |
| Jogador **recusa** o consentimento LGPD | Cadastro não é criado. Sem cadastro, não há retirada de fichas |
| Jogador **sem celular / sem internet** | Contingência: consentimento em papel assinado, digitalizado e anexado, com **justificativa registrada**. Nunca presumido |
| Jogador **não informa CPF** | Prosseguir — CPF é opcional por decisão de produto |
| WhatsApp já cadastrado para **outro nome** | Não duplicar. Conferir se é a mesma pessoa antes de criar |
| Jogador atende em **outro clube** da operação | Cadastro é **por clube**. Dívida de um clube não transita para o outro |

## Critérios de aceitação

- [ ] Nome e WhatsApp registrados, WhatsApp único no clube
- [ ] Consentimento LGPD registrado com data — ou contingência justificada
- [ ] Limite de crédito definido individualmente
- [ ] Se havia dívida: decisão do dono registrada
- [ ] Jogador apto a receber fichas com aceite

## Exceções

> ⚠️ **Nunca cadastrar sem consentimento.** O sistema guarda assinatura e
> histórico financeiro — dado pessoal sob LGPD (restrição R4 de
> [[BRIEF-Sessao-Poker]]).

> ⚠️ **Nunca usar limite padrão.** O limite varia por jogador e é a única
> defesa contra a concessão de crédito às cegas — gargalo C2 de
> [[SOP-Cobranca-de-Jogador-Devedor]].

## Relacionado

- [[BRIEF-Sessao-Poker]] · etapa 2 do AS-IS
- [[SOP-Retirada-de-Fichas]] · continuação natural
- [[SOP-Cobranca-de-Jogador-Devedor]] · gargalos C1 e C2
- [[SPEC-Modelo-de-Dados-Supabase]] · tabela `jogadores`
- [[PKG-Geracao-de-SOP-v2]]

## Histórico de mudanças

| Versão | Data | Autor | O que mudou |
|---|---|---|---|
| v1.0 | 2026-08-11 | Anderson | Criação a partir de [[PKG-Geracao-de-SOP-v2]] |
