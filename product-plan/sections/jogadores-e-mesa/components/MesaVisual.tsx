import { Clock, EyeOff, Plus, UserRound } from 'lucide-react'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface LugarOcupado {
  /** Numero do lugar, de 1 a 10. Escolhido pelo operador, nao derivado de ordem. */
  lugar: number
  participacaoId: string
  nome: string
  entrouAs: string
  emMao: number
  limite: number
  /** Retirada esperando o jogador confirmar. O lugar fica marcado ate sair. */
  aguardando: number
  contingencias: number
  /**
   * Ja confirmou a primeira ficha na tela girada?
   *
   * `false` = lugar RESERVADO: a cadeira tem dono, mas ele ainda nao reconheceu
   * ficha nenhuma. E a leitura da N2 que a F13 existe para dar (criterio A26).
   */
  validou: boolean
}

export interface MesaVisualProps {
  lugares: LugarOcupado[]
  totalDeLugares?: number
  /** Quem entrou na sessao mas ainda nao validou nenhuma ficha. */
  emPe?: { participacaoId: string; nome: string }[]
  dealer?: string
  turno?: number
  fichasEmJogo?: number
  onAbrirJogador?: (participacaoId: string) => void
  onSentar?: (lugar: number) => void
}

/**
 * A mesa vista de cima.
 *
 * O lugar nao e decoracao: ele so e ocupado quando o jogador valida a primeira
 * ficha na tela girada. Antes disso ele esta na sessao, mas de pe — e isso
 * aparece separado, embaixo.
 *
 * O feltro e neutro de proposito, e continua neutro depois do redesenho. Verde
 * neste produto quer dizer "caixa fechado"; uma mesa verde ocupando a tela
 * inteira gastaria o unico canal que o operador tem para saber que a noite esta
 * fechando. O que da materia a mesa aqui e luz e textura, nao cor: a poca da
 * lampada no centro, o aro de couro na borda e o grao por cima.
 */
export function MesaVisual({
  lugares,
  totalDeLugares = 10,
  emPe = [],
  dealer,
  turno,
  fichasEmJogo,
  onAbrirJogador,
  onSentar,
}: MesaVisualProps) {
  const ocupados = new Map(lugares.map((l) => [l.lugar, l]))

  // Elipse: lugar 1 embaixo no centro, seguindo no sentido horario.
  // O raio horizontal e menor que o vertical em proporcao porque os cartoes sao
  // largos: se eles saem ate a borda, o texto vaza da area visivel.
  const posicao = (indice: number) => {
    const angulo = ((180 + indice * (360 / totalDeLugares)) * Math.PI) / 180
    return {
      left: `${50 + 40 * Math.sin(angulo)}%`,
      top: `${50 - 38 * Math.cos(angulo)}%`,
    }
  }

  // Ocupado e livre ocupam o mesmo espaco, senao o anel de lugares fica torto.
  const molduraDoLugar =
    'absolute w-[5.75rem] -translate-x-1/2 -translate-y-1/2 rounded-xl p-1.5 text-center transition-transform duration-200 sm:w-28'

  return (
    <div className="space-y-4">
      <div className="cv-rise relative mx-auto aspect-square w-full max-w-2xl sm:aspect-[7/5]">
        {/* O aro de couro: dois anéis, um escuro por fora e um filete de luz
            por dentro. É o que dá espessura à mesa sem usar sombra falsa. */}
        <div className="absolute inset-x-[14%] inset-y-[17%] rounded-[50%] bg-[var(--cv-panel)] p-[1.2%] shadow-[0_30px_60px_-30px_var(--cv-shadow-deep)] ring-1 ring-[var(--cv-hairline)]">
          <div className="relative size-full overflow-hidden rounded-[50%] ring-1 ring-[var(--cv-highlight)]">
            {/* O feltro. Neutro, com a lâmpada caindo no meio. */}
            <div
              className="cv-grain absolute inset-0"
              style={{
                backgroundColor: 'var(--cv-room)',
                backgroundImage:
                  'radial-gradient(60% 60% at 50% 42%, var(--cv-lamp) 0%, transparent 72%), radial-gradient(120% 100% at 50% 115%, var(--cv-shadow) 0%, transparent 60%)',
              }}
            />
            {/* A linha de aposta: o círculo gravado onde as fichas param. */}
            <div className="absolute inset-[7%] rounded-[50%] border border-[var(--cv-hairline)]" />

            {/* O centro carrega o estado da noite, nao um logo. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center">
              {turno != null ? (
                <span className="cv-live-text cv-engraved flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
                  <span
                    className="relative flex size-1.5 items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="cv-pulse absolute inset-0" />
                    <span className="relative size-1.5 rounded-full bg-current" />
                  </span>
                  Turno {turno} · {dealer}
                </span>
              ) : (
                <span className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
                  Nenhum turno aberto
                </span>
              )}
              {fichasEmJogo != null ? (
                <>
                  <span className="cv-text font-cv-mono cv-num text-[26px] leading-none font-bold sm:text-[34px]">
                    {reais(fichasEmJogo)}
                  </span>
                  <span className="cv-text-soft cv-engraved text-[9px] font-semibold tracking-[0.18em] uppercase">
                    em jogo
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Os lugares */}
        {Array.from({ length: totalDeLugares }, (_, i) => {
          const numero = i + 1
          const jogador = ocupados.get(numero)
          const estilo = posicao(i)

          if (!jogador) {
            return (
              <button
                key={numero}
                type="button"
                onClick={() => onSentar?.(numero)}
                style={estilo}
                aria-label={`Lugar ${numero}, livre. Sentar alguém.`}
                className={`${molduraDoLugar} cv-text-soft border border-dashed border-[var(--cv-hairline)] bg-[var(--cv-panel-quiet)] hover:scale-105 hover:border-[var(--cv-live)] hover:text-[var(--cv-live)] focus-visible:ring-2 focus-visible:outline-none`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span className="font-cv-mono cv-num text-[9px]">{numero}</span>
                  <Plus className="size-3" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-[11px] leading-none">livre</span>
                <span className="mt-1.5 block h-1" aria-hidden="true" />
                <span className="mt-1 block text-[9px] leading-tight">sentar</span>
              </button>
            )
          }

          const comprometido = jogador.emMao + jogador.aguardando
          const uso = jogador.limite > 0 ? Math.min(comprometido / jogador.limite, 1) : 0
          const apertado = uso >= 0.8
          const esperando = jogador.aguardando > 0
          // Cadeira com dono que ainda nao reconheceu ficha. Neutra de
          // proposito: e o estado normal de quem acabou de chegar, nao alerta.
          const reservado = !jogador.validou

          return (
            <button
              key={numero}
              type="button"
              onClick={() => onAbrirJogador?.(jogador.participacaoId)}
              style={estilo}
              aria-label={
                reservado
                  ? `Lugar ${numero}: ${jogador.nome}, reservado, aguardando a primeira ficha.`
                  : `Lugar ${numero}: ${jogador.nome}, ${reais(jogador.emMao)} em fichas, desde ${jogador.entrouAs}.`
              }
              className={`${molduraDoLugar} hover:scale-105 focus-visible:ring-2 focus-visible:outline-none ${
                reservado
                  ? // Tracejado e sem chapa: a cadeira tem dono, mas nada
                    // aconteceu nela ainda.
                    'border border-dashed border-[var(--cv-hairline)] bg-[var(--cv-panel-quiet)]'
                  : 'cv-panel'
              } ${
                esperando
                  ? // Violeta: chrome, nao estado do caixa. Marca "esperando ele olhar".
                    'cv-ch-chrome cv-accent-ring'
                  : ''
              }`}
            >
              {/* O nome quebra em duas linhas em vez de cortar: "Paulo Vi…" nao
                  serve para um operador conferir de longe quem esta no lugar. */}
              <span className="flex items-start justify-center gap-1">
                <span className="cv-text-soft font-cv-mono cv-num mt-px text-[9px] opacity-70">
                  {numero}
                </span>
                <span className="cv-text text-[12px] leading-tight font-semibold break-words">
                  {jogador.nome}
                </span>
                {jogador.contingencias > 0 ? (
                  <EyeOff
                    className="cv-ch-chrome cv-accent-text mt-px size-2.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
              </span>

              {/* O reservado nao mostra valor nem barra: ele nao tem nem um nem
                  outro. Mostrar R$ 0 com barra vazia faria a cadeira parecer um
                  jogador zerado, que e coisa bem diferente de nao ter comecado. */}
              {reservado ? (
                <span className="cv-text-soft mt-1 block text-[10px] leading-tight">
                  reservado
                </span>
              ) : (
                <>
                  <span className="cv-text font-cv-mono cv-num mt-1 block text-[13px] leading-none font-bold">
                    {reais(jogador.emMao)}
                  </span>

                  <span className="cv-panel-quiet mt-1.5 block h-1 overflow-hidden rounded-full">
                    <span
                      className={`block h-full rounded-full bg-current ${
                        apertado ? 'cv-ch-limite cv-accent-bg' : 'cv-text-soft bg-current opacity-45'
                      }`}
                      style={{ width: `${uso * 100}%` }}
                    />
                  </span>
                </>
              )}

              {reservado ? (
                <span className="cv-text-soft font-cv-mono cv-num mt-1.5 block text-[9px] leading-tight opacity-80">
                  aguarda a 1ª ficha
                </span>
              ) : esperando ? (
                <span className="cv-accent-text font-cv-mono cv-num mt-1.5 block text-[9px] leading-tight font-semibold">
                  aguardando {reais(jogador.aguardando)}
                </span>
              ) : (
                <span className="cv-text-soft font-cv-mono cv-num mt-1.5 flex items-center justify-center gap-0.5 text-[9px] opacity-80">
                  <Clock className="size-2.5" aria-hidden="true" />
                  {jogador.entrouAs}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Quem entrou mas ainda nao validou ficha nenhuma. */}
      {emPe.length > 0 ? (
        <section className="cv-panel cv-rise cv-d1 rounded-2xl p-4">
          <h2 className="cv-text-soft cv-engraved flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.18em] uppercase">
            <UserRound className="size-3" aria-hidden="true" />
            Na sessão, ainda de pé
          </h2>
          <p className="cv-text-soft mt-1.5 text-[12px] leading-snug">
            Ainda sem cadeira. Toque num lugar livre para sentar alguém — o lugar
            fica reservado até ele confirmar a primeira ficha na tela girada.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {emPe.map((p) => (
              <button
                key={p.participacaoId}
                type="button"
                onClick={() => onAbrirJogador?.(p.participacaoId)}
                className="cv-btn-quiet h-10 rounded-full px-3.5 text-[13px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
              >
                {p.nome}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
