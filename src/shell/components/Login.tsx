import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, TriangleAlert, User } from 'lucide-react'
import { FundoDePoker } from './FundoDePoker'
import { MarcaStackTrack } from './MarcaStackTrack'

/**
 * ⚠️ ISTO NÃO É AUTENTICAÇÃO. É UMA PORTA DE DEMONSTRAÇÃO.
 *
 * O par abaixo viaja dentro do JavaScript que o navegador baixa — qualquer
 * pessoa lê em dois cliques no DevTools. Ele existe para a demo ter uma porta
 * de entrada e para o desenho da tela existir, não para proteger nada.
 *
 * O PRD do Caixa Vivo coloca login fora do escopo da release 1: "um operador,
 * um clube, uma sessão aberta, sem níveis de permissão". Quando a autenticação
 * de verdade entrar, ela precisa de servidor, senha com hash e sessão — e esta
 * tela vira só a camada visual disso.
 */
const CREDENCIAL_DA_DEMO = { usuario: 'anderson', senha: '3129' } as const

export interface LoginProps {
  /** Nome do clube, no rodapé. Contexto de onde o operador está entrando. */
  clube?: string
  onEntrar: (usuario: string) => void
}

export function Login({ clube = 'Clube Paris', onEntrar }: LoginProps) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const confere =
      usuario.trim().toLowerCase() === CREDENCIAL_DA_DEMO.usuario &&
      senha === CREDENCIAL_DA_DEMO.senha

    if (!confere) {
      // Uma mensagem só para os dois campos: dizer qual dos dois errou entrega
      // metade da resposta a quem está tentando adivinhar.
      setErro('Usuário ou senha não confere.')
      setSenha('')
      return
    }
    setErro(null)
    onEntrar(usuario.trim())
  }

  const campo =
    'cv-text font-cv-sans h-13 w-full bg-transparent pr-3 pl-11 text-[15px] outline-none placeholder:opacity-40'

  return (
    <div
      data-cv-tema="escuro"
      className="cv-kiosk cv-grain cv-text font-cv-sans relative isolate flex min-h-screen items-center justify-center px-5 py-10"
    >
      {/* A mesa de poker atrás de tudo: fichas, cartas e naipes que respondem
          ao ponteiro. Fica sob o véu do próprio componente, para não competir
          com o formulário. */}
      <FundoDePoker />

      <div className="relative z-10 w-full max-w-sm">
        {/* O anel da ficha em volta da marca. Parado de propósito: a cena atrás
            já dá vida à tela, e uma animação em laço aqui deixaria o aparelho
            da mesa repintando a noite inteira sem ninguém olhando. */}
        <div className="relative mb-9 flex flex-col items-center text-center">
          <span
            className="cv-live-text pointer-events-none absolute -top-10 left-1/2 aspect-square w-72 -translate-x-1/2 rounded-full border-[12px] border-dashed opacity-[0.09]"
            aria-hidden="true"
          />

          <div className="relative">
            <MarcaStackTrack tamanho="lg" brilho empilhada />
          </div>

          {/* StackTrack é a plataforma; Caixa Vivo é o que está atrás desta
              porta. A serifa separa os dois sem precisar de rótulo. */}
          <h1 className="cv-text-soft font-cv-display relative mt-5 text-[22px] leading-none italic">
            Caixa Vivo
          </h1>
          <p className="cv-text-soft cv-engraved relative mt-3 text-[9.5px] font-semibold tracking-[0.22em] uppercase">
            Release 1 · {clube}
          </p>
        </div>

        <form onSubmit={enviar} className="cv-panel cv-ticks cv-rise rounded-2xl p-6">
          <div>
            <label
              htmlFor="usuario"
              className="cv-text-soft cv-engraved block text-[9.5px] font-semibold tracking-[0.16em] uppercase"
            >
              Operador
            </label>
            <div className="cv-panel-quiet cv-line relative mt-2 flex items-center rounded-xl border focus-within:ring-2">
              <User
                className="cv-text-soft pointer-events-none absolute left-3.5 size-4 opacity-60"
                aria-hidden="true"
              />
              <input
                id="usuario"
                name="usuario"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value)
                  setErro(null)
                }}
                placeholder="seu usuário"
                className={campo}
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="senha"
              className="cv-text-soft cv-engraved block text-[9.5px] font-semibold tracking-[0.16em] uppercase"
            >
              Senha
            </label>
            <div className="cv-panel-quiet cv-line relative mt-2 flex items-center rounded-xl border focus-within:ring-2">
              <Lock
                className="cv-text-soft pointer-events-none absolute left-3.5 size-4 opacity-60"
                aria-hidden="true"
              />
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                inputMode={mostrarSenha ? 'text' : 'numeric'}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value)
                  setErro(null)
                }}
                placeholder="••••"
                className={`${campo} font-cv-mono cv-num pr-12 tracking-[0.2em]`}
              />
              {/* O operador digita de pé, com uma mão, sob pressão. Poder
                  conferir o que digitou evita a terceira tentativa. */}
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Esconder a senha' : 'Mostrar a senha'}
                className="cv-text-soft hover:cv-text absolute right-3 rounded p-1 transition-colors"
              >
                {mostrarSenha ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {erro ? (
            <p
              role="alert"
              className="cv-ch-suspender cv-accent-text cv-accent-fill mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12.5px] font-medium"
            >
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!usuario.trim() || !senha}
            className="cv-ch-live cv-btn cv-shine mt-6 h-14 w-full text-[14.5px] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-0 disabled:hover:translate-y-0"
          >
            Entrar no caixa
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </button>

          <p className="cv-text-soft mt-4 text-center text-[11px] leading-relaxed">
            O nome de quem entra fica registrado em cada lançamento da noite.
          </p>
        </form>

        {/* A dica existe porque isto é uma demonstração, e esconder a senha de
            quem vai apresentar não protege nada — só atrapalha. */}
        <p className="cv-text-soft mt-5 text-center text-[11px] leading-relaxed">
          Demonstração ·{' '}
          <span className="cv-text font-cv-mono cv-num">
            {CREDENCIAL_DA_DEMO.usuario} / {CREDENCIAL_DA_DEMO.senha}
          </span>
        </p>
      </div>
    </div>
  )
}
