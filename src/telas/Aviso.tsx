import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useNoite } from '@/estado/NoiteProvider'

/**
 * O que o app acabou de dizer. Some sozinho, mas nunca engole uma recusa.
 *
 * Sem esta tarja, toda regra que o `reducer` recusa — limite sem motivo escrito,
 * rake numa hora sem turno, segunda sessão no mesmo clube, teto de contingência
 * estourado — vira um toque que não faz nada. O operador fica olhando a tela,
 * sem saber se o aparelho travou ou se ele fez algo errado, e tenta de novo.
 */
export function Aviso() {
  const { noite, limparAviso } = useNoite()

  useEffect(() => {
    if (!noite.aviso) return
    const id = setTimeout(limparAviso, 6000)
    return () => clearTimeout(id)
  }, [noite.aviso, limparAviso])

  if (!noite.aviso) return null

  return (
    // No topo, logo abaixo da faixa do caixa: é onde o operador acabou de
    // tocar, e não disputa a borda de baixo com nada.
    <div
      role="status"
      className="cv-panel cv-rise fixed inset-x-3 top-[120px] z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl p-3.5 backdrop-blur-xl md:top-[80px] md:right-3 md:left-auto md:mx-0"
    >
      <span
        className="cv-live-text cv-chip-rail w-[3px] shrink-0 self-stretch rounded-full"
        aria-hidden="true"
      />
      <p className="cv-text flex-1 text-[12.5px] leading-snug">{noite.aviso}</p>
      <button
        type="button"
        onClick={limparAviso}
        aria-label="Fechar aviso"
        className="cv-text-soft hover:cv-text shrink-0 rounded p-0.5 transition-colors"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
