import type { ReactNode } from 'react'

export interface TituloDeTelaProps {
  /** Rotulo gravado acima do titulo. Onde o operador esta, no vocabulario do PRD. */
  sobretitulo?: string
  titulo: string
  /** Uma linha, no maximo. O painel nao e lugar de paragrafo. */
  descricao?: string
  /** Numero ou acao alinhada a direita. */
  acessorio?: ReactNode
}

/**
 * O cabecalho das telas.
 *
 * Existe como peca do shell, e nao repetido em cada secao, porque a altura do
 * titulo e a distancia ate o primeiro painel sao o que faz seis telas
 * diferentes parecerem o mesmo aplicativo.
 */
export function TituloDeTela({
  sobretitulo,
  titulo,
  descricao,
  acessorio,
}: TituloDeTelaProps) {
  return (
    <header className="cv-rise mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        {sobretitulo ? (
          <p className="cv-text-soft cv-engraved text-[9.5px] font-semibold tracking-[0.2em] uppercase">
            {sobretitulo}
          </p>
        ) : null}
        <h1 className="cv-text font-cv-display mt-1.5 text-[30px] leading-[1.05] sm:text-[38px]">
          {titulo}
        </h1>
        {descricao ? (
          <p className="cv-text-soft mt-2 max-w-lg text-[13px] leading-relaxed">
            {descricao}
          </p>
        ) : null}
      </div>
      {acessorio ? <div className="shrink-0">{acessorio}</div> : null}
    </header>
  )
}
