---
owner: Anderson
version: v1.0
updated: 2026-08-11
status: decidido
---

# DEC-001 — Admin em app nativo, jogador via link web

## Contexto

Plano original: dois apps nativos (Android e iOS) para todos os perfis.
Com ~100–180h de desenvolvimento e prazo de 90 dias para o piloto, o
caminho crítico do objetivo passou a ser o desenvolvimento, não o
processo. Restrição adicional: o clube roda apenas ~2 sessões/mês, o que
limita as janelas de teste.

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| A — 2 apps nativos | Visão original intacta | ~2× esforço; piloto estoura os 90 dias |
| B — 1 nativo só | Corta dev pela metade | Metade dos jogadores fica de fora |
| **C — Admin nativo + jogador web** | Jogador não instala nada; dev do lado cliente despenca | Experiência do jogador menos "app" |

## Decisão

**Opção C.** Admin do clube usa app nativo (uma plataforma). Jogador
recebe link por WhatsApp, abre no navegador, confere o valor e assina.

## Motivo

O gargalo do processo (G1/G2 do briefing) é o aceite feito sem atenção
no calor do jogo. Exigir que o jogador instale um app **antes** de poder
aceitar adiciona fricção exatamente no ponto que precisa ser o mais leve
possível. Zero instalação é requisito de adoção, não conveniência.

Bônus: o mockup HTML já existente serve como base do lado do jogador.

## Consequências

- Autenticação **assimétrica**: admin tem conta; jogador acessa por
  **token de uso único** com expiração. Jogador não é usuário do `auth`.
- O aceite precisa registrar valor, timestamp, dispositivo e traço da
  assinatura — é o que o transforma em prova.
- App nativo do jogador fica para a fase 2, com receita validada.
- Publicação em loja deixa de bloquear o piloto do lado do jogador.

## Relacionado

- [[BRIEF-Sessao-Poker]] · restrição R3
- [[DEC-002-aceite-em-toda-movimentacao]]
- [[MOC-StackTrack]]
