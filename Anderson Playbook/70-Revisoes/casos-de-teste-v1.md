---
tags: [qa, checklist, privacidade, segurança, testes, sop]
owner: Anderson
versão: 1.0
data: 2026-08-11
---

# CHECKLIST DE QA — PLAYBOOK EXECUTÁVEL

Arquivo `checklist-qa-v1.md`, criado em `Anderson Playbook/70-Revisoes/`.
Executado contra a SOP **SOP-Retirada-de-Fichas**.

Legenda: `[x]` passou · `[!]` falha encontrada · `[-]` não se aplica

## CRITÉRIOS DE DADOS

- [x] Cada SOP especifica quais dados são necessários para executar o processo
      → jogador ativo, valor solicitado e limite de crédito, com critério por passo
- [!] Fontes de dados estão identificadas e têm owner definido
      → **FALHA:** `limite_credito` é insumo crítico e não tem processo de
      definição documentado — quem define, quando e com base em quê
- [x] Dados de entrada e saída estão descritos com formato e exemplo
      → tipos, enums e constraints em SPEC-Modelo-de-Dados-Supabase

## CRITÉRIOS DE PRIVACIDADE

- [x] Nenhuma SOP contém PII (nome, CPF, e-mail) em exemplos ou templates
      → verificado nos 29 arquivos do vault: nenhum dado real
- [x] Processos que envolvem dados de clientes têm instrução de anonimização
      → pacotes de contexto declaram compliance: geração usa estrutura, não conteúdo
- [!] Acesso a sistemas sensíveis está descrito com nível de permissão necessário
      → **FALHA:** RLS existe no banco, mas o vault não tem controle de acesso
      por papel. Compartilhar tudo expõe pagamento de dealer e dívida de jogadores

## CRITÉRIOS DE SEGURANÇA

- [x] Credenciais e tokens não aparecem em nenhum documento do vault
      → guarda-se `token_hash`, nunca o token em claro; nenhuma senha
- [x] SOPs que envolvem integrações externas têm instrução de autenticação segura
      → token de uso único com expiração, validado por RPC `security definer`
- [!] Existe instrução de o que fazer em caso de incidente ou dado exposto
      → **FALHA: não existe.** Nenhum SOP trata vazamento, token comprometido
      ou acesso indevido

**Resultado do checklist: 6 de 9 · 3 falhas · BLOQUEADO para publicação**

---

# SUITE DE TESTES — SOP-Retirada-de-Fichas

Arquivo `casos-de-teste-v1.md`, mesma pasta.

## CASO 01 — Fluxo principal (caminho feliz)

**Entrada:** jogador cadastrado, limite R$ 3.000, já retirou R$ 800 na
sessão, pede R$ 500, celular com internet.

**Ação esperada pela SOP:** passos 1 a 6 — selecionar jogador, lançar
R$ 500, sistema envia link, jogador confere e assina no próprio celular,
sistema registra o aceite, só então entregar as fichas.

**Resultado observado:** fluxo percorrido sem ambiguidade; cada passo tem
responsável próprio, inclusive os três que não são do responsável pelas
fichas.

**Status:** PASSOU

## CASO 02 — Dado de entrada faltando

**Entrada:** dono lança rake de R$ 400 e deixa `hora_retirada` em branco.

**Ação esperada pela SOP:** o passo 6 instrui lançar informando a hora da
retirada, porque a atribuição ao turno do dealer depende dela.

**Resultado observado:** o SOP instrui preencher mas não define o que
fazer se ficar em branco. O banco recusa por `not null` — o executor
descobre pelo erro do sistema, não pelo procedimento.

**Status:** FALHOU

## CASO 03 — Responsável indisponível

**Entrada:** 4ª contingência de aceite da sessão; regra A2 exige escalar
ao dono; o dono não responde em 5 minutos.

**Ação esperada pela SOP:** escalar N2; sem resposta do N2 as fichas não
são entregues; passados 5 minutos, escalar N3.

**Resultado observado:** o caminho existe e é rastreável, mas o N3 não
tem nome definido no playbook — o executor sabe que deve escalar e não
sabe para quem ligar.

**Status:** FALHOU

## CASO 04 — Sistema fora do ar

**Entrada:** internet do clube cai às 23h, o app não abre, restam 6
jogadores na mesa e 3 retiradas pendentes de aceite.

**Ação esperada pela SOP:** deveria existir procedimento de contingência
de sistema — registro em papel, tratamento das pendências e reconciliação
quando voltar.

**Resultado observado:** não existe nenhum procedimento. Todo o playbook
pressupõe o sistema disponível. A contingência prevista cobre o jogador
sem celular, não o clube sem sistema.

**Status:** FALHOU

## CASO 05 — Solicitação fora do escopo da SOP

**Entrada:** jogador pede R$ 500 em dinheiro emprestado, não em fichas.

**Ação esperada pela SOP:** recusar ou escalar — está fora do processo.

**Resultado observado:** nenhum SOP define o limite do escopo. As árvores
de decisão tratam variações dentro do processo, nunca pedidos fora dele.
O executor não tem instrução para dizer não.

**Status:** FALHOU

---

## Placar

```
Checklist:  6 de 9 itens   ·   3 falhas
Testes:     5 casos        ·   1 PASSOU   ·   4 FALHOU   ·   20% de aprovação
```

## Falhas com proposta de correção

| Origem | Falha | Correção | Owner | Prazo |
|---|---|---|---|---|
| Checklist · dados | `limite_credito` sem processo de definição | Documentar quem define o limite, quando e com base em quê | Anderson | próxima revisão |
| Checklist · privacidade | Vault sem controle de acesso por papel | Separar SOPs sensíveis; definir o que cada papel enxerga | Anderson | antes do piloto |
| Checklist · segurança | Sem procedimento de incidente | Criar SOP de resposta a vazamento e token comprometido | Anderson | antes do piloto |
| Caso 02 | SOP não trata campo obrigatório vazio | Linha na árvore: campo em branco → bloquear e reinformar | Anderson | próxima revisão |
| Caso 03 | N3 sem nome | Nomear quem exerce o N3 | Anderson | antes do piloto |
| Caso 04 | Sem contingência de sistema | Criar SOP-Contingencia-de-Sistema com registro em papel e reconciliação | Anderson | **crítico** |
| Caso 05 | Escopo não delimitado | Seção "fora do escopo" em cada SOP | Anderson | próxima revisão |

## Relacionado

- [[SOP-Retirada-de-Fichas]] · [[ARV-Limites-de-Autoridade]]
- [[relatorio-qa-v1]] · [[MOC-StackTrack]]
