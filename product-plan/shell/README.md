# Shell do Caixa Vivo

## Visão

O shell é um **painel de instrumento**, não um painel administrativo. Ele existe para que o operador saiba o estado do caixa sem precisar navegar até lugar nenhum.

Três peças:

1. **A porta de entrada** (`Login`) — ver o aviso abaixo
2. **A faixa de estado do caixa** (`CaixaStatusBar`), no topo, sempre visível
3. **A navegação das seções** (`MainNav`) — abas na base no celular, barra lateral no desktop

## A tela de login é autenticação de verdade, e precisa de servidor

`Login.tsx` é a funcionalidade **F14** do PRD, ratificada em 2026-08-12. Até a v1.8 ela era uma porta de demonstração com o par usuário/senha dentro do código; **a credencial saiu**.

**A tela não decide quem entra.** Ela pede os dois campos, desabilita o botão enquanto a resposta não chega, e mostra o que deu errado. Quem decide é quem recebe `onEntrar(usuario, senha)` — por isso ele devolve uma `Promise`, e é o único callback do shell que devolve.

```tsx
<Login clube="Clube Paris" onEntrar={async (usuario, senha) => {
  // Lance o erro do seu provedor. A tela mostra a mensagem como ela veio.
  await seuProvedor.entrar(usuario, senha)
}} />
```

**Não traduza o erro do provedor.** Trocar "e-mail não confirmado" por "usuário ou senha não confere" faz o operador tentar a senha a noite inteira contra um problema que não é a senha.

O nome digitado vira o nome do operador — que é o que o PRD manda registrar em cada movimentação.

⚠️ **Duas consequências para a operação, que não são de interface:** a conta do operador é criada à mão no provedor antes da primeira sessão, e o app não abre sem ela — não existe caminho de bypass, de propósito. E como não há modo offline, uma queda de rede que derrube a sessão devolve o operador para esta tela **no meio da noite**.

## Componentes

| Componente | O que é |
|---|---|
| `AppShell` | O invólucro: barra lateral, faixa de estado, abas, e o dono do tema |
| `CaixaStatusBar` | A faixa de estado do caixa. A peça que faz o produto ser o que é |
| `MainNav` | A navegação, em dois formatos (`sidebar` e `bottom`) |
| `UserMenu` | O menu do operador: tema, sair, encerrar sessão |
| `TituloDeTela` | O cabeçalho padrão das telas |
| `Login` | A porta de entrada |
| `MarcaStackTrack` | Símbolo e palavra da marca |
| `FundoDePoker` | A cena de mesa atrás do login, com paralaxe |
| `navigation.ts` | A lista de seções |

## Tema

O produto carrega o tema num atributo próprio, `data-cv-tema`, posto pelo `AppShell` — **não** numa classe global do documento. Duas aplicações disputando a mesma classe `dark` brigam, e o produto exportado herdaria a briga.

**Escuro é o padrão.** É um app de madrugada.

```tsx
<AppShell temaInicial="escuro" onToggleTheme={(tema) => salvarPreferencia(tema)}>
```

## A faixa de estado

Os cinco estados, e o que cada um significa:

| Estado | Quando | Tom |
|---|---|---|
| `sem-sessao` | Nenhuma sessão aberta | Cinza apagado, convite para abrir |
| `neutro` | Rake ainda na mesa, diferença esperada | Cinza. **Nunca vermelho** |
| `fechado` | Checkpoint bateu | Verde |
| `revisar` | Falta entre R$ 100 e R$ 500 | Âmbar, com atalho para a janela |
| `furo` | Falta acima de R$ 500 | Vermelho, com recomendação de suspender — **sem bloquear** |

As faixas de valor vêm da regra N17. A recomendação de suspender é recomendação: o app nunca trava a operação sozinho.

**O sistema não acusa pessoa.** O nome do dealer aparece como contexto do turno, sempre no mesmo tom neutro — inclusive no estado de furo. Se o app parecer vigilância, a equipe sabota a adoção (regra N14).

## Como ligar

```tsx
<AppShell
  navigationItems={itens}              // com isActive pela rota atual
  user={{ name: operador }}
  status={statusDaFaixa(estado)}       // ver regras/modelo.ts → estadoDaFaixa
  onNavigate={(href) => navegar(href)}
  onStatusClick={() => navegar('/caixa')}
  onEndSession={() => navegar('/sessao')}
  onLogout={sair}
>
  {conteudoDaRota}
</AppShell>
```

## Responsivo

- **Desktop (≥ 1024px):** barra lateral de 224px com ícone e rótulo
- **Tablet (768–1023px):** barra lateral estreita, só ícones
- **Celular (< 768px):** abas na base, respeitando a área segura do aparelho

Alvo de toque mínimo de 44px em tudo que é tocável: o app é operado de pé, com uma mão, e às vezes com o celular já girado para o jogador.
