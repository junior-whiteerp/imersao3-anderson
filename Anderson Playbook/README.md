# Playbook StackTrack — Vault Operacional

Base de conhecimento do controle de fichas em clube de pôquer e
especificação do app StackTrack.

**Comece por aqui:** [[MOC-StackTrack]] — o índice de tudo.

---

## Estrutura de pastas

**Vault Obsidian:** `imersao3/Anderson Playbook/` — abra esta pasta no Obsidian.

| Pasta | O que vive aqui | Prefixo dos arquivos |
|---|---|---|
| `00-MOCs/` | Mapas de conteúdo — os índices navegáveis | `MOC-` |
| `10-SOPs/` | Procedimentos operacionais padrão | `SOP-` |
| `20-Decisoes/` | Registros de decisão com contexto e consequência | `DEC-NNN-` |
| `30-Briefings/` | Contexto de negócio e mapeamentos AS-IS → TO-BE | `BRIEF-` |
| `40-Mockups/` | Telas e protótipos que alimentam a spec | — |
| `50-Curso/` | Material do curso — separado da spec do produto | — |
| `60-Contexto/` | Pacotes de contexto versionados para geração com IA | `PKG-` |
| `90-Templates/` | Modelos reutilizáveis | `template-` |

O prefixo numérico da pasta controla a ordem de leitura, não a
importância. `90` fica por último porque é ferramenta, não conteúdo.

**Nenhum arquivo fica fora de pasta**, exceto este README.

## Convenção de nomenclatura

```
<PREFIXO>-<nome-em-kebab-case>.md
```

| Exemplo | Leitura |
|---|---|
| `SOP-Retirada-de-Fichas.md` | Procedimento de retirada de fichas |
| `DEC-004-aceites-e-cadastro-de-dealer.md` | Quarta decisão registrada |
| `BRIEF-Sessao-Poker.md` | Briefing da sessão de pôquer |

Decisões são numeradas em sequência (`DEC-001`, `DEC-002`…) e **nunca
reaproveitam número**, mesmo quando revogadas. Arquivo obsoleto ganha
prefixo `_` e vai para o arquivo morto — não é apagado.

## Versionamento

Toda nota tem cabeçalho YAML:

```yaml
---
owner: quem responde pelo documento
version: v1.0
updated: AAAA-MM-DD
status: rascunho | ativo | arquivado
---
```

| Mudança | Nova versão |
|---|---|
| Correção de texto, sem mudar o procedimento | `v1.0` → `v1.1` |
| Passo, decisão ou critério alterado | `v1.0` → `v2.0` |
| Documento novo, ainda não validado na prática | `v0.1` + `status: rascunho` |

> ⚠️ **Mudou o conteúdo, mudou `version` e `updated`.** Sem isso, ninguém
> — nem a IA — sabe se o contexto está atual. É o que impede o playbook
> de apodrecer sem aviso.

## Status

| Status | Significa |
|---|---|
| `rascunho` | Escrito, ainda não validado na operação real |
| `ativo` | Em uso, validado |
| `arquivado` | Substituído. Fica para consulta histórica |
| `nao-mapeado` | Existe como stub; o processo real ainda não foi levantado |

## Como criar um documento novo

1. Copie o template correspondente de `90-Templates/`
2. Salve na pasta certa, com o prefixo certo
3. Preencha o YAML: `owner`, `version: v0.1`, `updated`, `status: rascunho`
4. **Adicione o link no [[MOC-StackTrack]]** — documento fora do MOC é
   documento que ninguém acha
5. Linke as notas relacionadas com `[[nome-do-arquivo]]`

## Como atualizar

1. Edite o conteúdo
2. Suba `version` conforme a tabela acima
3. Atualize `updated`
4. Registre a mudança no **Histórico de mudanças** ao final da nota
5. Se mudou status, atualize também a linha no MOC

## Convenções de escrita

- **SOP descreve o TO-BE** (processo com o sistema), salvo indicação contrária
- Números vindos de medição real: `(C)` de confirmado
- Números estimados: `(H)` de hipótese
- Premissas assumidas sem confirmação: `(P)`
- Lacuna conhecida: `🔴` no MOC, com o que falta descrito
