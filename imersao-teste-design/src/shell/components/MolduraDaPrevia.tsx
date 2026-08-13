import type { ReactNode } from 'react'
import { TituloDeTela } from './TituloDeTela'

export interface MolduraDaPreviaProps {
  sobretitulo?: string
  titulo: string
  descricao?: string
  acessorio?: ReactNode
  /** `largo` para o painel, que usa duas colunas; `normal` para as demais. */
  largura?: 'normal' | 'largo'
  children: ReactNode
}

/**
 * A moldura das previas isoladas de cada secao, dentro do Design OS.
 *
 * Ela existe por um motivo pratico: os componentes do produto leem os tokens
 * `--cv-*`, e esses tokens sao ligados pelo atributo `data-cv-tema` que o
 * AppShell poe na raiz. Sem o AppShell — que e o caso das previas — nao ha
 * quem ligue o tema, e a secao apareceria com a chapa escura do produto sobre
 * a pagina clara do Design OS.
 *
 * Nao faz parte do produto exportado. No produto, quem faz este papel e o
 * AppShell.
 */
export function MolduraDaPrevia({
  sobretitulo,
  titulo,
  descricao,
  acessorio,
  largura = 'normal',
  children,
}: MolduraDaPreviaProps) {
  return (
    <div
      data-cv-tema="escuro"
      className="cv-room cv-grain cv-text font-cv-sans relative isolate min-h-full"
    >
      <div
        className={`relative z-10 mx-auto w-full px-4 py-7 sm:px-6 ${
          largura === 'largo' ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        <TituloDeTela
          sobretitulo={sobretitulo}
          titulo={titulo}
          descricao={descricao}
          acessorio={acessorio}
        />
        {children}
      </div>
    </div>
  )
}
