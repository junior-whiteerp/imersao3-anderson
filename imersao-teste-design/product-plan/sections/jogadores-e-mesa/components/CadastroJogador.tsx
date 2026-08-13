import { useState } from 'react'
import { Info, UserPlus } from 'lucide-react'

export interface NovoJogador {
  nome: string
  whatsapp: string
  cpf?: string
  limite: number
  /** A17: o operador confirmou que este WhatsApp é de outra pessoa. */
  confirmouOutraPessoa?: boolean
}

export interface CadastroJogadorProps {
  onCadastrar?: (jogador: NovoJogador) => void
  onCancelar?: () => void
  /**
   * Nome de quem já usa o WhatsApp digitado, quando houver.
   * Recebe o número em tempo real e devolve o dono — é o que permite pedir a
   * confirmação de A17 antes de criar um segundo cadastro.
   */
  donoDoWhatsapp?: (whatsapp: string) => string | null
  /** Nome do jogador já cadastrado com o par nome + WhatsApp digitado (A16). */
  jaCadastrado?: (nome: string, whatsapp: string) => string | null
  /** Leva o operador ao jogador que já existe, em vez de deixá-lo adivinhar. */
  onUsarExistente?: (nome: string, whatsapp: string) => void
}

/**
 * O cadastro do jogador.
 *
 * Esta e a unica tela do app sem saida de excecao. A regra N15 nao tem nivel
 * acima que possa liberar: sem WhatsApp nao ha cadastro, e sem cadastro nao sai
 * ficha. Por isso nao existe botao de "liberar mesmo assim" aqui — o criterio
 * A19 exige que o caminho de excecao nao exista nem na interface.
 */
export function CadastroJogador({
  onCadastrar,
  onCancelar,
  donoDoWhatsapp,
  jaCadastrado,
  onUsarExistente,
}: CadastroJogadorProps) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cpf, setCpf] = useState('')
  const [limite, setLimite] = useState('')
  const [consentiu, setConsentiu] = useState(false)
  const [confirmouOutraPessoa, setConfirmouOutraPessoa] = useState(false)

  const numeroLimite = Number(limite.replace(/\D/g, ''))
  // N15: o que vale e o numero, nao o texto. "não informou" preenchia o campo e
  // liberava o botao; o reducer recusava e o formulario era jogado fora.
  const temWhatsapp = whatsapp.replace(/\D/g, '').length > 0

  const duplicado = jaCadastrado?.(nome, whatsapp) ?? null
  const dono = temWhatsapp ? (donoDoWhatsapp?.(whatsapp) ?? null) : null
  // A17: mesmo numero com nome diferente exige confirmacao explicita.
  const precisaConfirmarOutraPessoa = Boolean(dono) && !duplicado

  const completo =
    nome.trim().length > 0 &&
    temWhatsapp &&
    numeroLimite > 0 &&
    consentiu &&
    !duplicado &&
    (!precisaConfirmarOutraPessoa || confirmouOutraPessoa)

  const campo =
    'cv-panel-quiet cv-line cv-text h-12 w-full rounded-xl border px-3.5 text-[14.5px] outline-none focus:ring-2'
  const rotulo =
    'cv-text-soft cv-engraved block text-[9.5px] font-semibold tracking-[0.16em] uppercase'

  return (
    <section className="cv-panel cv-ticks cv-rise mx-auto max-w-md rounded-2xl p-6">
      <h2 className="cv-text font-cv-display text-[28px] leading-tight">
        Cadastrar jogador
      </h2>
      <p className="cv-text-soft mt-2 text-[13px] leading-relaxed">
        A identidade do jogador é o par nome + WhatsApp, único dentro do clube.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="nome" className={rotulo}>
            Nome ou apelido
          </label>
          <input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como você chama ele na mesa"
            className={`mt-2 ${campo}`}
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className={rotulo}>
            WhatsApp
          </label>
          <input
            id="whatsapp"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(00) 00000-0000"
            className={`font-cv-mono cv-num mt-2 ${campo}`}
          />
          {/* O enquadramento importa: proteção do jogador, não exigência do clube. */}
          <p className="cv-text-soft mt-2 flex gap-1.5 text-[12px] leading-snug">
            <Info className="cv-live-text mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span className="italic">
              "É o número que recebe o comprovante das suas fichas. Sem ele, não consigo
              registrar."
            </span>
          </p>

          {/* A16: o par já existe. Em vez de recusar e apagar tudo, o app mostra
              quem é e oferece o caminho de usar o cadastro que já está lá. */}
          {duplicado ? (
            <div className="cv-panel-quiet mt-3 rounded-xl p-3.5">
              <p className="cv-text text-[13px] leading-snug">
                <strong>{duplicado}</strong> já está cadastrado com esse nome e esse
                WhatsApp. Não precisa cadastrar de novo.
              </p>
              {onUsarExistente ? (
                <button
                  type="button"
                  onClick={() => onUsarExistente(nome, whatsapp)}
                  className="cv-ch-live cv-btn cv-shine mt-2.5 h-11 w-full text-[13.5px]"
                >
                  Sentar {duplicado} na mesa
                </button>
              ) : null}
            </div>
          ) : null}

          {/* A17: pai e filho, casal, quem divide o aparelho. É permitido — mas
              o operador confirma, porque um erro de digitação no nome partiria
              o histórico de uma pessoa só em dois cadastros. */}
          {precisaConfirmarOutraPessoa ? (
            <label className="cv-ch-limite cv-accent-fill cv-accent-ring mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl p-3.5">
              <input
                type="checkbox"
                checked={confirmouOutraPessoa}
                onChange={(e) => setConfirmouOutraPessoa(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-amber-500"
              />
              <span className="cv-accent-text text-[13px] leading-relaxed">
                Esse WhatsApp já é de <strong>{dono}</strong>. Confirmo que{' '}
                <strong>{nome.trim() || 'este jogador'}</strong> é outra pessoa.
              </span>
            </label>
          ) : null}
        </div>

        <div>
          <label htmlFor="cpf" className={rotulo}>
            CPF <span className="normal-case opacity-70">— opcional</span>
          </label>
          <input
            id="cpf"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Só se o jogador quiser dar"
            className={`font-cv-mono cv-num mt-2 ${campo}`}
          />
        </div>

        <div>
          <label htmlFor="limite" className={rotulo}>
            Limite de crédito
          </label>
          <div className="cv-panel-quiet cv-line mt-2 flex items-center rounded-xl border focus-within:ring-2">
            <span className="cv-text-soft font-cv-mono pl-3.5 opacity-70">R$</span>
            <input
              id="limite"
              inputMode="numeric"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              placeholder="0"
              className="cv-text font-cv-mono cv-num h-12 w-full bg-transparent px-2.5 text-right text-[15px] font-bold outline-none placeholder:opacity-25"
            />
          </div>
        </div>

        <label className="cv-panel-quiet flex cursor-pointer items-start gap-2.5 rounded-xl p-3.5">
          <input
            type="checkbox"
            checked={consentiu}
            onChange={(e) => setConsentiu(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-cyan-600"
          />
          <span className="cv-text-soft text-[13px] leading-relaxed">
            O jogador autorizou o registro do nome, do WhatsApp e do histórico de fichas
            desta sessão.
          </span>
        </label>
      </div>

      {/* Nao ha botao de liberar sem WhatsApp. E de proposito, e e a regra N15. */}
      <div className="mt-6 flex gap-2">
        {onCancelar ? (
          <button
            type="button"
            onClick={onCancelar}
            className="cv-btn-quiet h-12 flex-1 text-[13.5px] focus-visible:ring-2 focus-visible:outline-none"
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="button"
          disabled={!completo}
          onClick={() =>
            onCadastrar?.({
              nome,
              whatsapp,
              cpf: cpf || undefined,
              limite: numeroLimite,
              confirmouOutraPessoa,
            })
          }
          className="cv-ch-live cv-btn cv-shine h-12 flex-1 text-[13.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-0 disabled:hover:translate-y-0"
        >
          <UserPlus className="size-4 shrink-0" aria-hidden="true" />
          Cadastrar e sentar
        </button>
      </div>
    </section>
  )
}
