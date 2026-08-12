/**
 * O modelo de uma noite no Caixa Vivo.
 *
 * Tudo aqui e calculado, nunca fixo. Se um numero aparece na tela, ele saiu
 * das movimentacoes registradas — e por isso a simulacao nao consegue mentir.
 *
 * Horas sao guardadas em minutos desde a meia-noite do dia em que a sessao
 * abriu, e podem passar de 1440: uma sessao que comeca as 19h e vai ate as 3h
 * da manha termina no minuto 1620. So viram texto na hora de exibir.
 */

// ─── Tempo ────────────────────────────────────────────────────────────────

/** Minutos desde a meia-noite do dia de abertura. Pode passar de 1440. */
export type Minutos = number

/** Le "21h47" como minutos dentro de um dia. Nao conhece a virada. */
export function paraMinutos(hora: string): Minutos {
  const [h, m] = hora.split('h')
  return Number(h) * 60 + Number(m || 0)
}

/**
 * Le uma hora digitada e a ancora no dia certo, tomando `agora` como
 * referencia.
 *
 * Sem isso, uma sessao que atravessa a meia-noite quebra: as 00h30 o app
 * mostra "00h30", e reler esse texto devolveria o minuto 30 — antes de todos
 * os turnos da noite. O rake nasceria orfao de turno.
 */
export function paraMinutosPertoDe(agora: Minutos, hora: string): Minutos {
  const base = Math.floor(agora / 1440) * 1440
  let minuto = base + paraMinutos(hora)
  // A hora digitada e sempre proxima de agora — no maximo meio dia de distancia.
  if (minuto - agora > 720) minuto -= 1440
  if (agora - minuto > 720) minuto += 1440
  return minuto
}

export function formatarHora(minutos: Minutos): string {
  const h = Math.floor(minutos / 60) % 24
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`
}

/** "2h47" — duracao, nao horario. */
export function formatarDuracao(minutos: Minutos): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`
}

export function reais(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// ─── Entidades ────────────────────────────────────────────────────────────

export interface Jogador {
  id: string
  /** Metade da identidade. A outra metade e o WhatsApp. */
  nome: string
  /** Obrigatorio. Regra N15: sem WhatsApp nao ha cadastro. */
  whatsapp: string
  cpf?: string
  limite: number
}

export interface Participacao {
  id: string
  /** A sessao a que esta participacao pertence. O PRD define isso na entidade. */
  sessaoId: string
  jogadorId: string
  entrouAs: Minutos
  saiuAs?: Minutos
  encerrada: boolean
  /**
   * O lugar na mesa, de 1 a TOTAL_DE_LUGARES. Ausente = o jogador entrou na
   * sessao mas ainda nao tem cadeira: ele aparece "de pe".
   *
   * O numero e escolhido pelo operador, nao derivado de ordem — senao todo
   * mundo anda uma cadeira quando alguem fecha a conta. Item 4 da D4 do PRD.
   */
  lugar?: number
}

export interface Dealer {
  id: string
  nome: string
}

export interface Turno {
  id: string
  sessaoId: string
  numero: number
  dealerId: string
  inicio: Minutos
  /** Ausente enquanto o turno esta aberto. Turnos nao se sobrepoem (N4). */
  fim?: Minutos
}

export type TipoMovimentacao = 'retirada' | 'devolucao' | 'rake'
export type TipoConfirmacao = 'presencial' | 'contingencia'

/**
 * As quatro situacoes da regra do PRD. So `aguardando` espera alguem, e ela
 * nao expira por tempo (N18): sai por confirmacao, recusa ou encerramento.
 */
export type SituacaoMovimentacao =
  | 'aguardando'
  | 'confirmada'
  | 'recusada'
  | 'cancelada'

export interface Movimentacao {
  id: string
  sessaoId: string
  tipo: TipoMovimentacao
  valor: number
  /** Ausente no rake, que pertence ao turno e nao a um jogador. */
  participacaoId?: string
  turnoId: string
  /** Hora em que aconteceu. E ela que define o turno. */
  horaOcorrencia: Minutos
  /** Hora em que o operador digitou. Guardada, mas nao atribui turno. */
  horaDigitacao: Minutos
  /**
   * Hora em que a ficha efetivamente saiu ou voltou.
   *
   * Pela regra N2 a ficha so sai depois de o jogador confirmar, entao e ESTE o
   * instante que muda a caixa — nao o da digitacao. Um lancamento que ficou
   * aguardando por dez minutos atravessa checkpoints, e comparar pela hora de
   * ocorrencia faria um veredito ja vencido continuar valendo.
   */
  horaConfirmacao?: Minutos
  situacao: SituacaoMovimentacao
  confirmacao?: TipoConfirmacao
  /** Motivo escrito: exigido na contingencia (N16) e ao passar do limite (N10). */
  motivo?: string
}

/** As faixas da regra N17, aplicadas depois de cada checkpoint. */
export type Veredito = 'fechado' | 'registrar' | 'revisar' | 'suspender'

export interface Checkpoint {
  id: string
  sessaoId: string
  numero: number
  /** Hora de saida do rake. Define o turno (N3) e o fim da janela. */
  hora: Minutos
  /**
   * Hora em que o operador contou a caixa.
   *
   * Precisa ser separada de `hora`: o rake pode ser retroativo, e os numeros
   * do checkpoint valem para o instante da contagem. Comparar movimentacoes
   * contra `hora` faria o checkpoint tratar como "posterior" uma ficha que ele
   * mesmo ja contou.
   */
  contadoEm: Minutos
  caixaEsperado: number
  caixaContado: number
  /** Positiva significa que falta ficha na caixa. */
  diferenca: number
  veredito: Veredito
  janelaInicio: Minutos
  janelaFim: Minutos
  turnoId: string
  /**
   * Todos os turnos que a janela cobre.
   *
   * Uma janela de 50 minutos pode atravessar uma troca de dealer. Mostrar so o
   * turno do rake apontaria para a pessoa errada — e a regra N14 diz que o app
   * mostra a janela e quem estava nela, nunca um culpado.
   */
  turnoIdsNaJanela: string[]
  rakeAcumulado: number
  /** Conferencia final do encerramento, em vez de um lancamento de rake. */
  final?: boolean
}

export interface Sessao {
  id: string
  clube: string
  abertaEm: Minutos
  encerradaEm?: Minutos
  caixaInicial: number
  aberta: boolean
}

export interface Noite {
  agora: Minutos
  /** A sessao corrente. As encerradas continuam em `sessoes` (N13). */
  sessao: Sessao | null
  sessoes: Sessao[]
  jogadores: Jogador[]
  participacoes: Participacao[]
  dealers: Dealer[]
  turnos: Turno[]
  movimentacoes: Movimentacao[]
  checkpoints: Checkpoint[]
  /**
   * Fichas que sumiram fisicamente sem registro. O app nao sabe que existe —
   * ele so descobre a diferenca quando o operador conta a caixa no rake.
   * E o controle que permite ver o caminho do alerta funcionando.
   */
  furoOculto: number
  /** Ultima coisa que o app disse ao operador. */
  aviso: string | null
  /** Contador de ids. Deixa a simulacao deterministica e repetivel. */
  seq: number
}

// ─── Recorte por sessao ───────────────────────────────────────────────────

/**
 * Tudo que pertence a sessao corrente.
 *
 * A sessao delimita a noite (F1). Sem este recorte, uma segunda sessao herda
 * o caixa, os checkpoints e o teto de contingencia da anterior.
 */
function daSessao<T extends { sessaoId: string }>(noite: Noite, itens: T[]): T[] {
  const id = noite.sessao?.id
  return id ? itens.filter((x) => x.sessaoId === id) : []
}

export function movimentacoesDaSessao(noite: Noite): Movimentacao[] {
  return daSessao(noite, noite.movimentacoes)
}

export function checkpointsDaSessao(noite: Noite): Checkpoint[] {
  return daSessao(noite, noite.checkpoints)
}

export function turnosDaSessao(noite: Noite): Turno[] {
  return daSessao(noite, noite.turnos)
}

// ─── Regras da caixa ──────────────────────────────────────────────────────

export const TETO_CONTINGENCIAS = 3

/**
 * A mesa tem dez lugares. Nao e configuravel: o R1 tem uma mesa por sessao
 * (DEC-003) e o PRD diz dez. O `check` da migration 0002 grava o mesmo numero,
 * e os dois so mudam juntos.
 */
export const TOTAL_DE_LUGARES = 10

/** Faixas da regra N17, em reais. */
export const FAIXA_REGISTRAR = 100
export const FAIXA_REVISAR = 500

export function vereditoDa(diferenca: number): Veredito {
  if (diferenca === 0) return 'fechado'
  if (Math.abs(diferenca) <= FAIXA_REGISTRAR) return 'registrar'
  if (Math.abs(diferenca) <= FAIXA_REVISAR) return 'revisar'
  return 'suspender'
}

function confirmadas(noite: Noite, tipo: TipoMovimentacao) {
  return movimentacoesDaSessao(noite).filter(
    (m) => m.tipo === tipo && m.situacao === 'confirmada'
  )
}

export function somaRetiradas(noite: Noite): number {
  return confirmadas(noite, 'retirada').reduce((s, m) => s + m.valor, 0)
}

export function somaDevolucoes(noite: Noite): number {
  return confirmadas(noite, 'devolucao').reduce((s, m) => s + m.valor, 0)
}

export function rakeDeclarado(noite: Noite): number {
  return movimentacoesDaSessao(noite)
    .filter((m) => m.tipo === 'rake')
    .reduce((s, m) => s + m.valor, 0)
}

/**
 * O que deveria estar dentro da caixa de fichas agora.
 *
 * Sai fichas na retirada, volta fichas na devolucao e volta fichas no rake.
 * E esse numero que o operador confere de olho quando o dealer entrega o rake,
 * porque nessa hora ele ja esta com a mao na caixa.
 */
export function caixaEsperado(noite: Noite): number {
  if (!noite.sessao) return 0
  return (
    noite.sessao.caixaInicial -
    somaRetiradas(noite) +
    somaDevolucoes(noite) +
    rakeDeclarado(noite)
  )
}

/** O que existe fisicamente na caixa. O app so descobre isso na contagem. */
export function caixaContado(noite: Noite): number {
  return caixaEsperado(noite) - noite.furoOculto
}

/** Fichas em poder dos jogadores, segundo o registro. */
export function fichasEmJogo(noite: Noite): number {
  return somaRetiradas(noite) - somaDevolucoes(noite) - rakeDeclarado(noite)
}

/** Quanto de divergencia ja foi registrado nos checkpoints desta sessao. */
export function jaRegistrado(noite: Noite): number {
  return checkpointsDaSessao(noite).reduce((s, c) => s + c.diferenca, 0)
}

/** Regra N16: o teto de 3 e por sessao, entao ele se conta pela sessao. */
export function contingenciasDaSessao(noite: Noite): number {
  return movimentacoesDaSessao(noite).filter((m) => m.confirmacao === 'contingencia')
    .length
}

// ─── Consultas sobre a mesa ───────────────────────────────────────────────

export function turnoAberto(noite: Noite): Turno | null {
  return turnosDaSessao(noite).find((t) => t.fim === undefined) ?? null
}

/** Todos os turnos que se cruzam com uma janela de tempo. */
export function turnosNaJanela(noite: Noite, inicio: Minutos, fim: Minutos): Turno[] {
  return turnosDaSessao(noite).filter(
    (t) => t.inicio < fim && (t.fim ?? Infinity) > inicio
  )
}

/** O turno que contem uma hora. E a hora de ocorrencia que manda, nunca a de digitacao. */
export function turnoEm(noite: Noite, hora: Minutos): Turno | null {
  return (
    turnosDaSessao(noite).find(
      (t) => hora >= t.inicio && (t.fim === undefined || hora < t.fim)
    ) ?? null
  )
}

export function dealerDo(noite: Noite, turno: Turno | null): string {
  if (!turno) return '—'
  return noite.dealers.find((d) => d.id === turno.dealerId)?.nome ?? '—'
}

export function participacoesAbertas(noite: Noite): Participacao[] {
  return daSessao(noite, noite.participacoes).filter((p) => !p.encerrada)
}

export function jogadorDe(noite: Noite, participacaoId: string): Jogador | null {
  const participacao = noite.participacoes.find((p) => p.id === participacaoId)
  if (!participacao) return null
  return noite.jogadores.find((j) => j.id === participacao.jogadorId) ?? null
}

function movimentacoesDe(noite: Noite, participacaoId: string) {
  return noite.movimentacoes.filter((m) => m.participacaoId === participacaoId)
}

/** Fichas em poder do jogador: retirado confirmado menos devolvido confirmado. */
export function emMao(noite: Noite, participacaoId: string): number {
  return movimentacoesDe(noite, participacaoId)
    .filter((m) => m.situacao === 'confirmada')
    .reduce((s, m) => s + (m.tipo === 'retirada' ? m.valor : -m.valor), 0)
}

/** Lancamentos ainda aguardando confirmacao. Contam no limite pela regra N6. */
export function aguardando(noite: Noite, participacaoId: string): number {
  return movimentacoesDe(noite, participacaoId)
    .filter((m) => m.situacao === 'aguardando' && m.tipo === 'retirada')
    .reduce((s, m) => s + m.valor, 0)
}

/**
 * O jogador ja validou ficha nesta participacao?
 *
 * O teste e existir retirada CONFIRMADA — nao `emMao > 0`. Quem confirmou
 * R$ 500 e devolveu tudo continua tendo validado: a cadeira dele nao pode
 * piscar de volta para reservado no fechamento, que e justamente quando ele
 * ainda esta na mesa. E o que separa lugar reservado de lugar ocupado (A26).
 */
export function validouFicha(noite: Noite, participacaoId: string): boolean {
  return movimentacoesDe(noite, participacaoId).some(
    (m) => m.tipo === 'retirada' && m.situacao === 'confirmada'
  )
}

/**
 * Quem esta sentado neste lugar agora, se alguem.
 *
 * So conta participacao ABERTA: e isso que devolve a cadeira ao pool quando
 * alguem fecha a conta, sem apagar o numero da participacao encerrada (N13).
 */
export function participacaoNoLugar(noite: Noite, lugar: number): Participacao | null {
  return participacoesAbertas(noite).find((p) => p.lugar === lugar) ?? null
}

/**
 * Regra N6: o limite conta o confirmado mais o que esta aguardando.
 * Contar so o confirmado deixa passar duas retiradas pendentes que, somadas,
 * estouram o limite.
 */
export function comprometido(noite: Noite, participacaoId: string): number {
  return emMao(noite, participacaoId) + aguardando(noite, participacaoId)
}

export function contingenciasDe(noite: Noite, participacaoId: string): number {
  return movimentacoesDe(noite, participacaoId).filter(
    (m) => m.confirmacao === 'contingencia'
  ).length
}

/** Regra N11: a sessao nao encerra com jogador ainda na mesa. */
export function podeEncerrarSessao(noite: Noite): boolean {
  return Boolean(noite.sessao?.aberta) && participacoesAbertas(noite).length === 0
}

/** A identidade e o par nome + WhatsApp, unico dentro do clube (A16). */
export function jogadorPorIdentidade(
  noite: Noite,
  nome: string,
  whatsapp: string
): Jogador | null {
  const n = nome.trim().toLowerCase()
  const w = whatsapp.replace(/\D/g, '')
  return (
    noite.jogadores.find(
      (j) => j.nome.trim().toLowerCase() === n && j.whatsapp.replace(/\D/g, '') === w
    ) ?? null
  )
}

/** Mesmo WhatsApp com nome diferente e permitido, mas exige confirmacao (A17). */
export function whatsappJaUsado(noite: Noite, whatsapp: string): Jogador | null {
  const w = whatsapp.replace(/\D/g, '')
  if (!w) return null
  return noite.jogadores.find((j) => j.whatsapp.replace(/\D/g, '') === w) ?? null
}

// ─── Estado da faixa do shell ─────────────────────────────────────────────

export type EstadoFaixa = 'sem-sessao' | 'neutro' | 'fechado' | 'revisar' | 'furo'

/**
 * O que a faixa do topo mostra.
 *
 * O veredito e congelado no ultimo checkpoint. Entre um e outro a faixa fica
 * neutra, porque a diferenca ali e esperada — falta declarar o rake que ainda
 * esta na mesa. Alertar nessa hora e alertar errado quase o tempo todo (N8).
 *
 * A comparacao usa `contadoEm`, nao `hora`: um rake retroativo tem hora de
 * saida anterior a contagem, e comparar contra ela faria o checkpoint tratar
 * como posterior uma ficha que ele mesmo ja contou — apagando o proprio
 * veredito no instante em que ele nasce.
 */
export function estadoDaFaixa(noite: Noite): EstadoFaixa {
  if (!noite.sessao?.aberta) return 'sem-sessao'

  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]
  if (!ultimo) return 'neutro'

  const movimentacoes = movimentacoesDaSessao(noite)

  // Um rake so entra na conta quando e digitado, mesmo que a saida seja antiga.
  const rakeDepois = movimentacoes.some(
    (m) => m.tipo === 'rake' && m.horaDigitacao > ultimo.contadoEm
  )
  if (rakeDepois) return 'neutro'

  // Ficha confirmada depois da contagem quebra o congelamento: o veredito valia
  // para aquele instante, nao para agora.
  //
  // A comparacao usa a hora da CONFIRMACAO. Um lancamento pode nascer antes do
  // checkpoint e so ser confirmado depois — e e na confirmacao que a ficha sai
  // da caixa (N2). Comparar pela hora de ocorrencia deixava a faixa dizendo
  // "caixa fechado" com fichas que sairam depois da contagem.
  const fichaDepois = movimentacoes.some(
    (m) =>
      m.tipo !== 'rake' &&
      m.situacao === 'confirmada' &&
      (m.horaConfirmacao ?? m.horaOcorrencia) > ultimo.contadoEm
  )
  if (fichaDepois) return 'neutro'

  if (ultimo.veredito === 'fechado') return 'fechado'
  if (ultimo.veredito === 'suspender') return 'furo'
  if (ultimo.veredito === 'revisar') return 'revisar'
  return 'neutro'
}
