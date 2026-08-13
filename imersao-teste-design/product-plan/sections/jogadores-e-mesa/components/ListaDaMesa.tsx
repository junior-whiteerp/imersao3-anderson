import { EyeOff, Search, UserPlus, Users } from 'lucide-react'
import { CartaoJogador } from './CartaoJogador'
import type { JogadorNaMesa } from './tipos'

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export interface ListaDaMesaProps {
  jogadores: JogadorNaMesa[]
  busca: string
  /** Contingências já gastas na sessão, e o teto. O teto é da noite, não do jogador. */
  contingenciasNaSessao?: number
  tetoContingencias?: number
  /** Sem sessão aberta não há mesa: o cadastro é desligado em vez de enganar. */
  sessaoAberta?: boolean
  onBuscar?: (termo: string) => void
  onAdicionar?: () => void
  onAbrirJogador?: (jogadorId: string) => void
}

export function ListaDaMesa({
  jogadores,
  busca,
  contingenciasNaSessao,
  tetoContingencias = 3,
  sessaoAberta = true,
  onBuscar,
  onAdicionar,
  onAbrirJogador,
}: ListaDaMesaProps) {
  const filtrados = jogadores.filter((jogador) =>
    jogador.nome.toLowerCase().includes(busca.trim().toLowerCase())
  )
  const totalEmFichas = jogadores.reduce((soma, jogador) => soma + jogador.emMao, 0)

  // A18: nomes repetidos na mesa. Só nesses o WhatsApp aparece — mostrar em
  // todos seria expor o número sem necessidade.
  const contagemPorNome = new Map<string, number>()
  for (const j of jogadores) {
    const chave = j.nome.trim().toLowerCase()
    contagemPorNome.set(chave, (contagemPorNome.get(chave) ?? 0) + 1)
  }
  const homonimos = new Set(
    [...contagemPorNome.entries()].filter(([, n]) => n > 1).map(([nome]) => nome)
  )

  if (jogadores.length === 0) {
    return (
      <section className="cv-panel cv-ticks cv-rise rounded-2xl p-10 text-center">
        <Users className="cv-text-soft mx-auto size-8 opacity-40" aria-hidden="true" />
        <h2 className="cv-text font-cv-display mt-4 text-[28px] leading-tight">
          {sessaoAberta ? 'Ninguém na mesa ainda' : 'Nenhuma sessão aberta'}
        </h2>
        <p className="cv-text-soft mx-auto mt-2 max-w-xs text-[13px] leading-relaxed">
          {sessaoAberta
            ? 'A noite começa quando o primeiro jogador senta.'
            : 'Abra a sessão na aba Sessão. Sem noite aberta não há mesa, e cadastrar agora deixaria o jogador de fora dela.'}
        </p>
        {sessaoAberta ? (
          <button
            type="button"
            onClick={onAdicionar}
            className="cv-ch-live cv-btn cv-shine mx-auto mt-6 h-12 px-5 text-[13.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
          >
            <UserPlus className="size-4 shrink-0" aria-hidden="true" />
            Adicionar jogador
          </button>
        ) : null}
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="cv-rise flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="cv-text-soft pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 opacity-60"
            aria-hidden="true"
          />
          <input
            value={busca}
            onChange={(e) => onBuscar?.(e.target.value)}
            placeholder="Buscar na mesa"
            aria-label="Buscar jogador na mesa"
            className="cv-panel cv-text h-12 w-full rounded-xl pr-3 pl-10 text-[14.5px] outline-none focus:ring-2"
          />
        </div>
        <button
          type="button"
          onClick={onAdicionar}
          aria-label="Adicionar jogador"
          className="cv-ch-live cv-btn cv-shine size-12 shrink-0 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <UserPlus className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="cv-rise cv-d1 flex items-baseline justify-between px-1">
        <p className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.18em] uppercase">
          {jogadores.length} na mesa
        </p>
        <p className="cv-text font-cv-mono cv-num text-[11.5px] font-semibold">
          {reais(totalEmFichas)} em fichas
        </p>
      </div>

      {/* O teto de contingência é da sessão. Ele fica aqui, uma vez, em vez de
          repetido dentro de cada cartão dizendo um número que não é o dele. */}
      {contingenciasNaSessao != null && contingenciasNaSessao > 0 ? (
        <p
          className={`cv-accent-text cv-accent-fill cv-rise cv-d1 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12px] leading-snug ${
            contingenciasNaSessao >= tetoContingencias
              ? 'cv-ch-suspender'
              : 'cv-ch-chrome'
          }`}
        >
          <EyeOff className="size-3.5 shrink-0" aria-hidden="true" />
          {contingenciasNaSessao === tetoContingencias
            ? `Teto de contingência atingido: ${contingenciasNaSessao} de ${tetoContingencias}. A próxima ficha não sai sem o jogador olhar.`
            : `${contingenciasNaSessao} de ${tetoContingencias} contingências usadas nesta sessão.`}
        </p>
      ) : null}

      {filtrados.length === 0 ? (
        <p className="cv-panel cv-text-soft rounded-2xl p-8 text-center text-[13px]">
          Ninguém na mesa com esse nome.
        </p>
      ) : (
        <ul className="cv-rise cv-d2 space-y-2.5">
          {filtrados.map((jogador) => (
            <CartaoJogador
              key={jogador.id}
              jogador={jogador}
              desambiguar={homonimos.has(jogador.nome.trim().toLowerCase())}
              onAbrir={onAbrirJogador}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
