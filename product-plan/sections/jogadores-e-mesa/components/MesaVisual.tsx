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
  /** Quem entrou na sessao e ainda NAO TEM CADEIRA. Nao e "quem nao validou". */
  emPe?: { participacaoId: string; nome: string }[]
  dealer?: string
  turno?: number
  fichasEmJogo?: number
  onAbrirJogador?: (participacaoId: string) => void
  onSentar?: (lugar: number) => void
}

/* ═══════════════════════════════════════════════════════════════════════════
   OS MATERIAIS DA MESA
   ───────────────────────────────────────────────────────────────────────────
   Mogno, couro, feltro e carpete sao MATERIA, nao tema de interface. Uma mesa
   de poker nao muda de madeira quando o operador troca para o tema claro — por
   isso estes valores sao fixos, e nao variaveis `--cv-*`. O que o tema controla
   e a interface por cima: cartoes, texto, canais de estado.

   A cor e deliberadamente contida. A referencia que originou este desenho tem
   feltro laranja saturado; reproduzi-lo em tela cheia gastaria o canal ambar,
   que neste produto significa "revisar a janela". Aqui o realismo vem de LUZ,
   TEXTURA e PROFUNDIDADE — poca de lampada, verniz, grao de feltro, fibra de
   carpete e sombra projetada. Materia, nao pigmento.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Carpete de pelo cortado: fibra fina, mosqueado irregular e a poca da luz. */
const CARPETE = {
  backgroundColor: '#332b26',
  backgroundImage: [
    // A poca da lampada no teto, caindo sobre a mesa e morrendo nas bordas.
    'radial-gradient(78% 62% at 50% 34%, rgba(255,206,150,0.16) 0%, transparent 72%)',
    // Manchas largas: carpete de salao nunca e uniforme, ele tem sombra de uso.
    'radial-gradient(30% 26% at 18% 78%, rgba(0,0,0,0.34) 0%, transparent 100%)',
    'radial-gradient(26% 22% at 84% 24%, rgba(0,0,0,0.30) 0%, transparent 100%)',
    // Mosqueado do pelo: tres frequencias, senao vira textura de tecido regular.
    'radial-gradient(circle at 20% 30%, rgba(255,236,214,0.10) 0.6px, transparent 1.3px)',
    'radial-gradient(circle at 65% 70%, rgba(0,0,0,0.55) 0.6px, transparent 1.4px)',
    'radial-gradient(circle at 85% 15%, rgba(255,236,214,0.055) 0.5px, transparent 1.1px)',
    // A direcao do pelo, escovada. E o que tira o "chapado" do fundo.
    'repeating-linear-gradient(96deg, rgba(255,240,220,0.055) 0 1px, transparent 1px 3px)',
    'repeating-linear-gradient(6deg, rgba(0,0,0,0.40) 0 1px, transparent 1px 4px)',
    // Vinheta: o salao acaba no escuro, mas sem apagar a textura.
    'radial-gradient(128% 104% at 50% 42%, transparent 44%, rgba(0,0,0,0.66) 100%)',
  ].join(','),
  backgroundSize: 'auto, auto, auto, 3px 3px, 4px 4px, 5px 5px, 3px 3px, 4px 4px, auto',
} as const

/**
 * Mogno envernizado.
 *
 * O anel e uma casca: so a faixa externa aparece, o miolo fica sob o feltro.
 * Por isso a secao redonda e desenhada nos ultimos 12% do raio — dentro disso
 * a cor nao importa. O verniz entra por cima, num conic que varre a elipse:
 * luz forte no quadrante de cima-esquerda, reflexo fraco embaixo. Luz que nao
 * varre parece plastico pintado, nao madeira polida.
 */
const TRILHO = {
  backgroundImage: [
    'conic-gradient(from 190deg at 50% 50%, rgba(255,236,210,0) 0deg, rgba(255,242,222,0.40) 44deg, rgba(255,238,216,0.06) 74deg, rgba(255,236,214,0) 120deg, rgba(255,224,196,0.03) 200deg, rgba(255,230,204,0.20) 248deg, rgba(255,230,204,0.02) 280deg, rgba(255,236,210,0) 360deg)',
    'radial-gradient(closest-side at 50% 50%, #120504 0%, #120504 90.5%, #2f1108 92.2%, #62290f 93.6%, #8d4526 95.2%, #6a3018 96.8%, #351307 98.4%, #0e0403 100%)',
  ].join(','),
} as const

/** Feltro de argila: acolchoado em losangos, com o grao por cima. */
const FELTRO = {
  backgroundColor: '#332821',
  backgroundImage: [
    // A poca da lampada, deslocada para cima como a luminaria real.
    'radial-gradient(52% 56% at 50% 37%, rgba(255,178,104,0.30) 0%, transparent 72%)',
    // O acolchoado: dois feixes cruzados a 45 graus, um de luz e um de sombra,
    // e o losango nasce do cruzamento — nao de uma imagem.
    'repeating-linear-gradient(45deg, rgba(255,226,190,0.075) 0 1.2px, transparent 1.2px 13px)',
    'repeating-linear-gradient(-45deg, rgba(0,0,0,0.30) 0 1.2px, transparent 1.2px 13px)',
    // Grao curto do feltro, denso.
    'radial-gradient(circle at 40% 60%, rgba(0,0,0,0.34) 0.6px, transparent 1.2px)',
    'radial-gradient(circle at 75% 25%, rgba(255,226,190,0.05) 0.5px, transparent 1px)',
    // A sombra que o trilho projeta para dentro, no pe da mesa.
    'radial-gradient(130% 112% at 50% 116%, rgba(0,0,0,0.72) 0%, transparent 56%)',
  ].join(','),
  backgroundSize: 'auto, auto, auto, 3px 3px, 4px 4px, auto',
} as const

/** Couro preto da cadeira: costura de cima na luz, assento no escuro. */
const COURO =
  'linear-gradient(176deg, #57493f 0%, #322a25 22%, #1c1715 62%, #0d0b0a 100%)'

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

  // Lugar 1 embaixo no centro, seguindo no sentido horario. Tres raios saem do
  // mesmo angulo, e e isso que alinha cadeira, cartao e porta-fichas na mesma
  // linha radial — como numa mesa de verdade, onde tudo pertence ao lugar.
  const anguloDe = (indice: number) => ((180 + indice * (360 / totalDeLugares)) * Math.PI) / 180

  const emTorno = (indice: number, raioX: number, raioY: number) => {
    const a = anguloDe(indice)
    return { left: `${50 + raioX * Math.sin(a)}%`, top: `${50 - raioY * Math.cos(a)}%` }
  }

  /** Graus, para girar cadeira e porta-fichas de frente para o centro. */
  const grausDe = (indice: number) => indice * (360 / totalDeLugares)

  /**
   * Quanto o lugar esta "na frente", de 0 (fundo da mesa) a 1 (perto de quem
   * olha). A mesa e vista de um angulo, entao quem esta na frente aparece maior
   * e mais claro — e o unico jeito de dez cadeiras iguais lerem como um salao
   * em vez de um relogio.
   */
  const proximidade = (indice: number) => (1 - Math.cos(anguloDe(indice))) / 2

  // Ocupado, reservado e livre ocupam o mesmo espaco, senao o anel fica torto.
  const molduraDoLugar =
    'absolute z-20 w-[5.75rem] -translate-x-1/2 -translate-y-1/2 rounded-xl p-1.5 text-center backdrop-blur-md transition-transform duration-200 sm:w-28'

  return (
    <div className="space-y-4">
      {/* O SALAO. O carpete nao e enfeite: e ele que da chao a mesa e faz a
          sombra projetada ter onde cair. Sem chao, a mesa flutua. */}
      <div
        className="cv-rise relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-3xl ring-1 ring-[var(--cv-hairline)] sm:aspect-[7/5]"
        style={CARPETE}
      >
        {/* A sombra que a mesa joga no carpete. Deslocada para baixo porque a
            luminaria esta acima e um pouco a frente. */}
        <div
          className="pointer-events-none absolute inset-x-[12%] inset-y-[25%] rounded-[50%] blur-2xl"
          style={{ background: 'rgba(0,0,0,0.62)', transform: 'translateY(4%) scale(1.05)' }}
          aria-hidden="true"
        />

        {/* AS CADEIRAS. Ficam atras de tudo, giradas de frente para o centro.
            Aparecem so pelo encosto, como numa foto de angulo: o assento fica
            escondido sob o trilho. Quem esta na frente vem maior e mais claro. */}
        {Array.from({ length: totalDeLugares }, (_, i) => {
          const jogador = ocupados.get(i + 1)
          const perto = proximidade(i)
          const escala = 0.74 + 0.42 * perto
          return (
            <div
              key={`cadeira-${i}`}
              className="pointer-events-none absolute z-0 h-[17%] w-[12.5%] -translate-x-1/2 -translate-y-1/2"
              style={{
                ...emTorno(i, 45, 40),
                transform: `translate(-50%,-50%) rotate(${grausDe(i)}deg) scale(${escala})`,
                // O fundo do salao e mais escuro: a luz da luminaria nao chega la.
                filter: `brightness(${(0.55 + 0.55 * perto).toFixed(2)})`,
              }}
              aria-hidden="true"
            >
              {/* O encosto. Silhueta de cadeira de cassino: ombros largos e
                  quase quadrados, base que estreita e some sob o trilho. Forma
                  redonda demais vira mancha — e a quina que faz ler cadeira. */}
              <div
                className="absolute inset-x-0 top-0 h-[74%] rounded-[26%_26%_40%_40%/32%_32%_24%_24%]"
                style={{
                  background: COURO,
                  boxShadow: jogador
                    ? // Cadeira tomada: filete quente na costura de cima. De longe,
                      // o anel de cadeiras ja conta quantos lugares foram.
                      'inset 0 2.5px 0 -0.5px rgba(255,222,190,0.44), inset 0 -10px 16px -8px rgba(0,0,0,0.95), 0 14px 24px -10px rgba(0,0,0,0.95)'
                    : 'inset 0 2px 0 -0.5px rgba(255,236,214,0.14), inset 0 -10px 16px -8px rgba(0,0,0,0.95), 0 12px 20px -11px rgba(0,0,0,0.9)',
                }}
              >
                {/* O painel central do estofado, afundado entre duas gomas. */}
                <div
                  className="absolute inset-x-[22%] inset-y-[13%] rounded-[22%_22%_36%_36%/26%_26%_20%_20%]"
                  style={{
                    background:
                      'linear-gradient(178deg, rgba(255,232,204,0.08) 0%, rgba(0,0,0,0.34) 100%)',
                    boxShadow:
                      'inset 1.5px 0 0 rgba(0,0,0,0.55), inset -1.5px 0 0 rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,232,204,0.10)',
                  }}
                />
              </div>
              {/* A coluna, saindo por baixo do encosto e entrando sob a mesa. */}
              <div
                className="absolute bottom-0 left-1/2 h-[30%] w-[20%] -translate-x-1/2 rounded-b-[45%]"
                style={{
                  background: 'linear-gradient(180deg, #191410 0%, #262019 55%, #0a0807 100%)',
                }}
              />
            </div>
          )
        })}

        {/* A MESA. Trilho de mogno por fora, feltro por dentro.
            A elipse e larga e baixa de proposito: e a forma que uma mesa oval
            assume quando vista de um angulo, e nao de cima a prumo. */}
        <div
          className="absolute inset-x-[14%] inset-y-[26%] rounded-[50%] p-[3.6%] shadow-[0_34px_60px_-22px_rgba(0,0,0,0.95)]"
          style={TRILHO}
        >
          {/* O filete de luz na quina de cima do trilho: a aresta do verniz. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[50%]"
            style={{
              boxShadow:
                'inset 0 2px 1px -1px rgba(255,240,220,0.45), inset 0 -3px 6px -3px rgba(0,0,0,0.9)',
            }}
            aria-hidden="true"
          />

          {/* OS PORTA-FICHAS. Rasgos recuados no trilho, um por lugar — o
              detalhe que mais denuncia mesa de verdade numa foto de cima. */}
          {Array.from({ length: totalDeLugares }, (_, i) => (
            <div
              key={`bandeja-${i}`}
              className="pointer-events-none absolute h-[3.2%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                ...emTorno(i, 46, 46),
                transform: `translate(-50%,-50%) rotate(${grausDe(i)}deg)`,
                background: 'linear-gradient(180deg, #150a06 0%, #3a1c11 70%, #6b3722 100%)',
                boxShadow: 'inset 0 1.5px 2px rgba(0,0,0,0.95), 0 1px 0 rgba(255,222,190,0.16)',
              }}
              aria-hidden="true"
            />
          ))}

          {/* O FELTRO. */}
          <div className="relative size-full overflow-hidden rounded-[50%]" style={FELTRO}>
            {/* A linha de aposta, gravada no feltro. */}
            <div
              className="pointer-events-none absolute inset-[8%] rounded-[50%] border border-[rgba(255,232,206,0.10)]"
              style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.35)' }}
              aria-hidden="true"
            />

            {/* A ilha do dealer: o painel escuro no meio da mesa. Na mesa de
                verdade e onde vai a marca da casa. Aqui carrega o estado da
                noite — o operador olha o centro e sabe em que pe esta. */}
            <div
              className="absolute inset-x-[19%] inset-y-[26%] flex flex-col items-center justify-center gap-1.5 rounded-[50%] px-6 text-center"
              style={{
                background:
                  'radial-gradient(100% 100% at 50% 30%, rgba(30,34,44,0.94) 0%, rgba(14,16,22,0.97) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,240,220,0.16), inset 0 -2px 8px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
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
                <span className="cv-engraved text-[9.5px] font-semibold tracking-[0.18em] text-[rgba(233,224,214,0.55)] uppercase">
                  Nenhum turno aberto
                </span>
              )}
              {fichasEmJogo != null ? (
                <>
                  <span className="font-cv-mono cv-num text-[26px] leading-none font-bold text-[#f2ece4] sm:text-[34px]">
                    {reais(fichasEmJogo)}
                  </span>
                  <span className="cv-engraved text-[9px] font-semibold tracking-[0.18em] text-[rgba(233,224,214,0.55)] uppercase">
                    em jogo
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* OS LUGARES. Ficam por cima de tudo, sobre a borda do trilho — e onde
            o jogador poe as maos. Sao a interface; a mesa e o contexto. */}
        {Array.from({ length: totalDeLugares }, (_, i) => {
          const numero = i + 1
          const jogador = ocupados.get(numero)
          const estilo = emTorno(i, 43, 37)

          if (!jogador) {
            return (
              <button
                key={numero}
                type="button"
                onClick={() => onSentar?.(numero)}
                style={estilo}
                aria-label={`Lugar ${numero}, livre. Sentar alguém.`}
                className={`${molduraDoLugar} border border-dashed border-[rgba(255,236,214,0.20)] bg-[rgba(20,16,13,0.42)] text-[rgba(233,224,214,0.62)] hover:scale-105 hover:border-[var(--cv-live)] hover:text-[var(--cv-live)] focus-visible:ring-2 focus-visible:outline-none`}
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
              className={`${molduraDoLugar} shadow-[0_8px_18px_-8px_rgba(0,0,0,0.9)] hover:scale-105 focus-visible:ring-2 focus-visible:outline-none ${
                reservado
                  ? // Tracejado e translucido: a cadeira tem dono, mas nada
                    // aconteceu nela ainda. O feltro aparece por tras.
                    'border border-dashed border-[rgba(255,236,214,0.24)] bg-[rgba(20,16,13,0.46)]'
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
                <span
                  className={`font-cv-mono cv-num mt-px text-[9px] opacity-70 ${
                    reservado ? 'text-[rgba(233,224,214,0.75)]' : 'cv-text-soft'
                  }`}
                >
                  {numero}
                </span>
                <span
                  className={`text-[12px] leading-tight font-semibold break-words ${
                    reservado ? 'text-[#efe7dd]' : 'cv-text'
                  }`}
                >
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
                <span className="mt-1 block text-[10px] leading-tight text-[rgba(233,224,214,0.70)]">
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
                <span className="font-cv-mono cv-num mt-1.5 block text-[9px] leading-tight text-[rgba(233,224,214,0.62)]">
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

      {/* Quem entrou na sessao e ainda NAO TEM CADEIRA — nao "quem nao validou".
          Sao coisas diferentes desde que o lugar virou campo: quem tem cadeira e
          nao validou aparece no lugar dele, reservado. */}
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
