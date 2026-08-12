---
tags: [qa, checklist, privacidade, segurança, stacktrack]
owner: Anderson
versão: 1.0
data: 2026-08-11
status: ativo
alvo: 7 SOPs + [[ARV-Limites-de-Autoridade]]
---

# Checklist de QA — Playbook StackTrack

Legenda: `[x]` passou · `[!]` falha encontrada · `[-]` não se aplica

## Critérios de dados

- [x] **Cada SOP especifica quais dados são necessários para executar**
  Todos têm coluna `Ferramenta` e critério por passo. `SOP-Retirada` exige
  jogador ativo, valor e limite.
- [!] **Fontes de dados estão identificadas e têm owner definido**
  Falha: o **limite de crédito** é insumo crítico de A1/A4 e não tem
  processo de definição documentado. Quem define, quando e com base em quê?
- [x] **Dados de entrada e saída descritos com formato e exemplo**
  [[SPEC-Modelo-de-Dados-Supabase]] define tipos, enums e constraints.

## Critérios de privacidade

- [x] **Nenhuma SOP contém PII em exemplos ou templates**
  Verificado: nenhum nome, CPF ou telefone real em 29 arquivos.
- [x] **Processos com dados de clientes têm instrução de anonimização**
  Os pacotes de contexto declaram compliance explícito; a geração usa
  estrutura, não conteúdo.
- [!] **Acesso a sistemas sensíveis descrito com nível de permissão**
  Falha: RLS está na spec do banco, mas **o vault não tem controle de
  acesso por papel**. Ver B1 em [[QA-Playbook-2026-08-11]].

## Critérios de segurança

- [x] **Credenciais e tokens não aparecem em nenhum documento**
  A spec guarda `token_hash`, nunca token em claro. Nenhuma senha no vault.
- [x] **Integrações externas têm instrução de autenticação segura**
  Token de uso único com expiração, validado por RPC `security definer`.
- [!] **Existe instrução do que fazer em caso de incidente ou dado exposto**
  Falha: **não existe**. Nenhum SOP trata vazamento, token comprometido
  ou acesso indevido.

## Resultado

| Categoria | Passou | Falhou |
|---|:--:|:--:|
| Dados | 2 | 1 |
| Privacidade | 2 | 1 |
| Segurança | 2 | 1 |
| **Total** | **6/9** | **3** |

**Status: BLOQUEADO para publicação.** 3 falhas, todas com correção em
[[relatorio-qa-v1]].

## Relacionado

- [[casos-de-teste-v1]] · [[relatorio-qa-v1]] · [[QA-Playbook-2026-08-11]]
- [[MOC-StackTrack]]
